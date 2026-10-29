import React from 'react';
import { Sparkles, Heart, Shield, Cpu, Database, Code2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-top py-5 mt-auto" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="container">
        <div className="row g-4 justify-content-between">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="bg-primary text-white p-2 rounded-3 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                <Sparkles size={16} />
              </div>
              <span className="fw-bold fs-5"><span style={{ color: 'var(--primary-color)' }}>AI</span> Lost & Found</span>
            </div>
            <p className="text-muted small mb-3">
              An intelligent, multimodal matching platform engineered for universities and public institutions. Connects lost belongings to found reports using Sentence Transformers and CLIP image analysis.
            </p>
            <div className="d-flex align-items-center gap-2 text-muted small">
              <span>Computer Engineering Mini Project</span>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold mb-3 text-uppercase text-secondary small">System Architecture</h6>
            <ul className="list-unstyled small text-muted d-flex flex-column gap-2 mb-0">
              <li className="d-flex align-items-center gap-2">
                <Cpu size={14} className="text-primary" />
                <span>Text AI: Sentence Transformers (all-MiniLM-L6-v2)</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <Sparkles size={14} className="text-purple" style={{ color: '#8b5cf6' }} />
                <span>Vision AI: Pretrained CLIP (ViT-B-32)</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <Database size={14} className="text-success" />
                <span>Database: PostgreSQL with SQLAlchemy ORM</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <Code2 size={14} className="text-info" />
                <span>Backend: FastAPI with JWT & Pydantic v2</span>
              </li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-12">
            <h6 className="fw-bold mb-3 text-uppercase text-secondary small">Ethics & Verification Policy</h6>
            <div className="p-3 rounded-3 bg-light border small text-muted">
              <div className="d-flex align-items-center gap-2 fw-semibold text-dark mb-1">
                <Shield size={16} className="text-primary" />
                Probabilistic Matching Notice
              </div>
              This platform highlights potential visual and semantic candidates. Absolute ownership is verified through confidential private proof submissions and administrative review.
            </div>
          </div>
        </div>

        <hr className="my-4" style={{ borderColor: 'var(--border-subtle)' }} />

        <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2 small text-muted">
          <div>
            &copy; {new Date().getFullYear()} AI Lost and Found Items Matcher. All rights reserved.
          </div>
          <div>
            Built with React, Vite, Bootstrap & FastAPI
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
