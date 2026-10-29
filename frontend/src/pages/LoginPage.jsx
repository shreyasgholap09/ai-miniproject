import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogIn, AlertCircle, CheckCircle, Shield } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (persona) => {
    setError('');
    setLoading(true);
    try {
      await demoLogin(persona);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Quick login failed. Ensure the backend is active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-5 col-md-8">
          <div className="card premium-card border-0 p-4 p-sm-5">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="bg-primary text-white p-3 rounded-4 d-inline-flex align-items-center justify-content-center mb-3">
                <Sparkles size={24} />
              </div>
              <h3 className="fw-bold mb-1">Welcome Back</h3>
              <p className="text-muted small">Sign in to report or track your lost and found belongings</p>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 px-3 mb-4 rounded-3" role="alert">
                <AlertCircle size={16} className="flex-shrink-0" />
                <div>{error}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Campus Email Address</label>
                <input
                  type="email"
                  className="form-control py-2 px-3 rounded-3"
                  placeholder="e.g. alex@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-secondary">Password</label>
                <input
                  type="password"
                  className="form-control py-2 px-3 rounded-3"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary-gradient w-100 py-2 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2 mb-3"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="text-center small text-muted mb-4">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-primary fw-semibold text-decoration-none">
                Register here
              </Link>
            </div>

            {/* Demo Accounts Bar */}
            <div className="border-top pt-3">
              <div className="text-uppercase text-secondary text-center small fw-bold mb-2" style={{ fontSize: '0.72rem' }}>
                ⚡ Quick Demonstration Personas
              </div>
              <div className="d-grid gap-2">
                <button 
                  type="button" 
                  className="btn btn-sm btn-light border text-start d-flex justify-content-between align-items-center px-3 py-2"
                  onClick={() => handleQuickLogin('alex')}
                >
                  <span>🎒 <strong>Alex Rivera</strong> (Lost Backpack Owner)</span>
                  <span className="badge bg-danger-subtle text-danger">Lost</span>
                </button>
                <button 
                  type="button" 
                  className="btn btn-sm btn-light border text-start d-flex justify-content-between align-items-center px-3 py-2"
                  onClick={() => handleQuickLogin('jordan')}
                >
                  <span>🔎 <strong>Jordan Lee</strong> (Found Backpack Finder)</span>
                  <span className="badge bg-success-subtle text-success">Found</span>
                </button>
                <button 
                  type="button" 
                  className="btn btn-sm btn-light border text-start d-flex justify-content-between align-items-center px-3 py-2"
                  onClick={() => handleQuickLogin('admin')}
                >
                  <span>🛡️ <strong>Campus Administrator</strong></span>
                  <span className="badge bg-primary-subtle text-primary">Admin</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
