import React, { useState } from 'react';
import client, { SERVER_URL } from '../api/client';
import { 
  Sparkles, 
  Upload, 
  X, 
  ArrowRight, 
  CheckCircle, 
  Sliders, 
  Camera, 
  FileText, 
  MapPin, 
  Calendar,
  Layers,
  Zap
} from 'lucide-react';

const DEMO_PRESETS = [
  {
    name: '🎒 Backpack Pair (~93%)',
    lost: {
      title: 'Black Laptop Backpack with Red Keychain',
      description: 'Water-resistant black Dell laptop backpack with red Swiss gear keychain lost near library.',
      category: 'Bags & Backpacks',
      color: 'Black',
      location: 'Campus Central Library, 2nd Floor',
      date: '2026-10-25',
      imagePreview: `${SERVER_URL}/uploads/sample_lost_backpack.jpg`
    },
    found: {
      title: 'Dark Laptop Rucksack with Red Keyring',
      description: 'Found black Dell rucksack with red keyring near 2nd floor library study tables.',
      category: 'Bags & Backpacks',
      color: 'Black',
      location: 'Library 2nd Floor, near silent study zone',
      date: '2026-10-26',
      imagePreview: `${SERVER_URL}/uploads/sample_found_backpack.jpg`
    }
  },
  {
    name: '🎧 AirPods Pair (~80%)',
    lost: {
      title: 'Space Gray Apple AirPods Pro 2',
      description: 'AirPods Pro in matte black silicone protective case with small scratch on hinge.',
      category: 'Electronics',
      color: 'Grey',
      location: 'Engineering Hall Room 302',
      date: '2026-10-24',
      imagePreview: `${SERVER_URL}/uploads/sample_lost_airpods.jpg`
    },
    found: {
      title: 'Wireless Earbuds in Black Silicone Case',
      description: 'Found Apple wireless earbuds in silicone case left on engineering block desk.',
      category: 'Electronics',
      color: 'Black',
      location: 'Engineering Building, 3rd Floor Lab',
      date: '2026-10-25',
      imagePreview: `${SERVER_URL}/uploads/sample_found_airpods.jpg`
    }
  },
  {
    name: '👛 Leather Wallet Pair (~95%)',
    lost: {
      title: 'Brown Leather Bi-fold Wallet',
      description: 'Brown leather wallet with driver license and college student ID card lost in cafeteria.',
      category: 'Keys & Wallets',
      color: 'Brown',
      location: 'Student Activity Center Cafeteria',
      date: '2026-10-23',
      imagePreview: `${SERVER_URL}/uploads/sample_lost_wallet.jpg`
    },
    found: {
      title: "Brown Men's Leather Wallet",
      description: 'Found brown leather wallet left on cafeteria booth table. Contains cards.',
      category: 'Keys & Wallets',
      color: 'Brown',
      location: 'Cafeteria dining hall table 14',
      date: '2026-10-24',
      imagePreview: `${SERVER_URL}/uploads/sample_found_wallet.jpg`
    }
  }
];

