import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import ReportCard from '../components/ReportCard';
import SimpleMatcherStudio from '../components/SimpleMatcherStudio';
import { 
  Sparkles, 
  Search, 
  PlusCircle, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight,
  Clock,
  Layers
} from 'lucide-react';

const LandingPage = () => {
  const [recentReports, setRecentReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [repRes, statsRes] = await Promise.allSettled([
          client.get('/reports/?limit=6&status=open'),
          client.get('/admin/stats')
        ]);
        
        if (repRes.status === 'fulfilled') {
          setRecentReports(repRes.value.data.items || []);
        }
        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value.data);
        }
      } catch (err) {
        console.error('Failed to load landing data', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-gradient text-center position-relative">
        <div className="container py-4">
          {/* Badge */}
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-white border shadow-sm mb-4">
            <span className="badge bg-primary rounded-pill px-2 py-1">AI Engine</span>
            <span className="small text-secondary fw-semibold">CLIP Vision & Sentence Transformers Hybrid Matching</span>
          </div>

          {/* Main Headline */}
          <h1 className="display-4 fw-extrabold text-dark mb-3 mx-auto" style={{ maxWidth: '850px', letterSpacing: '-0.03em' }}>
            Recover What You Lost. <br />
            <span style={{ 
              background: 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent' 
            }}>
              Match What You Found.
            </span>
          </h1>

          <p className="lead text-secondary mx-auto mb-4" style={{ maxWidth: '680px', fontSize: '1.15rem' }}>
            A next-generation campus Lost & Found platform. Automatically compares item photos, semantic descriptions, location proximity, and dates to identify potential matches with transparent confidence scores.
          </p>

          {/* Search Bar Input */}
          <div className="mx-auto mb-4" style={{ maxWidth: '620px' }}>
            <form onSubmit={handleSearch} className="d-flex align-items-center bg-white p-2 rounded-4 shadow-card border">
              <div className="ps-2 text-muted">
                <Search size={20} />
              </div>
              <input
                type="text"
                className="form-control border-0 shadow-none px-3"
                placeholder="Search lost or found items (e.g. 'black backpack', 'AirPods', 'blue wallet')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-primary-gradient px-4 py-2 rounded-3 text-nowrap">
                Search
              </button>
            </form>
          </div>

          {/* Call to Action Buttons */}
          <div className="d-flex justify-content-center align-items-center gap-3 flex-wrap">
            <Link to="/report?type=lost" className="btn btn-lost-action d-flex align-items-center gap-2 px-4 py-3 rounded-3 fs-6">
              <PlusCircle size={18} />
              I Lost Something
            </Link>
            <Link to="/report?type=found" className="btn btn-found-action d-flex align-items-center gap-2 px-4 py-3 rounded-3 fs-6">
              <PlusCircle size={18} />
              I Found Something
            </Link>
            <Link to="/browse" className="btn btn-light border d-flex align-items-center gap-2 px-4 py-3 rounded-3 fs-6 fw-semibold text-secondary">
              Browse All Items
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Instant Simple AI Matcher Studio Section */}
      <section className="py-4" id="studio" style={{ backgroundColor: '#f1f5f9' }}>
        <div className="container py-2">
          <SimpleMatcherStudio />
        </div>
      </section>

      {/* Platform Metrics Bar */}
      <section className="py-4 bg-white border-bottom">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-md-3 col-6">
              <div className="p-2">
                <div className="fs-3 fw-bold text-dark">{stats?.total_reports ?? recentReports.length}</div>
                <div className="small text-muted text-uppercase fw-semibold">Active Reports</div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="p-2">
                <div className="fs-3 fw-bold text-primary">{stats?.total_matches ?? '8+'}</div>
                <div className="small text-muted text-uppercase fw-semibold">AI Matches Detected</div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="p-2">
                <div className="fs-3 fw-bold text-success">{stats?.resolved_reports ?? '100%'}</div>
                <div className="small text-muted text-uppercase fw-semibold">Cases Resolved</div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="p-2">
                <div className="fs-3 fw-bold text-purple" style={{ color: '#8b5cf6' }}>Multimodal</div>
                <div className="small text-muted text-uppercase fw-semibold">Vision + NLP + Geo</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How AI Matching Works */}
      <section className="py-5" style={{ backgroundColor: '#fcfcfd' }}>
        <div className="container py-3">
          <div className="text-center mb-5">
            <h6 className="text-uppercase text-primary fw-bold small">Automated Workflow</h6>
            <h2 className="fw-extrabold text-dark">How the AI Matching Engine Operates</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
              Eliminating tedious manual register browsing through multi-attribute computational intelligence.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card premium-card h-100 p-4 border-0">
                <div className="bg-primary-subtle text-primary p-3 rounded-4 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '56px', height: '56px' }}>
                  <Layers size={28} />
                </div>
                <h5 className="fw-bold mb-2">1. Multimodal Report Intake</h5>
                <p className="text-muted small mb-0">
                  Users upload item photographs, select categories, colors, incident dates, and specify campus locations. The system extracts dense feature representations in real-time.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card premium-card h-100 p-4 border-0">
                <div className="bg-info-subtle text-info p-3 rounded-4 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '56px', height: '56px' }}>
                  <Cpu size={28} />
                </div>
                <h5 className="fw-bold mb-2">2. Multimodal AI Similarity</h5>
                <p className="text-muted small mb-0">
                  Pretrained CLIP assesses visual similarity (40%) while Sentence Transformers evaluate descriptive semantics (30%), coupled with location distance and chronological feasibility.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card premium-card h-100 p-4 border-0">
                <div className="bg-success-subtle text-success p-3 rounded-4 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '56px', height: '56px' }}>
                  <ShieldCheck size={28} />
                </div>
                <h5 className="fw-bold mb-2">3. Confidential Verification</h5>
                <p className="text-muted small mb-0">
                  Potential matches are presented with transparent score breakdowns. The owner files a claim with private proof (serial numbers/markings) to finalize recovery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Live Reports Showcase */}
      <section className="py-5 bg-white border-top">
        <div className="container py-3">
          <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="fw-extrabold text-dark mb-1">Recent Active Items</h3>
              <p className="text-muted small mb-0">Recently reported lost and found belongings across the campus.</p>
            </div>
            <Link to="/browse" className="btn btn-outline-primary btn-sm px-3 py-2 rounded-3 fw-semibold d-flex align-items-center gap-1">
              View All Reports
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading reports...</span>
              </div>
            </div>
          ) : recentReports.length === 0 ? (
            <div className="text-center py-5 bg-light rounded-4 border">
              <p className="text-muted mb-0">No active reports yet. Be the first to report an item!</p>
            </div>
          ) : (
            <div className="row g-4">
              {recentReports.map((report) => (
                <div key={report.id} className="col-lg-4 col-md-6">
                  <ReportCard report={report} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
