import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { AlertCircle, User, Lock, Mail, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail]       = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree]       = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError]       = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading]   = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (authService.isAuthenticated()) navigate('/dashboard');
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (!agree) {
        setError('You must agree to the Terms & Conditions.');
        return;
      }
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await authService.register(username, password, email);
        setSuccessMessage('Account created successfully! You can now sign in.');
        setIsSignUp(false);
        setPassword('');
        setConfirmPassword('');
      } else {
        await authService.login(username, password);
        navigate('/dashboard');
      }
    } catch (err) {
      if (isSignUp) {
        setError(err.response?.data?.error || 'Registration failed. Please try again.');
      } else {
        setError('Invalid username or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', padding: '32px 24px',
    }}>
      {/* Dynamic ESG Vector Background (Wind Turbines + Earth Glow) */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '35vh',
        background: 'linear-gradient(to top, rgba(16, 185, 129, 0.06) 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      {/* Earth Glow in corner */}
      <div style={{
        position: 'absolute', bottom: '-200px', right: '-200px', width: '600px', height: '600px',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      {/* Clean Wind Turbine SVG Backdrop */}
      <svg style={{ position: 'absolute', bottom: 0, left: '5%', width: '180px', height: '240px', opacity: 0.15, pointerEvents: 'none', zIndex: 0 }} viewBox="0 0 100 150">
        <line x1="50" y1="150" x2="50" y2="60" stroke="#10b981" strokeWidth="2" />
        <circle cx="50" cy="60" r="3" fill="#10b981" />
        {/* Rotor blades */}
        <path d="M50 60 L30 45 M50 60 L70 45 M50 60 L50 90" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <svg style={{ position: 'absolute', bottom: 0, right: '8%', width: '220px', height: '290px', opacity: 0.15, pointerEvents: 'none', zIndex: 0 }} viewBox="0 0 100 150">
        <line x1="50" y1="150" x2="50" y2="40" stroke="#10b981" strokeWidth="2.5" />
        <circle cx="50" cy="40" r="4" fill="#10b981" />
        <path d="M50 40 L25 20 M50 40 L75 20 M50 40 L50 75" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
      </svg>

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }} className="fade-up">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img
            src="/logo.png"
            alt="Breathe ESG"
            style={{ width: '60px', height: '60px', objectFit: 'contain', margin: '0 auto 16px', display: 'block' }}
          />

          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Breathe <span style={{ color: '#10b981' }}>ESG</span>
          </h1>
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
            Enterprise Carbon & Sustainability Platform
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          background: '#111827', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px', padding: '32px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: '0 0 4px' }}>
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 24px' }}>
            {isSignUp ? 'Join Breathe ESG and drive sustainability.' : 'Welcome back! Please enter your details.'}
          </p>

          {successMessage && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '8px', padding: '12px 14px', marginBottom: '20px',
              fontSize: '13px', color: '#10b981', lineHeight: 1.4
            }}>
              {successMessage}
            </div>
          )}

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px', padding: '12px 14px', marginBottom: '20px',
              fontSize: '13px', color: '#f87171',
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Username */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="Enter username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  style={{ paddingLeft: '38px', background: '#0b0f19', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#ffffff' }}
                />
              </div>
            </div>

            {/* Email (only in Signup mode) */}
            {isSignUp && (
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                  <input
                    type="email"
                    required
                    className="input"
                    placeholder="Enter email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ paddingLeft: '38px', background: '#0b0f19', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#ffffff' }}
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                  Password
                </label>
                {!isSignUp && (
                  <a href="#forgot" style={{ fontSize: '11px', color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>
                    Forgot password?
                  </a>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input"
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingLeft: '38px', paddingRight: '40px', background: '#0b0f19', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#ffffff' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#6b7280' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (only in Signup mode) */}
            {isSignUp && (
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className="input"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    style={{ paddingLeft: '38px', paddingRight: '40px', background: '#0b0f19', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#ffffff' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#6b7280' }}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* Agreement Checkbox (only in Signup mode) */}
            {isSignUp && (
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', margin: '4px 0 0' }}>
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={e => setAgree(e.target.checked)}
                  style={{ marginTop: '3px', accentColor: '#10b981' }}
                />
                <span style={{ fontSize: '12px', color: '#9ca3af', lineHeight: 1.4 }}>
                  I agree to the <span style={{ color: '#10b981', fontWeight: 600 }}>Terms & Conditions</span> and <span style={{ color: '#10b981', fontWeight: 600 }}>Privacy Policy</span>
                </span>
              </label>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: '6px', fontSize: '14px', background: '#10b981', color: '#ffffff' }}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: '14px', height: '14px', borderTopColor: '#fff' }} />{' '}
                  {isSignUp ? 'Creating Account...' : 'Signing in...'}
                </>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {/* Toggle Link */}
          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px' }}>
            <span style={{ color: '#9ca3af' }}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccessMessage('');
              }}
              style={{
                background: 'none', border: 'none', color: '#10b981', fontWeight: 600,
                cursor: 'pointer', padding: 0, fontSize: '13px',
              }}
            >
              {isSignUp ? 'Sign In' : 'Create Account'}
            </button>
          </div>

          {/* Credentials Hint (only in Sign In mode) */}
          {!isSignUp && (
            <div style={{
              marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                Quick Demo Access
              </p>
              <div style={{
                background: '#0b0f19', borderRadius: '8px', padding: '12px 14px',
                border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '6px',
              }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                  Username: <code style={{ color: '#10b981', fontSize: '12px', fontFamily: 'monospace', fontWeight: 600 }}>analyst</code>
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                  Password: <code style={{ color: '#10b981', fontSize: '12px', fontFamily: 'monospace', fontWeight: 600 }}>password123</code>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