const SimpleMatcherStudio = () => {
  // Lost item state
  const [lostTitle, setLostTitle] = useState('Black Laptop Backpack with Red Keychain');
  const [lostDesc, setLostDesc] = useState('Water-resistant black Dell laptop backpack with red Swiss gear keychain lost near library.');
  const [lostCat, setLostCat] = useState('Bags & Backpacks');
  const [lostColor, setLostColor] = useState('Black');
  const [lostLoc, setLostLoc] = useState('Campus Central Library, 2nd Floor');
  const [lostDate, setLostDate] = useState('2026-10-25');
  const [lostFile, setLostFile] = useState(null);
  const [lostPreview, setLostPreview] = useState(`${SERVER_URL}/uploads/sample_lost_backpack.jpg`);

  // Found item state
  const [foundTitle, setFoundTitle] = useState('Dark Laptop Rucksack with Red Keyring');
  const [foundDesc, setFoundDesc] = useState('Found black Dell rucksack with red keyring near 2nd floor library study tables.');
  const [foundCat, setFoundCat] = useState('Bags & Backpacks');
  const [foundColor, setFoundColor] = useState('Black');
  const [foundLoc, setFoundLoc] = useState('Library 2nd Floor, near silent study zone');
  const [foundDate, setFoundDate] = useState('2026-10-26');
  const [foundFile, setFoundFile] = useState(null);
  const [foundPreview, setFoundPreview] = useState(`${SERVER_URL}/uploads/sample_found_backpack.jpg`);

  // Analysis result state
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLostFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLostFile(file);
      setLostPreview(URL.createObjectURL(file));
    }
  };

  const handleFoundFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoundFile(file);
      setFoundPreview(URL.createObjectURL(file));
    }
  };

  const loadPreset = (preset) => {
    setLostTitle(preset.lost.title);
    setLostDesc(preset.lost.description);
    setLostCat(preset.lost.category);
    setLostColor(preset.lost.color);
    setLostLoc(preset.lost.location);
    setLostDate(preset.lost.date);
    setLostPreview(preset.lost.imagePreview);
    setLostFile(null);

    setFoundTitle(preset.found.title);
    setFoundDesc(preset.found.description);
    setFoundCat(preset.found.category);
    setFoundColor(preset.found.color);
    setFoundLoc(preset.found.location);
    setFoundDate(preset.found.date);
    setFoundPreview(preset.found.imagePreview);
    setFoundFile(null);

    setAnalysis(null);
  };

  const runAnalysis = async () => {
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('lost_title', lostTitle);
      formData.append('lost_description', lostDesc);
      formData.append('lost_category', lostCat);
      formData.append('lost_color', lostColor);
      formData.append('lost_location', lostLoc);
      formData.append('lost_date', lostDate);
      if (lostFile) {
        formData.append('lost_image', lostFile);
      }

      formData.append('found_title', foundTitle);
      formData.append('found_description', foundDesc);
      formData.append('found_category', foundCat);
      formData.append('found_color', foundColor);
      formData.append('found_location', foundLoc);
      formData.append('found_date', foundDate);
      if (foundFile) {
        formData.append('found_image', foundFile);
      }

      const res = await client.post('/matches/compare', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAnalysis(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card premium-card border-0 p-4 p-md-5 mb-5 shadow-lg">
      {/* Studio Header */}
      <div className="text-center mb-4">
        <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-primary-subtle text-primary fw-semibold small mb-2">
          <Sparkles size={16} />
          Direct Multimodal AI Matcher
        </div>
        <h2 className="fw-extrabold text-dark mb-2">
          Compare Lost & Found Items
        </h2>
        <p className="text-muted small mx-auto mb-3" style={{ maxWidth: '640px' }}>
          Upload a lost item photo and a found item photo. The system runs real-time inference using <strong>CLIP ViT-B-32</strong> and <strong>Sentence Transformers</strong> to produce a ranked match score.
        </p>

        {/* 1-Click Demo Buttons */}
        <div className="d-flex justify-content-center align-items-center gap-2 flex-wrap mb-2">
          <span className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>
            ⚡ Quick Demo Presets:
          </span>
          {DEMO_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              className="btn btn-sm btn-light border rounded-pill px-3 py-1 fw-semibold text-secondary"
              onClick={() => loadPreset(preset)}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger small py-2 px-3 mb-4 rounded-3 text-center">
          {error}
        </div>
      )}

      {/* Two Column Upload Grid */}
      <div className="row g-4 mb-4">
        {/* Left Column: Lost Item */}
        <div className="col-lg-6">
          <div className="card h-100 border p-3 rounded-4 bg-light shadow-sm">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="badge-lost fs-6">
                🔍 Lost Item
              </span>
              <span className="small text-muted">What the owner lost</span>
            </div>

            {/* Lost Image Upload / Preview */}
            <div className="mb-3 text-center">
              <div 
                className="position-relative bg-white rounded-3 border overflow-hidden d-flex align-items-center justify-content-center mx-auto mb-2"
                style={{ height: '220px', width: '100%', cursor: 'pointer' }}
              >
                {lostPreview ? (
                  <>
                    <img 
                      src={lostPreview} 
                      alt="Lost Preview" 
                      className="w-100 h-100 object-fit-contain p-2"
                    />
                    <label 
                      htmlFor="lostUpload" 
                      className="btn btn-sm btn-dark position-absolute bottom-0 end-0 m-2 rounded-pill px-2 py-1 opacity-75 hover-opacity-100"
                    >
                      <Camera size={14} className="me-1" /> Change Photo
                    </label>
                  </>
                ) : (
                  <label htmlFor="lostUpload" className="w-100 h-100 d-flex flex-column align-items-center justify-content-center cursor-pointer text-muted p-3">
                    <Upload size={32} className="text-danger mb-2 opacity-75" />
                    <span className="fw-semibold small text-dark">Click to upload Lost Item Photo</span>
                    <span className="small text-muted" style={{ fontSize: '0.75rem' }}>JPG, PNG or WEBP</span>
                  </label>
                )}
                <input 
                  type="file" 
                  id="lostUpload" 
                  className="d-none" 
                  accept="image/*"
                  onChange={handleLostFile} 
                />
              </div>
            </div>

            {/* Inputs */}
            <div className="mb-2">
              <label className="form-label small fw-semibold text-secondary">Item Title</label>
              <input
                type="text"
                className="form-control form-control-sm rounded-2"
                placeholder="e.g. Black Dell Backpack"
                value={lostTitle}
                onChange={(e) => setLostTitle(e.target.value)}
              />
            </div>

            <div className="row g-2 mb-2">
              <div className="col-6">
                <label className="form-label small fw-semibold text-secondary">Category</label>
                <input
                  type="text"
                  className="form-control form-control-sm rounded-2"
                  value={lostCat}
                  onChange={(e) => setLostCat(e.target.value)}
                />
              </div>
              <div className="col-6">
                <label className="form-label small fw-semibold text-secondary">Color</label>
                <input
                  type="text"
                  className="form-control form-control-sm rounded-2"
                  value={lostColor}
                  onChange={(e) => setLostColor(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-2">
              <label className="form-label small fw-semibold text-secondary">Description</label>
              <textarea
                className="form-control form-control-sm rounded-2"
                rows={2}
                value={lostDesc}
                onChange={(e) => setLostDesc(e.target.value)}
              />
            </div>

            <div className="mb-1">
              <label className="form-label small fw-semibold text-secondary">Location</label>
              <input
                type="text"
                className="form-control form-control-sm rounded-2"
                value={lostLoc}
                onChange={(e) => setLostLoc(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Found Item */}
        <div className="col-lg-6">
          <div className="card h-100 border p-3 rounded-4 bg-light shadow-sm">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="badge-found fs-6">
                🎁 Found Item
              </span>
              <span className="small text-muted">What the finder picked up</span>
            </div>

            {/* Found Image Upload / Preview */}
            <div className="mb-3 text-center">
              <div 
                className="position-relative bg-white rounded-3 border overflow-hidden d-flex align-items-center justify-content-center mx-auto mb-2"
                style={{ height: '220px', width: '100%', cursor: 'pointer' }}
              >
                {foundPreview ? (
                  <>
                    <img 
                      src={foundPreview} 
                      alt="Found Preview" 
                      className="w-100 h-100 object-fit-contain p-2"
                    />
                    <label 
                      htmlFor="foundUpload" 
                      className="btn btn-sm btn-dark position-absolute bottom-0 end-0 m-2 rounded-pill px-2 py-1 opacity-75 hover-opacity-100"
                    >
                      <Camera size={14} className="me-1" /> Change Photo
                    </label>
                  </>
                ) : (
                  <label htmlFor="foundUpload" className="w-100 h-100 d-flex flex-column align-items-center justify-content-center cursor-pointer text-muted p-3">
                    <Upload size={32} className="text-success mb-2 opacity-75" />
                    <span className="fw-semibold small text-dark">Click to upload Found Item Photo</span>
                    <span className="small text-muted" style={{ fontSize: '0.75rem' }}>JPG, PNG or WEBP</span>
                  </label>
                )}
                <input 
                  type="file" 
                  id="foundUpload" 
                  className="d-none" 
                  accept="image/*"
                  onChange={handleFoundFile} 
                />
              </div>
            </div>

            {/* Inputs */}
            <div className="mb-2">
              <label className="form-label small fw-semibold text-secondary">Item Title</label>
              <input
                type="text"
                className="form-control form-control-sm rounded-2"
                placeholder="e.g. Dark Rucksack"
                value={foundTitle}
                onChange={(e) => setFoundTitle(e.target.value)}
              />
            </div>

            <div className="row g-2 mb-2">
              <div className="col-6">
                <label className="form-label small fw-semibold text-secondary">Category</label>
                <input
                  type="text"
                  className="form-control form-control-sm rounded-2"
                  value={foundCat}
                  onChange={(e) => setFoundCat(e.target.value)}
                />
              </div>
              <div className="col-6">
                <label className="form-label small fw-semibold text-secondary">Color</label>
                <input
                  type="text"
                  className="form-control form-control-sm rounded-2"
                  value={foundColor}
                  onChange={(e) => setFoundColor(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-2">
              <label className="form-label small fw-semibold text-secondary">Description</label>
              <textarea
                className="form-control form-control-sm rounded-2"
                rows={2}
                value={foundDesc}
                onChange={(e) => setFoundDesc(e.target.value)}
              />
            </div>

            <div className="mb-1">
              <label className="form-label small fw-semibold text-secondary">Location</label>
              <input
                type="text"
                className="form-control form-control-sm rounded-2"
                value={foundLoc}
                onChange={(e) => setFoundLoc(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Big Action Button */}
      <div className="text-center mb-4">
        <button
          type="button"
          className="btn btn-primary-gradient px-5 py-3 rounded-pill fw-bold fs-5 shadow-lg d-inline-flex align-items-center gap-2"
          onClick={runAnalysis}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              <span>Running CLIP Vision & Text Analysis...</span>
            </>
          ) : (
            <>
              <Zap size={22} />
              <span>Run AI Match Analysis</span>
            </>
          )}
        </button>
      </div>

      {/* AI Analysis Results Section */}
      {analysis && (
        <div className="card border-0 rounded-4 p-4 bg-white shadow-lg border border-primary">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 pb-3 border-bottom mb-4">
            <div>
              <span className="small text-uppercase fw-bold text-muted d-block">AI Match Compatibility</span>
              <h3 className="fw-extrabold mb-0 d-flex align-items-center gap-2">
                <span style={{ 
                  background: analysis.total_score_percent >= 75 ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {analysis.total_score_percent}% Overall Match Score
                </span>
              </h3>
            </div>
            <div>
              <span className={`badge px-3 py-2 rounded-pill fs-6 ${analysis.total_score_percent >= 75 ? 'bg-success' : 'bg-primary'}`}>
                {analysis.verdict}
              </span>
            </div>
          </div>

          {/* 5-Bar Component Breakdown */}
          <div className="row g-3 mb-4">
            <div className="col-md-4 col-sm-6">
              <div className="p-3 bg-light rounded-3 border">
                <div className="small text-muted d-flex justify-content-between mb-1">
                  <span>📷 Vision Resemblance (CLIP):</span>
                  <strong>{analysis.component_percentages.image}%</strong>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div className="progress-bar bg-primary" style={{ width: `${analysis.component_percentages.image}%` }} />
                </div>
                <small className="text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>512-dim visual vector cosine similarity</small>
              </div>
            </div>

            <div className="col-md-4 col-sm-6">
              <div className="p-3 bg-light rounded-3 border">
                <div className="small text-muted d-flex justify-content-between mb-1">
                  <span>📝 Text Semantics (MiniLM):</span>
                  <strong>{analysis.component_percentages.text}%</strong>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div className="progress-bar bg-info" style={{ width: `${analysis.component_percentages.text}%` }} />
                </div>
                <small className="text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>Sentence Transformers embedding match</small>
              </div>
            </div>

            <div className="col-md-4 col-sm-6">
              <div className="p-3 bg-light rounded-3 border">
                <div className="small text-muted d-flex justify-content-between mb-1">
                  <span>🎨 Color Compatibility:</span>
                  <strong>{analysis.component_percentages.color}%</strong>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div className="progress-bar bg-warning" style={{ width: `${analysis.component_percentages.color}%` }} />
                </div>
                <small className="text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>Color family taxonomy overlap</small>
              </div>
            </div>

            <div className="col-md-6 col-sm-6">
              <div className="p-3 bg-light rounded-3 border">
                <div className="small text-muted d-flex justify-content-between mb-1">
                  <span>📍 Geospatial Proximity:</span>
                  <strong>{analysis.component_percentages.location}%</strong>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div className="progress-bar bg-success" style={{ width: `${analysis.component_percentages.location}%` }} />
                </div>
                <small className="text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>Haversine great-circle distance decay</small>
              </div>
            </div>

            <div className="col-md-6 col-sm-6">
              <div className="p-3 bg-light rounded-3 border">
                <div className="small text-muted d-flex justify-content-between mb-1">
                  <span>📅 Chronological Feasibility:</span>
                  <strong>{analysis.component_percentages.date}%</strong>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div className="progress-bar bg-secondary" style={{ width: `${analysis.component_percentages.date}%` }} />
                </div>
                <small className="text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>Time interval verification (lost before found)</small>
              </div>
            </div>
          </div>

          {/* Explainable AI Tags */}
          <div className="p-3 bg-light rounded-3 border">
            <span className="small fw-bold text-secondary text-uppercase d-block mb-2">
              Explainable AI Reason Badges:
            </span>
            <div className="d-flex flex-wrap gap-2">
              {analysis.explanation_tags?.map((tag, tIdx) => (
                <span key={tIdx} className="ai-reason-chip">
                  <Sparkles size={14} className="text-primary" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleMatcherStudio;
