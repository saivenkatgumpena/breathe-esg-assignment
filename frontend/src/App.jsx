import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from './services/api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Review from './pages/Review';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import { LayoutDashboard, Upload as UploadIcon, ClipboardCheck, BarChart2, FileText, User, LogOut } from 'lucide-react';
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
        padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
        fontWeight: isActive ? 600 : 500, textDecoration: 'none',
        color: isActive ? '#059669' : '#475569',
        background: isActive ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}}
      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}}
    >
      <Icon size={16} style={{ color: isActive ? '#10b981' : '#64748b', flexShrink: 0 }} />
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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px', flexShrink: 0, position: 'sticky', top: 0, height: '100vh',
        background: '#ffffff', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '24px 16px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', padding: '4px 6px' }}>
          <img
            src="/logo.png"
            alt="Breathe ESG"
            style={{ width: '32px', height: '32px', objectFit: 'contain', flexShrink: 0 }}
          />
          <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>
            Breathe <span style={{ color: '#10b981' }}>ESG</span>
          </span>
        </Link>

        {/* Section label */}
        <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 6px', marginBottom: '10px' }}>
          Navigation
        </div>

        {/* Nav links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/upload"    icon={UploadIcon}      label="Ingestion Hub" />
          <NavItem to="/review"    icon={ClipboardCheck}  label="Analyst Review" />
          <NavItem to="/analytics" icon={BarChart2}       label="Analytics & Insights" />
          <NavItem to="/reports"   icon={FileText}        label="Reports" />
          <NavItem to="/profile"   icon={User}            label="Profile" />
        </nav>

        {/* User footer */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 8px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
              background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <User size={15} color="#10b981" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {username.charAt(0).toUpperCase() + username.slice(1)}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                ESG Analyst
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
              padding: '10px 12px', borderRadius: '8px', border: '1px solid transparent',
              background: 'transparent', color: '#64748b', fontSize: '13px', fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = 'transparent'; }}
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '36px', background: 'var(--bg-primary)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }} className="fade-up">
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
        <Route path="/analytics" element={<ProtectedRoute><MainLayout><Analytics /></MainLayout></ProtectedRoute>} />
        <Route path="/reports"   element={<ProtectedRoute><MainLayout><Reports /></MainLayout></ProtectedRoute>} />
        <Route path="/profile"   element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
