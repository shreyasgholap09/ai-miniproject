import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client, { getImageUrl } from '../api/client';
import { 
  PlusCircle, 
  Sparkles, 
  CheckCircle, 
  Trash2, 
  MapPin, 
  Calendar, 
  Tag, 
  Eye,
  Layers
} from 'lucide-react';

const MyReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await client.get('/reports/my');
      setReports(res.data || []);
    } catch (err) {
      console.error('Failed to load my reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleMarkResolved = async (reportId) => {
    if (!window.confirm('Mark this report as resolved/recovered?')) return;
    try {
      await client.patch(`/reports/${reportId}/status`, { status: 'resolved' });
      fetchReports();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status.');
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Delete this report?')) return;
    try {
      await client.delete(`/reports/${reportId}`);
      fetchReports();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete report.');
    }
  };

  const filteredReports = reports.filter(r => {
    if (filterType === 'lost') return r.report_type === 'lost';
    if (filterType === 'found') return r.report_type === 'found';
    if (filterType === 'open') return r.status === 'open';
    if (filterType === 'resolved') return r.status === 'resolved';
    return true;
  });

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <Layers className="text-primary" />
            My Reported Items
          </h2>
          <p className="text-muted small mb-0">Manage all your lost and found submissions, monitor AI matches, and mark items resolved.</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Link to="/report?type=lost" className="btn btn-sm btn-lost-action d-flex align-items-center gap-1">
            <PlusCircle size={16} />
            Report Lost
          </Link>
          <Link to="/report?type=found" className="btn btn-sm btn-found-action d-flex align-items-center gap-1">
            <PlusCircle size={16} />
            Report Found
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="btn-group p-1 bg-light rounded-3 mb-4" role="group">
        <button 
          className={`btn btn-sm px-3 fw-semibold ${filterType === 'all' ? 'btn-white bg-white shadow-sm text-primary' : 'btn-light text-muted'}`}
          onClick={() => setFilterType('all')}
        >
          All ({reports.length})
        </button>
        <button 
          className={`btn btn-sm px-3 fw-semibold ${filterType === 'lost' ? 'btn-white bg-white shadow-sm text-danger' : 'btn-light text-muted'}`}
          onClick={() => setFilterType('lost')}
        >
          Lost Only ({reports.filter(r => r.report_type === 'lost').length})
        </button>
        <button 
          className={`btn btn-sm px-3 fw-semibold ${filterType === 'found' ? 'btn-white bg-white shadow-sm text-success' : 'btn-light text-muted'}`}
          onClick={() => setFilterType('found')}
        >
          Found Only ({reports.filter(r => r.report_type === 'found').length})
        </button>
        <button 
          className={`btn btn-sm px-3 fw-semibold ${filterType === 'open' ? 'btn-white bg-white shadow-sm text-primary' : 'btn-light text-muted'}`}
          onClick={() => setFilterType('open')}
        >
          Active Open ({reports.filter(r => r.status === 'open').length})
        </button>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading reports...</span>
          </div>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="card premium-card border-0 p-5 text-center">
          <p className="text-muted small mb-0">No reports found for this filter.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredReports.map((report) => {
            const isLost = report.report_type === 'lost';
            const imgUrl = getImageUrl(report.image_url);

            return (
              <div key={report.id} className="card premium-card border-0 p-3">
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                  {/* Left: Thumbnail & Details */}
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-light rounded-3 border overflow-hidden flex-shrink-0" style={{ width: '80px', height: '80px' }}>
                      {imgUrl ? (
                        <img src={imgUrl} alt={report.title} className="w-100 h-100 object-fit-cover" />
                      ) : (
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted small">No Pic</div>
                      )}
                    </div>

                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                        <span className={isLost ? 'badge-lost' : 'badge-found'}>
                          {report.report_type}
                        </span>
                        <span className={report.status === 'resolved' ? 'badge-status-resolved' : 'badge-status-open'}>
                          {report.status}
                        </span>
                        <span className="badge bg-light text-secondary border small">{report.category}</span>
                      </div>

                      <h5 className="fw-bold mb-1 text-dark">{report.title}</h5>

                      <div className="d-flex align-items-center gap-3 small text-muted flex-wrap">
                        <span className="d-flex align-items-center gap-1">
                          <MapPin size={12} className="text-danger" />
                          {report.location_name}
                        </span>
                        <span className="d-flex align-items-center gap-1">
                          <Calendar size={12} className="text-primary" />
                          {report.incident_date}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <Link 
                      to={`/reports/${report.id}/matches`} 
                      className="btn btn-primary-gradient btn-sm px-3 py-2 d-flex align-items-center gap-1"
                    >
                      <Sparkles size={14} />
                      AI Matches
                    </Link>
                    <Link 
                      to={`/reports/${report.id}`} 
                      className="btn btn-light border btn-sm px-3 py-2"
                    >
                      <Eye size={14} />
                    </Link>

                    {report.status === 'open' && (
                      <button 
                        className="btn btn-outline-secondary btn-sm px-2 py-2"
                        onClick={() => handleMarkResolved(report.id)}
                        title="Mark as Resolved"
                      >
                        <CheckCircle size={14} />
                      </button>
                    )}

                    <button 
                      className="btn btn-outline-danger btn-sm px-2 py-2"
                      onClick={() => handleDelete(report.id)}
                      title="Delete Report"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyReportsPage;
