import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '../../context/AuthContext';
import { io, Socket } from 'socket.io-client';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function Layout({ children, title }: LayoutProps) {
  const { user, logout, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [broadcast, setBroadcast] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Socket connection
  useEffect(() => {
    if (!token) return;

    // Connect to Socket.IO
    const socket: Socket = io(window.location.origin, {
      path: '/api/socket.io',
      auth: { token },
      transports: ['websocket']
    });

    socket.on('connect', () => {
      console.log('[SOCKET] Connected to real-time server');
    });

    socket.on('notification', (data: any) => {
      console.log('[SOCKET] Received notification:', data);
      
      if (data.type === 'MESSAGE') {
        setBroadcast(data.message);
      } else if (data.type === 'KICK') {
        alert(data.message || 'Your session has been terminated.');
        logout();
        navigate('/login');
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [token, logout, navigate]);

  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="app-layout">
      <div 
        className={`mobile-backdrop ${isMobileMenuOpen ? 'visible' : ''}`} 
        onClick={() => setIsMobileMenuOpen(false)} 
      />
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      <div className="main-content">
        <Topbar 
          title={title || 'RKS Management'} 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
        />
        <main className="page-content" style={{ flex: 1 }}>
          {broadcast && (
            <div style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              padding: '24px',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              <div style={{ 
                maxWidth: 450, 
                width: '100%', 
                backgroundColor: 'var(--bg-elevated)',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 20px rgba(var(--color-primary-rgb), 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                animation: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, var(--color-primary), #ff8c00)',
                  padding: '32px 24px',
                  textAlign: 'center',
                  color: 'white'
                }}>
                  <div style={{ 
                    fontSize: 56, 
                    marginBottom: 16,
                    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))'
                  }}>📢</div>
                  <h2 style={{ 
                    margin: 0, 
                    fontSize: 24, 
                    fontWeight: 900, 
                    letterSpacing: '-0.5px',
                    textTransform: 'uppercase'
                  }}>System Notification</h2>
                </div>
                
                <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                  <div style={{ 
                    maxHeight: '200px', 
                    overflowY: 'auto', 
                    marginBottom: '32px',
                    padding: '0 8px'
                  }}>
                    <p style={{ 
                      fontSize: 18, 
                      lineHeight: 1.6, 
                      margin: 0, 
                      color: 'var(--text-primary)',
                      fontWeight: 500,
                      wordBreak: 'break-word'
                    }}>
                      {broadcast}
                    </p>
                  </div>
                  
                  <button 
                    className="btn btn-primary btn-lg" 
                    style={{ 
                      width: '100%', 
                      borderRadius: '14px',
                      height: '56px',
                      fontSize: '18px',
                      fontWeight: 700,
                      boxShadow: '0 10px 15px -3px rgba(var(--color-primary-rgb), 0.3)'
                    }}
                    onClick={() => setBroadcast(null)}
                  >
                    Acknowledged
                  </button>
                  
                  <div style={{ marginTop: 20, fontSize: 11, color: 'var(--text-muted)', opacity: 0.6 }}>
                    RKS MANAGEMENT SYSTEM • SECURE REAL-TIME
                  </div>
                </div>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
