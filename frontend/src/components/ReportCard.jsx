import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, Sparkles, Eye, ArrowRight } from 'lucide-react';
import { getImageUrl } from '../api/client';

const ReportCard = ({ report }) => {
  const isLost = report.report_type === 'lost';
  const imgUrl = getImageUrl(report.image_url);

  return (
    <div className="card premium-card premium-card-hover h-100 overflow-hidden border-0">
      {/* Top Image Container */}
      <div className="position-relative bg-light" style={{ height: '200px', overflow: 'hidden' }}>
        {imgUrl ? (
          <img 
            src={imgUrl} 
            alt={report.title} 
            className="w-100 h-100 object-fit-cover transition"
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = 'https://placehold.co/600x400/e2e8f0/475569?text=No+Photo';
            }}
          />
        ) : (
          <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-muted bg-light">
            <Tag size={32} className="opacity-50 mb-1" />
            <span className="small fw-medium">No Photograph Attached</span>
          </div>
        )}

        {/* Badges Overlay */}
        <div className="position-absolute top-0 start-0 m-3 d-flex gap-2">
          <span className={isLost ? 'badge-lost' : 'badge-found'}>
            {isLost ? '🔍 Lost Item' : '🎁 Found Item'}
          </span>
        </div>

        {report.status !== 'open' && (
          <div className="position-absolute top-0 end-0 m-3">
            <span className="badge-status-resolved text-uppercase">
              {report.status}
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="card-body p-3 d-flex flex-column">
        {/* Category & Color chips */}
        <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
          <span className="badge bg-light text-secondary border small">
            {report.category}
          </span>
          <span className="badge bg-light text-secondary border small d-flex align-items-center gap-1">
            <span 
              className="d-inline-block rounded-circle" 
              style={{ 
                width: '8px', 
                height: '8px', 
                backgroundColor: report.color.toLowerCase() === 'white' ? '#e2e8f0' : report.color.toLowerCase() 
              }}
            />
            {report.color}
          </span>
        </div>

        {/* Title */}
        <h6 className="card-title fw-bold text-dark mb-2 text-truncate" title={report.title}>
          {report.title}
        </h6>

        {/* Description snippet */}
        <p className="card-text text-muted small mb-3 flex-grow-1" style={{ 
          display: '-webkit-box', 
          WebkitLineClamp: 2, 
          WebkitBoxOrient: 'vertical', 
          overflow: 'hidden' 
        }}>
          {report.description}
        </p>

        {/* Metadata Details */}
        <div className="d-flex flex-column gap-1 small text-muted mb-3 pt-2 border-top">
          <div className="d-flex align-items-center gap-2 text-truncate" title={report.location_name}>
            <MapPin size={14} className="text-danger flex-shrink-0" />
            <span className="text-truncate">{report.location_name}</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Calendar size={14} className="text-primary flex-shrink-0" />
            <span>{new Date(report.incident_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="d-flex align-items-center gap-2 pt-2 border-top mt-auto">
          <Link 
            to={`/reports/${report.id}`} 
            className="btn btn-sm btn-light border flex-grow-1 d-flex align-items-center justify-content-center gap-1 py-2 fw-semibold"
          >
            <Eye size={14} />
            Details
          </Link>
          <Link 
            to={`/reports/${report.id}/matches`} 
            className="btn btn-sm btn-primary-gradient px-3 py-2 d-flex align-items-center gap-1"
            title="View AI Potential Matches"
          >
            <Sparkles size={14} />
            AI Matches
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
