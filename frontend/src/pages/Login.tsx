import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <img src="/logo.png" alt="RKS Logo" style={{ height: 120, width: 'auto', objectFit: 'contain', margin: '0 auto' }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              id="username"
              className="form-input"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="password"
              className="form-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: 'var(--text-muted)' }}>
          RKS Internal System — LAN Access Only
        </p>
      </div>
    </div>
  );
}
