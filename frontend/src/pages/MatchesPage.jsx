import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import client, { getImageUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import MatchScoreBadge from '../components/MatchScoreBadge';
import { 
  Sparkles, 
  RefreshCw, 
  MapPin, 
  Calendar, 
  Tag, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Sliders,
  Layers,
  Cpu,
  Eye
} from 'lucide-react';

const MatchesPage = () => {
  const { reportId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const [currentReport, setCurrentReport] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState(location.state?.message || '');

  // Claim modal state
  const [claimingMatch, setClaimingMatch] = useState(null);
  const [proofDetails, setProofDetails] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [claimSuccess, setClaimSuccess] = useState(false);

  const loadData = async () => {
    try {
      const [repRes, matchRes] = await Promise.all([
        client.get(`/reports/${reportId}`),
        client.get(`/matches/report/${reportId}`)
      ]);
      setCurrentReport(repRes.data);
      setMatches(matchRes.data || []);
    } catch (err) {
      console.error('Failed to load matches data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [reportId]);

  const handleRerunMatching = async () => {
    setRefreshing(true);
    setStatusMessage('');
    try {
      const res = await client.post(`/matches/run-match/${reportId}`);
      setMatches(res.data || []);
      setStatusMessage('AI Matching Engine re-executed. Candidate rankings updated!');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to re-run matching.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleUpdateMatchStatus = async (matchId, newStatus) => {
    try {
      await client.patch(`/matches/${matchId}/status`, { status: newStatus });
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status: newStatus } : m));
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update match status.');
    }
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!claimingMatch) return;

    // Determine target report to claim (the opposite report)
    const targetReportId = claimingMatch.lost_report_id === reportId 
      ? claimingMatch.found_report_id 
      : claimingMatch.lost_report_id;

    try {
      await client.post('/claims/', {
        report_id: targetReportId,
        match_id: claimingMatch.id,
        proof_details: proofDetails.trim(),
        contact_info: contactInfo.trim()
      });
      setClaimSuccess(true);
      setTimeout(() => {
        setClaimingMatch(null);
        setClaimSuccess(false);
        setProofDetails('');
        setContactInfo('');
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit claim.');
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Executing AI Matching Engine...</span>
        </div>
        <p className="text-muted small mt-2">Computing CLIP & Sentence Transformer similarities...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Top Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <Link to={`/reports/${reportId}`} className="btn btn-sm btn-light border mb-2 d-inline-flex align-items-center gap-1">
            <ArrowLeft size={14} />
            Back to Report
          </Link>
          <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <Sparkles className="text-primary" />
            AI Potential Match Candidates
          </h2>
          <p className="text-muted small mb-0">
            Comparing: <strong>{currentReport?.title}</strong> ({currentReport?.report_type.toUpperCase()})
          </p>
        </div>

        <button 
          className="btn btn-outline-primary d-flex align-items-center gap-2 px-3 py-2 rounded-3"
          onClick={handleRerunMatching}
          disabled={refreshing}
        >
          <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Analyzing...' : 'Re-run AI Matching'}
        </button>
      </div>

      {statusMessage && (
        <div className="alert alert-success small py-2 px-3 mb-4 rounded-3 d-flex align-items-center gap-2">
          <CheckCircle size={16} />
          <div>{statusMessage}</div>
        </div>
      )}

      {/* Matching Algorithm Weights Card */}
      <div className="card premium-card border-0 p-3 mb-4 bg-light">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <Sliders size={18} className="text-primary" />
            <span className="fw-bold small text-dark">Multimodal Scoring Formula:</span>
          </div>
          <div className="d-flex flex-wrap gap-2 small">
            <span className="badge bg-white text-secondary border">Vision (CLIP ViT-B-32): <strong>40%</strong></span>
            <span className="badge bg-white text-secondary border">Text (all-MiniLM-L6-v2): <strong>30%</strong></span>
            <span className="badge bg-white text-secondary border">Color Match: <strong>10%</strong></span>
            <span className="badge bg-white text-secondary border">Location Proximity: <strong>10%</strong></span>
            <span className="badge bg-white text-secondary border">Date Feasibility: <strong>10%</strong></span>
          </div>
        </div>
      </div>

      {/* Match Results */}
      {matches.length === 0 ? (
        <div className="card premium-card border-0 p-5 text-center">
          <div className="bg-light p-3 rounded-circle d-inline-flex mb-3 text-muted mx-auto">
            <Sparkles size={36} />
          </div>
          <h4 className="fw-bold text-dark mb-2">No Potential Matches Above Threshold</h4>
          <p className="text-muted small mb-3 mx-auto" style={{ maxWidth: '500px' }}>
            We scanned all current active reports of the opposing type. Currently, none exceed the minimum compatibility threshold (45%). As more reports are submitted, new matches will automatically appear.
          </p>
          <button className="btn btn-primary-gradient px-4 py-2 mx-auto" onClick={handleRerunMatching}>
            Re-run Analysis
          </button>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {matches.map((m, index) => {
            const lost = m.lost_report;
            const found = m.found_report;
            const lostImg = getImageUrl(lost?.image_url);
            const foundImg = getImageUrl(found?.image_url);

            return (
              <div key={m.id} className="card premium-card border-0 p-4">
                {/* Match Rank & Total Score Bar */}
                <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2 pb-3 border-bottom">
                  <div className="d-flex align-items-center gap-3">
                    <span className="badge bg-dark rounded-circle p-2 fs-6" style={{ width: '32px', height: '32px' }}>
                      #{index + 1}
                    </span>
                    <MatchScoreBadge score={m.total_score} size="lg" />
                    <span className="text-muted small">
                      Match Status: <strong className="text-uppercase text-dark">{m.status}</strong>
                    </span>
                  </div>

                  {/* Actions on match */}
                  <div className="d-flex align-items-center gap-2">
                    <button 
                      className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                      onClick={() => setClaimingMatch(m)}
                    >
                      <ShieldCheck size={16} />
                      Claim This Item
                    </button>
                    {m.status !== 'rejected' && (
                      <button 
                        className="btn btn-sm btn-light border text-muted"
                        onClick={() => handleUpdateMatchStatus(m.id, 'rejected')}
                        title="Dismiss Match"
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Side-by-Side Comparison Grid */}
                <div className="row g-4 mb-4">
                  {/* Lost Item Card */}
                  <div className="col-md-6">
                    <div className="p-3 rounded-3 border bg-light h-100">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="badge-lost">🔍 Lost Item</span>
                        <small className="text-muted">{lost?.user_name}</small>
                      </div>

                      <div className="d-flex gap-3 align-items-start">
                        <div className="bg-white rounded-3 border overflow-hidden flex-shrink-0" style={{ width: '90px', height: '90px' }}>
                          {lostImg ? (
                            <img src={lostImg} alt={lost?.title} className="w-100 h-100 object-fit-cover" />
                          ) : (
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted small">No Pic</div>
                          )}
                        </div>
                        <div className="flex-grow-1 overflow-hidden">
                          <h6 className="fw-bold mb-1 text-truncate">{lost?.title}</h6>
                          <div className="small text-muted mb-1 text-truncate"><MapPin size={12} className="text-danger" /> {lost?.location_name}</div>
                          <div className="small text-muted"><Calendar size={12} className="text-primary" /> {lost?.incident_date}</div>
                        </div>
                      </div>
                      <p className="small text-secondary mt-2 mb-0" style={{ lineHeight: '1.4' }}>
                        {lost?.description}
                      </p>
                    </div>
                  </div>

                  {/* Found Item Card */}
                  <div className="col-md-6">
                    <div className="p-3 rounded-3 border bg-light h-100">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="badge-found">🎁 Found Item</span>
                        <small className="text-muted">{found?.user_name}</small>
                      </div>

                      <div className="d-flex gap-3 align-items-start">
                        <div className="bg-white rounded-3 border overflow-hidden flex-shrink-0" style={{ width: '90px', height: '90px' }}>
                          {foundImg ? (
                            <img src={foundImg} alt={found?.title} className="w-100 h-100 object-fit-cover" />
                          ) : (
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted small">No Pic</div>
                          )}
                        </div>
                        <div className="flex-grow-1 overflow-hidden">
                          <h6 className="fw-bold mb-1 text-truncate">{found?.title}</h6>
                          <div className="small text-muted mb-1 text-truncate"><MapPin size={12} className="text-danger" /> {found?.location_name}</div>
                          <div className="small text-muted"><Calendar size={12} className="text-primary" /> {found?.incident_date}</div>
                        </div>
                      </div>
                      <p className="small text-secondary mt-2 mb-0" style={{ lineHeight: '1.4' }}>
                        {found?.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 5-Component AI Breakdown Progress Meters */}
                <div className="bg-white rounded-3 p-3 border mb-3">
                  <h6 className="fw-bold small text-uppercase text-secondary mb-3 d-flex align-items-center gap-1">
                    <Layers size={14} className="text-primary" />
                    Multi-Attribute Similarity Breakdown
                  </h6>
                  <div className="row g-3">
                    <div className="col-md-4 col-sm-6">
                      <div className="small text-muted d-flex justify-content-between mb-1">
                        <span>Vision (CLIP Embeddings):</span>
                        <strong>{Math.round(m.image_score * 100)}%</strong>
                      </div>
                      <div className="progress" style={{ height: '6px' }}>
                        <div className="progress-bar bg-primary" style={{ width: `${Math.round(m.image_score * 100)}%` }} />
                      </div>
                    </div>

                    <div className="col-md-4 col-sm-6">
                      <div className="small text-muted d-flex justify-content-between mb-1">
                        <span>Text Semantics (MiniLM):</span>
                        <strong>{Math.round(m.text_score * 100)}%</strong>
                      </div>
                      <div className="progress" style={{ height: '6px' }}>
                        <div className="progress-bar bg-info" style={{ width: `${Math.round(m.text_score * 100)}%` }} />
                      </div>
                    </div>

                    <div className="col-md-4 col-sm-6">
                      <div className="small text-muted d-flex justify-content-between mb-1">
                        <span>Color Affinity:</span>
                        <strong>{Math.round(m.color_score * 100)}%</strong>
                      </div>
                      <div className="progress" style={{ height: '6px' }}>
                        <div className="progress-bar bg-warning" style={{ width: `${Math.round(m.color_score * 100)}%` }} />
                      </div>
                    </div>

                    <div className="col-md-6 col-sm-6">
                      <div className="small text-muted d-flex justify-content-between mb-1">
                        <span>Geospatial Proximity (Haversine):</span>
                        <strong>{Math.round(m.location_score * 100)}%</strong>
                      </div>
                      <div className="progress" style={{ height: '6px' }}>
                        <div className="progress-bar bg-success" style={{ width: `${Math.round(m.location_score * 100)}%` }} />
                      </div>
                    </div>

                    <div className="col-md-6 col-sm-6">
                      <div className="small text-muted d-flex justify-content-between mb-1">
                        <span>Chronological Feasibility:</span>
                        <strong>{Math.round(m.date_score * 100)}%</strong>
                      </div>
                      <div className="progress" style={{ height: '6px' }}>
                        <div className="progress-bar bg-secondary" style={{ width: `${Math.round(m.date_score * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Explainable AI Tags */}
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className="small fw-semibold text-secondary">Matching Factors:</span>
                  {m.explanation_tags?.map((tag, tIdx) => (
                    <span key={tIdx} className="ai-reason-chip">
                      <Sparkles size={12} className="text-primary" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Claim Modal */}
      {claimingMatch && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Submit Ownership Claim for Potential Match</h5>
                <button type="button" className="btn-close" onClick={() => setClaimingMatch(null)} />
              </div>
              <div className="modal-body">
                {claimSuccess ? (
                  <div className="text-center py-4">
                    <CheckCircle size={48} className="text-success mb-2" />
                    <h5 className="fw-bold">Claim Request Submitted!</h5>
                    <p className="text-muted small">The opposing user has received a notification to verify your proof.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitClaim}>
                    <div className="alert alert-info small py-2 px-3 mb-3">
                      🔒 <strong>Private Proof:</strong> Provide specific details (e.g. serial numbers, stickers, internal contents) so the finder can authenticate your ownership.
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary">Proof Details</label>
                      <textarea
                        className="form-control rounded-3"
                        rows={3}
                        placeholder="e.g. Keyring has a miniature red swiss logo, wallet contains student card ID 9481..."
                        value={proofDetails}
                        onChange={(e) => setProofDetails(e.target.value)}
                        required
                        minLength={10}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label small fw-semibold text-secondary">Contact Method</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="Email or phone"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        required
                      />
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                      <button type="button" className="btn btn-light border" onClick={() => setClaimingMatch(null)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-success fw-semibold">
                        Confirm & Submit Claim
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchesPage;
