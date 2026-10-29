import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import client, { getImageUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, 
  Calendar, 
  Tag, 
  Sparkles, 
  ShieldCheck, 
  User, 
  Clock, 
  CheckCircle, 
  Trash2, 
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

const ItemDetailPage = () => {
  const { reportId } = useParams();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Claim modal state
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [proofDetails, setProofDetails] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [claimSuccess, setClaimSuccess] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await client.get(`/reports/${reportId}`);
      setReport(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportId]);

  const handleMarkResolved = async () => {
    if (!window.confirm('Mark this item as resolved/recovered?')) return;
    setActionLoading(true);
    try {
      await client.patch(`/reports/${reportId}/status`, { status: 'resolved' });
      fetchReport();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update report status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this report permanently?')) return;
    setActionLoading(true);
    try {
      await client.delete(`/reports/${reportId}`);
      navigate('/my-reports');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete report.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await client.post('/claims/', {
        report_id: reportId,
        proof_details: proofDetails.trim(),
        contact_info: contactInfo.trim()
      });
      setClaimSuccess(true);
      setTimeout(() => {
        setShowClaimModal(false);
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
          <span className="visually-hidden">Loading item details...</span>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger mx-auto" style={{ maxWidth: '500px' }}>
          {error || 'Item report not found.'}
        </div>
        <Link to="/browse" className="btn btn-primary-gradient">Back to Browse</Link>
      </div>
    );
  }

  const isOwner = user && user.id === report.user_id;
  const isLost = report.report_type === 'lost';
  const imgUrl = getImageUrl(report.image_url);

  return (
    <div className="container py-4">
      {/* Back button */}
      <div className="mb-3">
        <button onClick={() => navigate(-1)} className="btn btn-sm btn-light border d-inline-flex align-items-center gap-1">
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <div className="row g-4">
        {/* Left Column: Image Display */}
        <div className="col-lg-5">
          <div className="card premium-card border-0 overflow-hidden sticky-top" style={{ top: '80px' }}>
            <div className="bg-light d-flex align-items-center justify-content-center" style={{ minHeight: '340px' }}>
              {imgUrl ? (
                <img 
                  src={imgUrl} 
                  alt={report.title} 
                  className="img-fluid w-100 object-fit-contain" 
                  style={{ maxHeight: '440px' }}
                />
              ) : (
                <div className="p-5 text-center text-muted">
                  <Tag size={48} className="opacity-50 mb-2" />
                  <p className="small mb-0">No photograph was attached to this report.</p>
                </div>
              )}
            </div>
            {/* Image AI Status */}
            <div className="p-3 bg-white border-top small text-muted d-flex align-items-center justify-content-between">
              <span>Vision Model: <strong>CLIP ViT-B-32</strong></span>
              <span className="badge bg-success-subtle text-success">
                {report.image_url ? 'Vectorized' : 'Dynamic Weight Adjusted'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Information & Actions */}
        <div className="col-lg-7">
          <div className="card premium-card border-0 p-4">
            {/* Header Badges */}
            <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <span className={isLost ? 'badge-lost fs-6' : 'badge-found fs-6'}>
                  {isLost ? '🔍 Lost Item' : '🎁 Found Item'}
                </span>
                <span className={report.status === 'resolved' ? 'badge-status-resolved' : 'badge-status-open'}>
                  Status: {report.status.toUpperCase()}
                </span>
              </div>
              <small className="text-muted">
                Reported by: <strong>{report.user_name || 'Anonymous User'}</strong>
              </small>
            </div>

            {/* Title */}
            <h2 className="fw-bold text-dark mb-3">{report.title}</h2>

            {/* Key Attributes Pills */}
            <div className="d-flex flex-wrap gap-2 mb-4">
              <div className="p-2 px-3 bg-light rounded-3 border small">
                <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>CATEGORY</span>
                <span className="fw-semibold text-dark">{report.category}</span>
              </div>
              <div className="p-2 px-3 bg-light rounded-3 border small">
                <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>COLOR</span>
                <span className="fw-semibold text-dark d-flex align-items-center gap-1">
                  <span 
                    className="d-inline-block rounded-circle" 
                    style={{ width: '8px', height: '8px', backgroundColor: report.color.toLowerCase() === 'white' ? '#cbd5e1' : report.color.toLowerCase() }}
                  />
                  {report.color}
                </span>
              </div>
              <div className="p-2 px-3 bg-light rounded-3 border small">
                <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>INCIDENT DATE</span>
                <span className="fw-semibold text-dark">
                  {new Date(report.incident_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Description Section */}
            <div className="mb-4">
              <h6 className="fw-bold text-secondary text-uppercase small mb-2">Item Description</h6>
              <div className="p-3 bg-light rounded-3 border text-dark" style={{ lineHeight: '1.6' }}>
                {report.description}
              </div>
            </div>

            {/* Location Section */}
            <div className="mb-4">
              <h6 className="fw-bold text-secondary text-uppercase small mb-2">Reported Location</h6>
              <div className="p-3 bg-light rounded-3 border d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <MapPin size={20} className="text-danger flex-shrink-0" />
                  <div>
                    <div className="fw-semibold text-dark">{report.location_name}</div>
                    {report.latitude && report.longitude && (
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                        GPS: {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                      </small>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="d-flex flex-wrap gap-2 pt-3 border-top">
              <Link 
                to={`/reports/${report.id}/matches`} 
                className="btn btn-primary-gradient px-4 py-2 d-flex align-items-center gap-2"
              >
                <Sparkles size={18} />
                View AI Potential Matches
              </Link>

              {/* Claim Button (only if not owner and item not resolved) */}
              {!isOwner && report.status === 'open' && (
                <button 
                  className="btn btn-outline-success px-4 py-2 d-flex align-items-center gap-2"
                  onClick={() => setShowClaimModal(true)}
                >
                  <ShieldCheck size={18} />
                  Claim This Item
                </button>
              )}

              {/* Owner Controls */}
              {isOwner && report.status === 'open' && (
                <button 
                  className="btn btn-outline-secondary px-3 py-2 d-flex align-items-center gap-1"
                  onClick={handleMarkResolved}
                  disabled={actionLoading}
                >
                  <CheckCircle size={16} />
                  Mark as Resolved
                </button>
              )}

              {(isOwner || isAdmin) && (
                <button 
                  className="btn btn-outline-danger px-3 py-2 d-flex align-items-center gap-1 ms-auto"
                  onClick={handleDelete}
                  disabled={actionLoading}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      {showClaimModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Submit Ownership Claim</h5>
                <button type="button" className="btn-close" onClick={() => setShowClaimModal(false)} />
              </div>
              <div className="modal-body">
                {claimSuccess ? (
                  <div className="text-center py-4">
                    <CheckCircle size={48} className="text-success mb-2" />
                    <h5 className="fw-bold">Claim Submitted!</h5>
                    <p className="text-muted small">The reporter has been notified to review your proof.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitClaim}>
                    <div className="alert alert-info small py-2 px-3 mb-3">
                      🔒 <strong>Confidential Proof:</strong> Detail private markings, serial numbers, or internal contents that only the true owner would know.
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary">Private Identifying Proof</label>
                      <textarea
                        className="form-control rounded-3"
                        rows={3}
                        placeholder="e.g. Serial number ends with 4921, slight tear on internal lining, student ID card inside..."
                        value={proofDetails}
                        onChange={(e) => setProofDetails(e.target.value)}
                        required
                        minLength={10}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label small fw-semibold text-secondary">Your Contact Information</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="Email or phone number for the finder to reach you"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        required
                      />
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                      <button type="button" className="btn btn-light border" onClick={() => setShowClaimModal(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-success fw-semibold">
                        Submit Verification Claim
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

export default ItemDetailPage;
