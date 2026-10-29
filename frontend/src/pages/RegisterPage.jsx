import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, UserPlus, AlertCircle } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        password: formData.password
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-5 col-md-8">
          <div className="card premium-card border-0 p-4 p-sm-5">
            <div className="text-center mb-4">
              <div className="bg-primary text-white p-3 rounded-4 d-inline-flex align-items-center justify-content-center mb-3">
                <Sparkles size={24} />
              </div>
              <h3 className="fw-bold mb-1">Create an Account</h3>
              <p className="text-muted small">Join the campus network to report and recover lost belongings</p>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 px-3 mb-4 rounded-3" role="alert">
                <AlertCircle size={16} className="flex-shrink-0" />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control py-2 px-3 rounded-3"
                  placeholder="e.g. Alex Rivera"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Campus Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-control py-2 px-3 rounded-3"
                  placeholder="e.g. alex@campus.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Phone Number (Optional)</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control py-2 px-3 rounded-3"
                  placeholder="e.g. 555-0101"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control py-2 px-3 rounded-3"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-secondary">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control py-2 px-3 rounded-3"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
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
                    <UserPlus size={18} />
                    Register Account
                  </>
                )}
              </button>
            </form>

            <div className="text-center small text-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-primary fw-semibold text-decoration-none">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
