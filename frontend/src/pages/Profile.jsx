import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { User, Mail, Lock, CheckCircle, LogOut, Building, ShieldCheck } from 'lucide-react';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
          Profile Settings
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          Manage your ESG user account profile information
        </p>
      </div>

      {/* Two Column Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '32px',
        alignItems: 'start'
      }}>
        {/* Left Column: Form Card */}
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

        {/* Right Column: Brand Showcase and Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Visual Showcase Card */}
          <div className="card" style={{
            padding: '36px 32px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: '20px',
            borderRadius: '14px',
            border: 'none',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.3)'
          }}>
            {/* Ambient gradients */}
            <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)', top: '-60px', right: '-60px' }} />
            <div style={{ position: 'absolute', width: '150px', height: '150px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)', bottom: '-40px', left: '-40px' }} />

            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 8px 16px -4px rgba(0,0,0,0.3)',
              zIndex: 1
            }}>
              <img
                src="/logo.png"
                alt="Breathe ESG Logo"
                style={{ width: '48px', height: '48px', objectFit: 'contain' }}
              />
            </div>

            <div style={{ zIndex: 1 }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px', color: '#ffffff', letterSpacing: '-0.3px' }}>
                Breathe <span style={{ color: '#10b981' }}>ESG</span>
              </h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: 1.5, maxWidth: '320px' }}>
                Empowering organizations to build reliable, high-integrity sustainability pipelines with precision automation.
              </p>
            </div>
          </div>

          {/* Scope Card */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={16} style={{ color: '#10b981' }} />
              Scope of Operations
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Designation</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>ESG Analyst</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Assigned Company</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>Demo Corp</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Security Clearance</span>
                <span style={{
                  fontWeight: 600,
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.08)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <ShieldCheck size={12} /> Authorized
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Ingestion Privilege</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>Read & Write</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
