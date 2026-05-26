import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from './services/api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Review from './pages/Review';
import { 
  Leaf, 
  BarChart3, 
  Upload as UploadIcon, 
  ClipboardCheck, 
  LogOut,
  User,
  ShieldCheck
} from 'lucide-react';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuth = authService.isAuthenticated();
  return isAuth ? children : <Navigate to="/login" replace />;
};

// Sidebar Nav Item Helper
const SidebarLink = ({ to, icon: Icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
        isActive 
          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold shadow-md shadow-emerald-500/5 glow-border-emerald' 
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
      }`}
    >
      <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
      <span>{children}</span>
    </Link>
  );
};

// Main Layout Wrapper
const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const username = authService.getCurrentUser() || 'analyst';

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#0B0F19]">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-slate-800/80 bg-slate-950/40 backdrop-blur-md flex flex-col justify-between p-6 shrink-0 sticky top-0 h-screen">
        <div className="space-y-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-all">
            <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center shadow-md">
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white font-sans">
              Breathe <span className="text-emerald-400">ESG</span>
            </span>
          </Link>

          {/* Links */}
          <nav className="flex flex-col gap-2">
            <SidebarLink to="/dashboard" icon={BarChart3}>Dashboard</SidebarLink>
            <SidebarLink to="/upload" icon={UploadIcon}>Ingestion Hub</SidebarLink>
            <SidebarLink to="/review" icon={ClipboardCheck}>Analyst Review</SidebarLink>
          </nav>
        </div>

        {/* Bottom User Info & Logout */}
        <div className="space-y-4 pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-slate-300 border border-slate-700/50">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate m-0">{username}</p>
              <p className="text-[10px] text-slate-500 font-medium truncate m-0">Breathe ESG Corp</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 transition-all font-medium text-xs focus:outline-none"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto px-8 py-8 relative">
        {/* Glow backdrop decorative */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/[0.03] rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto">
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
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/upload" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Upload />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/review" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Review />
              </MainLayout>
            </ProtectedRoute>
          } 
        />

        {/* Catch-all redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
