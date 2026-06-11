import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { Capacitor } from '@capacitor/core';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) { setError('Username and password are required'); return; }
    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Login Error:", err);
      const serverError = err.response?.data?.error || err.response?.data?.message;
      const networkError = err.response ? null : (err.message || 'Network error connecting to server');
      setError(serverError || networkError || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  const isSuspendedError = error && error.toLowerCase().includes('account is suspended');

  if (Capacitor.isNativePlatform()) {
    return (
      <div style={{ 
        display: 'flex', flexDirection: 'column', minHeight: '100vh', 
        background: 'var(--bg-base)', fontFamily: 'Inter, sans-serif', 
        padding: '24px', alignItems: 'center', justifyContent: 'center' 
      }}>
        <style>{`
          @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(20px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .app-entry-anim {
            animation: fadeSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>
        
        <div className="app-entry-anim" style={{ 
          width: '100%', maxWidth: '400px', 
          background: 'var(--bg-surface)', 
          border: '1px solid var(--border-color)', 
          borderRadius: '24px', padding: '40px 32px', 
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', 
          display: 'flex', flexDirection: 'column', alignItems: 'center' 
        }}>
          
          <img src="/app-logo.png" alt="App Logo" style={{ height: '110px', width: '110px', objectFit: 'contain', borderRadius: '50%', marginBottom: '24px', background: '#fff', padding: '5px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
          
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px', textAlign: 'center' }}>Sign in to continue to Shop RKS</p>

          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {error && !isSuspendedError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '12px', fontSize: '14px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Username</label>
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '16px', outline: 'none' }}
                autoComplete="username"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '16px', outline: 'none' }}
                autoComplete="current-password"
              />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700, marginTop: '8px', cursor: 'pointer', transition: 'transform 0.2s, opacity 0.2s', opacity: loading ? 0.7 : 1, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

        </div>

        <div style={{ marginTop: 'auto', paddingTop: '40px', paddingBottom: '20px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.6' }}>
            &copy; {new Date().getFullYear()} RKS Software Cell.<br />
            All Rights Reserved.<br />
            Unauthorized access is strictly prohibited.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)', fontFamily: 'Inter, sans-serif' }}>
      
      {/* LEFT PANEL - Branding & Developer Info */}
      <div style={{ 
        flex: 1, 
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        padding: '40px',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '120%', height: '120%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 10%, transparent 10.5%)', backgroundSize: '20px 20px', opacity: 0.3 }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/" style={{ display: 'inline-block', background: '#fff', padding: '12px 24px', borderRadius: 12, textDecoration: 'none', color: 'var(--color-primary)', fontWeight: 800, marginBottom: 40 }}>
            ← Back to Home
          </Link>
          <img src="/logo.png" alt="RKS Logo" style={{ height: 100, objectFit: 'contain', background: '#fff', padding: 10, borderRadius: 12, marginBottom: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
          <h1 style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}>
            RKS Internal<br/>Management System
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: 400, lineHeight: 1.5 }}>
            Secure portal for staff and administrators. Manage billing, transactions, and analytics seamlessly.
          </p>
        </div>

        {/* Developer Badge */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(0,0,0,0.2)', padding: '16px 24px', borderRadius: 16, backdropFilter: 'blur(10px)', width: 'fit-content' }}>
          <img src="/developer.jpeg" alt="Hemapriyan R K" style={{ width: 50, height: 50, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.5)', objectFit: 'cover' }} />
          <div>
            <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.8, fontWeight: 600 }}>System Developed By</div>
            <Link to="/developer" style={{ color: '#fff', textDecoration: 'none', fontWeight: 800, fontSize: 16 }}>
              Hemapriyan R K →
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Login Form */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '40px'
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Welcome back</h2>
            <p style={{ color: 'var(--text-muted)' }}>Enter your credentials to access the system</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {error && !isSuspendedError && (
              <div className="alert alert-error">
                <span style={{ fontSize: 16 }}>⚠️</span> {error}
              </div>
            )}

            {isSuspendedError && (
              <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.5)', zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
              }}>
                <div style={{ background: 'var(--bg-surface)', padding: 32, borderRadius: 16, maxWidth: 400, width: '90%', textAlign: 'center', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
                  <h3 style={{ fontSize: 24, fontWeight: 800, color: 'var(--red)', marginBottom: 12 }}>Account Suspended</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.5 }}>{error}</p>
                  <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={() => setError('')}>Close</button>
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Username</label>
              <input
                id="username"
                className="form-input"
                type="text"
                placeholder="e.g. johndoe"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus
                autoComplete="username"
                style={{ height: 48, fontSize: 16 }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Password</label>
              <input
                id="password"
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ height: 48, fontSize: 16 }}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ height: 48, fontSize: 16, marginTop: 8, fontWeight: 700 }}>
              {loading ? <><span className="spinner" style={{ width: 18, height: 18, marginRight: 8 }} /> Signing in...</> : 'Sign In to Dashboard'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: 'var(--text-muted)' }}>
            🔒 Restricted access. All login attempts are logged and monitored.
          </p>
        </div>
      </div>
      
      {/* Mobile Styles */}
      <style>{`
        @media (max-width: 768px) {
          .login-page { flex-direction: column !important; }
          .login-page > div:first-child { 
            flex: none !important; 
            padding: 30px 20px !important; 
          }
          .login-page h1 { font-size: 2rem !important; }
          .login-page > div:last-child {
            padding: 30px 20px !important;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </div>
  );
}
