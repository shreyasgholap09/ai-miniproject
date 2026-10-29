import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Search, 
  PlusCircle, 
  Bell, 
  User, 
  LogOut, 
  Shield, 
  FileText, 
  Inbox, 
  Menu, 
  X,
  Compass
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, unreadCount, logout, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleDemo = async (role) => {
    try {
      await demoLogin(role);
      setDemoMenuOpen(false);
      navigate('/dashboard');
    } catch (e) {
      alert('Demo login failed. Make sure the backend server is running.');
    }
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top py-2" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2 fw-bold text-dark fs-5">
          <div className="bg-primary text-white p-2 rounded-3 d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <span style={{ color: 'var(--primary-color)' }}>AI</span> Lost & Found
          </div>
        </Link>

        {/* Mobile menu toggle */}
        <button 
          className="navbar-toggler border-0 shadow-none" 
          type="button" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Nav Links */}
        <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`} id="mainNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3 gap-1">
            <li className="nav-item">
              <Link 
                to="/browse" 
                className={`nav-link px-3 py-2 rounded-2 d-flex align-items-center gap-1 ${isActive('/browse') ? 'text-primary fw-bold bg-light' : 'text-secondary'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Compass size={18} />
                Browse Items
              </Link>
            </li>

            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link 
                    to="/dashboard" 
                    className={`nav-link px-3 py-2 rounded-2 ${isActive('/dashboard') ? 'text-primary fw-bold bg-light' : 'text-secondary'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    to="/my-reports" 
                    className={`nav-link px-3 py-2 rounded-2 ${isActive('/my-reports') ? 'text-primary fw-bold bg-light' : 'text-secondary'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Reports
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    to="/claims" 
                    className={`nav-link px-3 py-2 rounded-2 ${isActive('/claims') ? 'text-primary fw-bold bg-light' : 'text-secondary'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Claims
                  </Link>
                </li>
                {isAdmin && (
                  <li className="nav-item">
                    <Link 
                      to="/admin" 
                      className={`nav-link px-3 py-2 rounded-2 text-danger fw-semibold d-flex align-items-center gap-1 ${isActive('/admin') ? 'bg-danger-subtle' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Shield size={16} />
                      Admin Panel
                    </Link>
                  </li>
                )}
              </>
            )}
          </ul>

          {/* Right Action buttons */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* Quick Report Buttons */}
            <Link 
              to="/report?type=lost" 
              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 fw-semibold px-3 py-2 rounded-3"
              onClick={() => setMobileMenuOpen(false)}
            >
              <PlusCircle size={16} />
              Report Lost
            </Link>
            <Link 
              to="/report?type=found" 
              className="btn btn-sm btn-outline-success d-flex align-items-center gap-1 fw-semibold px-3 py-2 rounded-3"
              onClick={() => setMobileMenuOpen(false)}
            >
              <PlusCircle size={16} />
              Report Found
            </Link>

            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-2 ms-lg-2">
                {/* Notification Bell */}
                <Link 
                  to="/notifications" 
                  className="btn btn-light position-relative p-2 rounded-circle border"
                  title="Notifications"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Bell size={18} className="text-secondary" />
                  {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* Profile Link */}
                <Link 
                  to="/profile" 
                  className="btn btn-light d-flex align-items-center gap-2 px-3 py-2 rounded-3 border"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={16} className="text-primary" />
                  <span className="fw-semibold text-truncate" style={{ maxWidth: '120px' }}>
                    {user?.name?.split(' ')[0]}
                  </span>
                  {isAdmin && <span className="badge bg-danger" style={{ fontSize: '0.65rem' }}>Admin</span>}
                </Link>

                {/* Logout Button */}
                <button 
                  onClick={() => { logout(); navigate('/'); }} 
                  className="btn btn-light p-2 rounded-circle border text-muted" 
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2 ms-lg-2">
                {/* Quick Demo Switcher */}
                <div className="dropdown position-relative">
                  <button 
                    className="btn btn-sm btn-light border dropdown-toggle px-3 py-2 rounded-3 fw-medium"
                    onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                  >
                    ⚡ Demo Logins
                  </button>
                  {demoMenuOpen && (
                    <div className="dropdown-menu show position-absolute end-0 shadow-lg border-0 rounded-3 p-2 mt-1" style={{ minWidth: '200px', zIndex: 1050 }}>
                      <h6 className="dropdown-header text-uppercase text-muted small fw-bold">Select Demo Persona</h6>
                      <button className="dropdown-item rounded-2 py-2 small" onClick={() => handleDemo('alex')}>
                        🎒 <strong>Alex</strong> (Lost Backpack)
                      </button>
                      <button className="dropdown-item rounded-2 py-2 small" onClick={() => handleDemo('jordan')}>
                        🔎 <strong>Jordan</strong> (Found Backpack)
                      </button>
                      <button className="dropdown-item rounded-2 py-2 small" onClick={() => handleDemo('sarah')}>
                        🎧 <strong>Sarah</strong> (Lost AirPods)
                      </button>
                      <hr className="my-1" />
                      <button className="dropdown-item rounded-2 py-2 small text-danger" onClick={() => handleDemo('admin')}>
                        🛡️ <strong>Admin Account</strong>
                      </button>
                    </div>
                  )}
                </div>

                <Link to="/login" className="btn btn-sm btn-light border px-3 py-2 rounded-3 fw-semibold">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-sm btn-primary-gradient px-3 py-2 rounded-3">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
