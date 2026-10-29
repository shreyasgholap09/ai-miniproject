import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client, { getImageUrl } from '../api/client';
import MatchScoreBadge from '../components/MatchScoreBadge';
import { 
  PlusCircle, 
  Sparkles, 
  FileText, 
  Inbox, 
  Bell, 
  ArrowRight, 
  MapPin, 
  Calendar,
  CheckCircle,
  Clock
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [myReports, setMyReports] = useState([]);
  const [matches, setMatches] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [repRes, claimsRes] = await Promise.all([
          client.get('/reports/my'),
          client.get('/claims/my-claims')
        ]);
        
        const reports = repRes.data || [];
        setMyReports(reports);
        setMyClaims(claimsRes.data || []);

        // Load matches for the user's reports
        const matchPromises = reports.map(r => client.get(`/matches/report/${r.id}`));
        const matchResponses = await Promise.allSettled(matchPromises);
        
        let collectedMatches = [];
        matchResponses.forEach(res => {
          if (res.status === 'fulfilled' && Array.isArray(res.value.data)) {
            collectedMatches.push(...res.value.data);
          }
        });

        // Deduplicate matches by ID
        const uniqueMatchesMap = new Map();
        collectedMatches.forEach(m => uniqueMatchesMap.set(m.id, m));
        const sorted = Array.from(uniqueMatchesMap.values()).sort((a, b) => b.total_score - a.total_score);
        setMatches(sorted);

      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const activeReports = myReports.filter(r => r.status === 'open');

  return (
    <div className="container py-4">
      {/* Top Welcome Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold mb-1">Hello, {user?.name}! 👋</h2>
          <p className="text-muted small mb-0">
            Welcome to your personal dashboard. Track reported items, view AI candidate matches, and manage claims.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Link to="/report?type=lost" className="btn btn-lost-action d-flex align-items-center gap-1">
            <PlusCircle size={16} />
            Report Lost
          </Link>
          <Link to="/report?type=found" className="btn btn-found-action d-flex align-items-center gap-1">
            <PlusCircle size={16} />
            Report Found
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-sm-6">
          <div className="card premium-card p-3 border-0">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold text-uppercase">My Active Reports</span>
              <div className="bg-primary-subtle text-primary p-2 rounded-3">
                <FileText size={18} />
              </div>
            </div>
            <h3 className="fw-bold mb-0">{activeReports.length}</h3>
            <small className="text-muted">{myReports.length} total reports submitted</small>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card premium-card p-3 border-0">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold text-uppercase">AI Matches Found</span>
              <div className="bg-purple-subtle text-purple p-2 rounded-3" style={{ backgroundColor: '#f3e8ff', color: '#8b5cf6' }}>
                <Sparkles size={18} />
              </div>
            </div>
            <h3 className="fw-bold mb-0 text-primary">{matches.length}</h3>
            <small className="text-muted">Detected across opposing reports</small>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card premium-card p-3 border-0">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold text-uppercase">Claims Filed</span>
              <div className="bg-success-subtle text-success p-2 rounded-3">
                <Inbox size={18} />
              </div>
            </div>
            <h3 className="fw-bold mb-0">{myClaims.length}</h3>
            <small className="text-muted">{myClaims.filter(c => c.status === 'approved').length} claims approved</small>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card premium-card p-3 border-0">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold text-uppercase">Account Status</span>
              <div className="bg-info-subtle text-info p-2 rounded-3">
                <CheckCircle size={18} />
              </div>
            </div>
            <h3 className="fw-bold mb-0 text-success fs-5">Active & Verified</h3>
            <small className="text-muted">Role: <strong className="text-uppercase">{user?.role}</strong></small>
          </div>
        </div>
      </div>

      {/* Top AI Candidate Matches */}
      <div className="card premium-card border-0 p-4 mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-primary text-white p-2 rounded-3">
              <Sparkles size={18} />
            </div>
            <div>
              <h5 className="fw-bold mb-0">Top Potential Matches For Your Items</h5>
              <small className="text-muted">Ranked by multimodal visual, textual, and geospatial compatibility</small>
            </div>
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-4 bg-light rounded-3">
            <p className="text-muted small mb-0">
              No potential matches detected yet. As other students submit reports of the opposing type, matches will automatically surface here.
            </p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {matches.slice(0, 4).map((m) => {
              const lost = m.lost_report;
              const found = m.found_report;
              return (
                <div key={m.id} className="p-3 rounded-3 border bg-light d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <MatchScoreBadge score={m.total_score} size="lg" />
                    <div>
                      <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                        <span className="fw-bold text-dark">{lost?.title}</span>
                        <span className="text-muted small">⇄</span>
                        <span className="fw-bold text-dark">{found?.title}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        {m.explanation_tags?.slice(0, 3).map((tag, i) => (
                          <span key={i} className="ai-reason-chip">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2 flex-shrink-0">
                    <Link to={`/reports/${lost?.id}/matches`} className="btn btn-sm btn-primary-gradient px-3 py-2">
                      Review Match Breakdown
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* My Reports Table Overview */}
      <div className="card premium-card border-0 p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="fw-bold mb-0">My Reported Items</h5>
          <Link to="/my-reports" className="btn btn-sm btn-light border fw-semibold">
            Manage All Reports
          </Link>
        </div>

        {myReports.length === 0 ? (
          <div className="text-center py-4 bg-light rounded-3">
            <p className="text-muted small mb-2">You haven't submitted any lost or found reports yet.</p>
            <div className="d-flex justify-content-center gap-2">
              <Link to="/report?type=lost" className="btn btn-sm btn-outline-danger">Report Lost</Link>
              <Link to="/report?type=found" className="btn btn-sm btn-outline-success">Report Found</Link>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-muted text-uppercase">
                <tr>
                  <th>Type</th>
                  <th>Item Title</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {myReports.slice(0, 5).map(rep => (
                  <tr key={rep.id}>
                    <td>
                      <span className={rep.report_type === 'lost' ? 'badge-lost' : 'badge-found'}>
                        {rep.report_type}
                      </span>
                    </td>
                    <td className="fw-semibold text-dark">{rep.title}</td>
                    <td><span className="badge bg-light text-secondary border">{rep.category}</span></td>
                    <td className="text-muted small">{rep.location_name}</td>
                    <td className="text-muted small">{new Date(rep.incident_date).toLocaleDateString()}</td>
                    <td>
                      <span className={rep.status === 'resolved' ? 'badge-status-resolved' : 'badge-status-open'}>
                        {rep.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <Link to={`/reports/${rep.id}/matches`} className="btn btn-sm btn-primary-gradient me-2">
                        Matches
                      </Link>
                      <Link to={`/reports/${rep.id}`} className="btn btn-sm btn-light border">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
