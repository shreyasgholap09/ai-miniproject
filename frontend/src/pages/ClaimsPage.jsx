import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Inbox, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  User, 
  Mail, 
  Phone, 
  FileText 
} from 'lucide-react';

const ClaimsPage = () => {
  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'submitted'
  const [myClaims, setMyClaims] = useState([]);
  const [receivedClaims, setReceivedClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const [submittedRes, receivedRes] = await Promise.all([
        client.get('/claims/my-claims'),
        client.get('/claims/received')
      ]);
      setMyClaims(submittedRes.data || []);
      setReceivedClaims(receivedRes.data || []);
    } catch (err) {
      console.error('Failed to load claims', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleReviewClaim = async (claimId, status) => {
    const action = status === 'approved' ? 'APPROVE this claim and mark item resolved' : 'REJECT this claim';
    if (!window.confirm(`Are you sure you want to ${action}?`)) return;

    setReviewLoading(true);
    try {
      await client.patch(`/claims/${claimId}/review`, { status });
      await fetchClaims();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to review claim.');
    } finally {
      setReviewLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'approved') return <span className="badge bg-success">Approved</span>;
    if (status === 'rejected') return <span className="badge bg-danger">Rejected</span>;
    return <span className="badge bg-warning text-dark">Pending Review</span>;
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <Inbox className="text-primary" />
            Ownership Claims & Verification
          </h2>
          <p className="text-muted small mb-0">
            Review confidential proof submitted for your found items or track claims you filed.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="btn-group p-1 bg-light rounded-3 mb-4" role="group">
        <button
          className={`btn btn-sm px-4 fw-semibold ${activeTab === 'received' ? 'btn-white bg-white shadow-sm text-primary' : 'btn-light text-muted'}`}
          onClick={() => setActiveTab('received')}
        >
          Received Claims to Review ({receivedClaims.length})
        </button>
        <button
          className={`btn btn-sm px-4 fw-semibold ${activeTab === 'submitted' ? 'btn-white bg-white shadow-sm text-primary' : 'btn-light text-muted'}`}
          onClick={() => setActiveTab('submitted')}
        >
          Claims I Submitted ({myClaims.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading claims...</span>
          </div>
        </div>
      ) : activeTab === 'received' ? (
        /* Received Claims to Review */
        <div>
          {receivedClaims.length === 0 ? (
            <div className="card premium-card border-0 p-5 text-center">
              <ShieldCheck size={40} className="text-muted mx-auto mb-2 opacity-50" />
              <h5 className="fw-bold text-dark mb-1">No Received Claims</h5>
              <p className="text-muted small mb-0">When other students claim an item you reported, their verification proof will appear here.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {receivedClaims.map((claim) => (
                <div key={claim.id} className="card premium-card border-0 p-4">
                  <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-bold text-dark fs-5">
                        Claim on: {claim.report?.title || 'Report'}
                      </span>
                      {getStatusBadge(claim.status)}
                    </div>
                    <small className="text-muted">
                      Filed: {new Date(claim.created_at).toLocaleDateString()}
                    </small>
                  </div>

                  {/* Proof Details */}
                  <div className="bg-light p-3 rounded-3 border mb-3">
                    <h6 className="small text-uppercase fw-bold text-secondary mb-1">Confidential Proof Details:</h6>
                    <p className="text-dark mb-0 small" style={{ whiteSpace: 'pre-line' }}>
                      {claim.proof_details}
                    </p>
                  </div>

                  {/* Claimant Contact */}
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pt-2 border-top">
                    <div className="d-flex align-items-center gap-3 small text-muted">
                      <span className="d-flex align-items-center gap-1">
                        <User size={14} className="text-primary" />
                        Claimant ID: <strong className="text-dark">{claim.claimant_id.substring(0, 8)}...</strong>
                      </span>
                      <span className="d-flex align-items-center gap-1">
                        <Mail size={14} className="text-success" />
                        Contact: <strong className="text-dark">{claim.contact_info}</strong>
                      </span>
                    </div>

                    {/* Review Actions if Pending */}
                    {claim.status === 'pending' && (
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-success px-3 fw-semibold d-flex align-items-center gap-1"
                          onClick={() => handleReviewClaim(claim.id, 'approved')}
                          disabled={reviewLoading}
                        >
                          <CheckCircle size={14} />
                          Approve Ownership
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger px-3 fw-semibold d-flex align-items-center gap-1"
                          onClick={() => handleReviewClaim(claim.id, 'rejected')}
                          disabled={reviewLoading}
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Claims I Submitted */
        <div>
          {myClaims.length === 0 ? (
            <div className="card premium-card border-0 p-5 text-center">
              <p className="text-muted small mb-0">You have not submitted any ownership claims yet.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {myClaims.map((claim) => (
                <div key={claim.id} className="card premium-card border-0 p-4">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h6 className="fw-bold text-dark mb-0">
                      Claim on: {claim.report?.title || 'Report Item'}
                    </h6>
                    {getStatusBadge(claim.status)}
                  </div>

                  <p className="text-muted small mb-2">
                    <strong>My Submitted Proof:</strong> {claim.proof_details}
                  </p>

                  <div className="d-flex justify-content-between small text-muted pt-2 border-top">
                    <span>Contact Info Provided: {claim.contact_info}</span>
                    <span>Submitted on: {new Date(claim.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClaimsPage;
