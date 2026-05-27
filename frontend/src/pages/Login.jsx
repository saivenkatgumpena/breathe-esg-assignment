import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { AlertCircle } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (authService.isAuthenticated()) navigate('/dashboard');
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.login(username, password);
      navigate('/dashboard');
    } catch {
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0f1117', padding: '24px',
    }}>
      {/* Subtle background glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(47,108,240,0.07) 0%, transparent 70%)',
      }} />

      <div className="fade-up" style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img
            src="/logo.png"
            alt="Breathe ESG"
            style={{ width: '56px', height: '56px', objectFit: 'contain', margin: '0 auto 16px', display: 'block' }}
          />

          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#f0f4ff', margin: '0 0 6px', letterSpacing: '-0.4px' }}>
            Breathe <span style={{ color: '#34d399' }}>ESG</span>
          </h1>
          <p style={{ fontSize: '13px', color: '#7a8599', margin: 0 }}>
            Enterprise Carbon & Sustainability Platform
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#161b27', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px', padding: '28px',
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#f0f4ff', margin: '0 0 20px' }}>Sign in to your account</h2>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
              borderRadius: '8px', padding: '11px 14px', marginBottom: '18px',
              fontSize: '13px', color: '#f87171',
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#7a8599', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Username
              </label>
              <input
                type="text"
                required
                className="input"
                placeholder="Enter username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#7a8599', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Password
              </label>
              <input
                type="password"
                required
                className="input"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: '4px', fontSize: '14px' }}
            >
              {loading ? <><span className="spinner" style={{ width: '14px', height: '14px', borderTopColor: '#fff' }} /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          {/* Credentials hint */}
          <div style={{
            marginTop: '20px', paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <p style={{ fontSize: '11px', color: '#4a5568', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              Demo credentials
            </p>
            <div style={{
              background: '#0f1117', borderRadius: '8px', padding: '12px 14px',
              border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '6px',
            }}>
              <div style={{ fontSize: '12px', color: '#7a8599' }}>
                Username: <code style={{ color: '#34d399', fontSize: '12px', fontFamily: 'monospace' }}>analyst</code>
              </div>
              <div style={{ fontSize: '12px', color: '#7a8599' }}>
                Password: <code style={{ color: '#34d399', fontSize: '12px', fontFamily: 'monospace' }}>password123</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
