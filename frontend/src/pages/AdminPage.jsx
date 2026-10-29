import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  TrendingUp, 
  Users, 
  FileText, 
  Sparkles, 
  Inbox, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ToggleLeft, 
  ToggleRight,
  Eye,
  Trash2
} from 'lucide-react';

const AdminPage = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'reports', 'users', 'claims'

  const [stats, setStats] = useState(null);
  const [allReports, setAllReports] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allClaims, setAllClaims] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, reportsRes, usersRes, claimsRes] = await Promise.all([
        client.get('/admin/stats'),
        client.get('/admin/reports'),
        client.get('/admin/users'),
        client.get('/admin/claims')
      ]);
      setStats(statsRes.data);
      setAllReports(reportsRes.data || []);
      setAllUsers(usersRes.data || []);
      setAllClaims(claimsRes.data || []);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const handleModerateReport = async (reportId, action) => {
    setActionLoading(true);
    try {
      await client.patch(`/admin/reports/${reportId}/moderate?action=${action}`);
      await fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Moderation action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleUserActive = async (userId) => {
    try {
      await client.patch(`/admin/users/${userId}/toggle-active`);
      await fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to toggle user status.');
    }
  };

  if (!isAdmin) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger mx-auto" style={{ maxWidth: '500px' }}>
          Access Denied. You must hold an administrator account to view this control panel.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center gap-2 text-dark">
            <Shield className="text-danger" />
            Campus Administrator Control Center
          </h2>
          <p className="text-muted small mb-0">Platform oversight, report moderation, user access control, and claim reviews.</p>
        </div>
        <span className="badge bg-danger fs-6 px-3 py-2">Administrator Mode</span>
      </div>

      {/* Tabs */}
      <div className="btn-group p-1 bg-light rounded-3 mb-4 w-100 flex-wrap" role="group">
        <button
          className={`btn btn-sm py-2 px-3 fw-semibold flex-grow-1 ${activeTab === 'stats' ? 'btn-white bg-white shadow-sm text-danger' : 'btn-light text-muted'}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Platform Analytics
        </button>
        <button
          className={`btn btn-sm py-2 px-3 fw-semibold flex-grow-1 ${activeTab === 'reports' ? 'btn-white bg-white shadow-sm text-danger' : 'btn-light text-muted'}`}
          onClick={() => setActiveTab('reports')}
        >
          📁 Moderation Queue ({allReports.length})
        </button>
        <button
          className={`btn btn-sm py-2 px-3 fw-semibold flex-grow-1 ${activeTab === 'users' ? 'btn-white bg-white shadow-sm text-danger' : 'btn-light text-muted'}`}
          onClick={() => setActiveTab('users')}
        >
          👥 User Accounts ({allUsers.length})
        </button>
        <button
          className={`btn btn-sm py-2 px-3 fw-semibold flex-grow-1 ${activeTab === 'claims' ? 'btn-white bg-white shadow-sm text-danger' : 'btn-light text-muted'}`}
          onClick={() => setActiveTab('claims')}
        >
          🔒 Platform Claims ({allClaims.length})
        </button>
      </div>

      {/* Tab 1: Stats & Analytics */}
      {activeTab === 'stats' && stats && (
        <div>
          <div className="row g-3 mb-4">
            <div className="col-md-3 col-sm-6">
              <div className="card premium-card border-0 p-3">
                <div className="text-muted small fw-semibold text-uppercase mb-1">Total Users</div>
                <h3 className="fw-bold mb-0 text-dark">{stats.total_users}</h3>
                <small className="text-muted">Registered campus accounts</small>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="card premium-card border-0 p-3">
                <div className="text-muted small fw-semibold text-uppercase mb-1">Total Reports</div>
                <h3 className="fw-bold mb-0 text-primary">{stats.total_reports}</h3>
                <small className="text-muted">{stats.lost_reports} lost / {stats.found_reports} found</small>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="card premium-card border-0 p-3">
                <div className="text-muted small fw-semibold text-uppercase mb-1">AI Matches</div>
                <h3 className="fw-bold mb-0 text-purple" style={{ color: '#8b5cf6' }}>{stats.total_matches}</h3>
                <small className="text-muted">Computed by CLIP & MiniLM</small>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="card premium-card border-0 p-3">
                <div className="text-muted small fw-semibold text-uppercase mb-1">Recovery Rate</div>
                <h3 className="fw-bold mb-0 text-success">{stats.recovery_rate_percent}%</h3>
                <small className="text-muted">{stats.resolved_reports} items recovered</small>
              </div>
            </div>
          </div>

          <div className="card premium-card border-0 p-4">
            <h5 className="fw-bold mb-3">System Health & AI Infrastructure</h5>
            <div className="row g-3 small">
              <div className="col-md-4">
                <div className="p-3 bg-light rounded-3 border">
                  <strong>Semantic Model:</strong> sentence-transformers/all-MiniLM-L6-v2<br />
                  <span className="text-muted">384-dimensional dense semantic vectors</span>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3 bg-light rounded-3 border">
                  <strong>Computer Vision Model:</strong> sentence-transformers/clip-ViT-B-32<br />
                  <span className="text-muted">512-dimensional visual CLIP vectors</span>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3 bg-light rounded-3 border">
                  <strong>Database Backend:</strong> PostgreSQL 18 via SQLAlchemy 2.0<br />
                  <span className="text-muted">Normalized tables with index constraints</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Report Moderation */}
      {activeTab === 'reports' && (
        <div className="card premium-card border-0 p-4">
          <h5 className="fw-bold mb-3">Report Moderation Queue</h5>
          <div className="table-responsive">
            <table className="table table-hover align-middle small mb-0">
              <thead className="table-light text-muted text-uppercase">
                <tr>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Reporter</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-end">Moderation</th>
                </tr>
              </thead>
              <tbody>
                {allReports.map((rep) => (
                  <tr key={rep.id}>
                    <td>
                      <span className={rep.report_type === 'lost' ? 'badge-lost' : 'badge-found'}>
                        {rep.report_type}
                      </span>
                    </td>
                    <td className="fw-bold text-dark">{rep.title}</td>
                    <td>{rep.category}</td>
                    <td>{rep.user_name || 'User'}</td>
                    <td>{rep.incident_date}</td>
                    <td>
                      <span className={rep.status === 'moderated' ? 'badge bg-danger' : rep.status === 'resolved' ? 'badge-status-resolved' : 'badge-status-open'}>
                        {rep.status}
                      </span>
                    </td>
                    <td className="text-end">
                      {rep.status === 'moderated' ? (
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => handleModerateReport(rep.id, 'restore_open')}
                          disabled={actionLoading}
                        >
                          Restore Open
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleModerateReport(rep.id, 'flag_spam')}
                          disabled={actionLoading}
                        >
                          Flag / Hide
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: User Accounts */}
      {activeTab === 'users' && (
        <div className="card premium-card border-0 p-4">
          <h5 className="fw-bold mb-3">Registered User Accounts</h5>
          <div className="table-responsive">
            <table className="table table-hover align-middle small mb-0">
              <thead className="table-light text-muted text-uppercase">
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Account Status</th>
                  <th className="text-end">Access Action</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="fw-bold text-dark">{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td><span className="badge bg-light text-dark border text-uppercase">{u.role}</span></td>
                    <td>
                      {u.is_active ? (
                        <span className="badge bg-success-subtle text-success">Active</span>
                      ) : (
                        <span className="badge bg-danger-subtle text-danger">Deactivated</span>
                      )}
                    </td>
                    <td className="text-end">
                      {u.role !== 'admin' && (
                        <button
                          className={`btn btn-sm ${u.is_active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                          onClick={() => handleToggleUserActive(u.id)}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Platform Claims */}
      {activeTab === 'claims' && (
        <div className="card premium-card border-0 p-4">
          <h5 className="fw-bold mb-3">Platform-wide Claims</h5>
          <div className="table-responsive">
            <table className="table table-hover align-middle small mb-0">
              <thead className="table-light text-muted text-uppercase">
                <tr>
                  <th>Claim ID</th>
                  <th>Report Item</th>
                  <th>Proof Details</th>
                  <th>Claimant Contact</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {allClaims.map((claim) => (
                  <tr key={claim.id}>
                    <td className="font-monospace text-muted">{claim.id.substring(0, 8)}...</td>
                    <td className="fw-semibold text-dark">{claim.report?.title || 'Report'}</td>
                    <td style={{ maxWidth: '240px' }} className="text-truncate">{claim.proof_details}</td>
                    <td>{claim.contact_info}</td>
                    <td>
                      <span className={claim.status === 'approved' ? 'badge bg-success' : claim.status === 'rejected' ? 'badge bg-danger' : 'badge bg-warning text-dark'}>
                        {claim.status}
                      </span>
                    </td>
                    <td>{new Date(claim.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
