import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) { setError('Username and password are required'); return; }
    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)', fontFamily: 'Inter, sans-serif' }}>
      
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
            {error && (
              <div className="alert alert-error">
                <span style={{ fontSize: 16 }}>⚠️</span> {error}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Username</label>
              <input
                id="username"
                className="form-input"
                type="text"
                placeholder="admin"
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
      
      {/* Mobile Styles (Inline fallback if flex gets cramped) */}
      <style>{`
        @media (max-width: 768px) {
          .login-page > div:first-child { display: none !important; }
        }
      `}</style>
    </div>
  );
}
