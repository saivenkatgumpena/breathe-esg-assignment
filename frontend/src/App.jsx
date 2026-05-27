import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from './services/api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Review from './pages/Review';
import { LayoutDashboard, Upload as UploadIcon, ClipboardCheck, LogOut, User } from 'lucide-react';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const isAuth = authService.isAuthenticated();
  return isAuth ? children : <Navigate to="/login" replace />;
};

const NavItem = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '9px 12px', borderRadius: '8px', fontSize: '13px',
        fontWeight: isActive ? 600 : 500, textDecoration: 'none',
        color: isActive ? '#f0f4ff' : '#7a8599',
        background: isActive ? 'rgba(47,108,240,0.12)' : 'transparent',
        border: `1px solid ${isActive ? 'rgba(47,108,240,0.25)' : 'transparent'}`,
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#f0f4ff'; }}}
      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7a8599'; }}}
    >
      <Icon size={16} style={{ color: isActive ? '#4f8ef7' : 'currentColor', flexShrink: 0 }} />
      {label}
    </Link>
  );
};

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const username = authService.getCurrentUser() || 'analyst';

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f1117' }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px', flexShrink: 0, position: 'sticky', top: 0, height: '100vh',
        background: '#161b27', borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column', padding: '20px 14px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px', padding: '4px 6px' }}>
          <img
            src="/logo.png"
            alt="Breathe ESG"
            style={{ width: '32px', height: '32px', objectFit: 'contain', flexShrink: 0 }}
          />
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#f0f4ff', letterSpacing: '-0.3px' }}>
            Breathe <span style={{ color: '#34d399' }}>ESG</span>
          </span>
        </Link>

        {/* Section label */}
        <div style={{ fontSize: '10px', fontWeight: 700, color: '#4a5568', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 6px', marginBottom: '8px' }}>
          Navigation
        </div>

        {/* Nav links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/upload"    icon={UploadIcon}      label="Ingestion Hub" />
          <NavItem to="/review"    icon={ClipboardCheck}  label="Analyst Review" />
        </nav>

        {/* User footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 8px' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
              background: 'rgba(47,108,240,0.15)', border: '1px solid rgba(47,108,240,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <User size={14} color="#4f8ef7" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f0f4ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{username}</div>
              <div style={{ fontSize: '11px', color: '#4a5568', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>ESG Analyst</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
              padding: '8px 12px', borderRadius: '8px', border: '1px solid transparent',
              background: 'transparent', color: '#7a8599', fontSize: '13px', fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7a8599'; e.currentTarget.style.borderColor = 'transparent'; }}
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '32px', background: '#0f1117' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }} className="fade-up">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/upload"    element={<ProtectedRoute><MainLayout><Upload /></MainLayout></ProtectedRoute>} />
        <Route path="/review"    element={<ProtectedRoute><MainLayout><Review /></MainLayout></ProtectedRoute>} />
        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
