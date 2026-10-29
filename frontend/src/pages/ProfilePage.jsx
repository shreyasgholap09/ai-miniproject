import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { User, Mail, Phone, Shield, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

const ProfilePage = () => {
  const { user, refreshProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim() || null
      };
      if (password) {
        payload.password = password;
      }

      await client.put('/auth/me', payload);
      await refreshProfile();
      setMessage('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8">
          <div className="card premium-card border-0 p-4 p-md-5">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="bg-primary text-white p-3 rounded-circle d-inline-flex mb-2">
                <User size={32} />
              </div>
              <h3 className="fw-bold mb-1">{user?.name}</h3>
              <div className="d-flex justify-content-center gap-2">
                <span className="badge bg-light text-secondary border">{user?.email}</span>
                <span className="badge bg-primary text-uppercase">{user?.role}</span>
              </div>
            </div>

            {message && (
              <div className="alert alert-success d-flex align-items-center gap-2 small py-2 px-3 mb-4 rounded-3">
                <CheckCircle2 size={16} />
                <div>{message}</div>
              </div>
            )}

            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 px-3 mb-4 rounded-3">
                <AlertCircle size={16} />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleUpdate}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted"><User size={16} /></span>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Email Address (Registered)</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted"><Mail size={16} /></span>
                  <input
                    type="email"
                    className="form-control bg-light"
                    value={user?.email || ''}
                    disabled
                  />
                </div>
                <small className="text-muted" style={{ fontSize: '0.72rem' }}>Email cannot be modified.</small>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-secondary">Phone Number</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted"><Phone size={16} /></span>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="e.g. 555-0101"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <hr className="my-4" />

              <h6 className="fw-bold small text-uppercase text-secondary mb-3 d-flex align-items-center gap-1">
                <KeyRound size={16} className="text-primary" />
                Change Password (Optional)
              </h6>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Leave blank to keep current"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-secondary">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary-gradient w-100 py-2 rounded-3 fw-semibold"
                disabled={loading}
              >
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
