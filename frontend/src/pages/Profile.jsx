import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { User, Mail, Lock, CheckCircle, LogOut } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const initialUsername = authService.getCurrentUser() || 'analyst';
  
  const [username, setUsername] = useState(initialUsername.charAt(0).toUpperCase() + initialUsername.slice(1));
  const [email, setEmail]       = useState(`${initialUsername}@breatheesg.com`);
  const [password, setPassword]   = useState('••••••••••••');
  const [success, setSuccess]     = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setSuccess('');
    // Simulate save changes
    setTimeout(() => {
      setSuccess('Profile settings updated successfully!');
    }, 500);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const labelStyle = { fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' };
  const inputStyle = {
    background: '#ffffff', border: '1px solid var(--border)', borderRadius: '8px',
    color: 'var(--text-primary)', fontSize: '13px', padding: '10px 12px 10px 38px', width: '100%',
    outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '500px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
          Profile Settings
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          Manage your ESG user account profile information
        </p>
      </div>

      {/* Settings Card */}
      <div className="card" style={{ padding: '32px' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {success && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '8px', padding: '12px 14px',
              fontSize: '13px', color: '#10b981',
            }}>
              <CheckCircle size={16} />
              {success}
            </div>
          )}

          {/* Username */}
          <div>
            <label style={labelStyle}>Username</label>
            <div style={{ position: 'relative' }}>
              <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                required
                style={inputStyle}
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="email"
                required
                style={inputStyle}
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="password"
                required
                style={inputStyle}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Buttons Row */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <button type="submit" className="btn-primary" style={{ padding: '10px 24px' }}>
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="btn-ghost"
              style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.04)' }}
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
