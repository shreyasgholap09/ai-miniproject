import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import client from '../api/client';
import CampusLocationPicker from '../components/CampusLocationPicker';
import { 
  Sparkles, 
  Upload, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Camera, 
  Tag, 
  Calendar 
} from 'lucide-react';

const CATEGORIES = [
  'Electronics',
  'Bags & Backpacks',
  'Keys & Wallets',
  'Documents & IDs',
  'Books & Stationery',
  'Jewelry & Accessories',
  'Clothing & Apparel',
  'Sports & Fitness',
  'Other'
];

const COLORS = [
  'Black',
  'Blue',
  'Grey',
  'Silver',
  'Brown',
  'White',
  'Red',
  'Green',
  'Yellow',
  'Pink',
  'Purple',
  'Orange',
  'Other / Multicolor'
];

const ReportItemPage = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') === 'found' ? 'found' : 'lost';

  const [reportType, setReportType] = useState(initialType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Selected image exceeds maximum 5MB size limit.');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError('');
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleCoordinatesChange = (lat, lon) => {
    setLatitude(lat);
    setLongitude(lon);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim() || !locationName.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('report_type', reportType);
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('color', color);
      formData.append('description', description.trim());
      formData.append('location_name', locationName.trim());
      formData.append('incident_date', incidentDate);
      
      if (latitude !== null && latitude !== undefined) {
        formData.append('latitude', latitude);
      }
      if (longitude !== null && longitude !== undefined) {
        formData.append('longitude', longitude);
      }
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await client.post('/reports/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Redirect directly to AI Matches page to showcase immediate multimodal retrieval
      navigate(`/reports/${res.data.id}/matches`, { 
        state: { message: `Report created successfully! AI matching engine executed automatically.` } 
      });

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit report. Please verify inputs.');
    } finally {
      setLoading(false);
    }
  };

  const isLost = reportType === 'lost';

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card premium-card border-0 p-4 p-md-5">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center gap-2 mb-2">
                <span className={isLost ? 'badge-lost' : 'badge-found'}>
                  {isLost ? '🔍 Lost Item Report' : '🎁 Found Item Report'}
                </span>
              </div>
              <h3 className="fw-bold mb-1">
                {isLost ? 'Report a Lost Belonging' : 'Report a Found Belonging'}
              </h3>
              <p className="text-muted small">
                Provide accurate details. The multimodal AI system will compare photos, semantics, and proximity.
              </p>

              {/* Type Switcher Tabs */}
              <div className="btn-group w-100 mt-2 p-1 bg-light rounded-3" role="group">
                <button
                  type="button"
                  className={`btn py-2 fw-semibold rounded-2 ${isLost ? 'btn-danger shadow-sm' : 'btn-light text-muted'}`}
                  onClick={() => setReportType('lost')}
                >
                  I Lost Something
                </button>
                <button
                  type="button"
                  className={`btn py-2 fw-semibold rounded-2 ${!isLost ? 'btn-success shadow-sm' : 'btn-light text-muted'}`}
                  onClick={() => setReportType('found')}
                >
                  I Found Something
                </button>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 px-3 mb-4 rounded-3" role="alert">
                <AlertCircle size={16} className="flex-shrink-0" />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Title */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">
                  Item Name / Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control py-2 px-3 rounded-3"
                  placeholder={isLost ? "e.g. Black Dell Laptop Backpack with Red Keychain" : "e.g. Dark Rucksack with Keyring found near library"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Category & Color */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">
                    Category <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select py-2 px-3 rounded-3"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    {CATEGORIES.map((cat, i) => (
                      <option key={i} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">
                    Primary Color <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select py-2 px-3 rounded-3"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    required
                  >
                    {COLORS.map((col, i) => (
                      <option key={i} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Detailed Description */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary d-flex justify-content-between">
                  <span>Detailed Description <span className="text-danger">*</span></span>
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>Used for Sentence Transformer embedding</span>
                </label>
                <textarea
                  className="form-control p-3 rounded-3"
                  rows={3}
                  placeholder={isLost 
                    ? "Include material, brands, distinguishing marks, scratches, stickers, or items stored inside." 
                    : "Describe general visual appearance and condition. Keep private identifying numbers confidential."}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Campus Location Picker with Coordinates */}
              <div className="mb-3 p-3 bg-light rounded-3 border">
                <CampusLocationPicker
                  value={locationName}
                  onChange={setLocationName}
                  latitude={latitude}
                  longitude={longitude}
                  onCoordinatesChange={handleCoordinatesChange}
                />
              </div>

              {/* Incident Date */}
              <div className="mb-4">
                <label className="form-label small fw-semibold text-secondary d-flex align-items-center gap-1">
                  <Calendar size={14} className="text-primary" />
                  Date {isLost ? 'Misplaced' : 'Found'} <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control py-2 px-3 rounded-3"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  required
                />
              </div>

              {/* Photo Upload with Live Preview */}
              <div className="mb-4">
                <label className="form-label small fw-semibold text-secondary d-flex justify-content-between">
                  <span className="d-flex align-items-center gap-1">
                    <Camera size={14} className="text-purple" style={{ color: '#8b5cf6' }} />
                    Item Photograph (Recommended)
                  </span>
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>Encodes CLIP ViT-B-32 visual vector</span>
                </label>

                {imagePreview ? (
                  <div className="position-relative d-inline-block border rounded-3 overflow-hidden bg-light" style={{ maxHeight: '240px' }}>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="img-fluid object-fit-contain" 
                      style={{ maxHeight: '240px' }}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-dark position-absolute top-0 end-0 m-2 rounded-circle p-1 opacity-75 hover-opacity-100"
                      onClick={handleRemoveImage}
                      title="Remove Photo"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="border border-dashed rounded-3 p-4 text-center bg-light">
                    <input
                      type="file"
                      id="photoInput"
                      className="d-none"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleImageChange}
                    />
                    <label htmlFor="photoInput" className="cursor-pointer d-flex flex-column align-items-center gap-2 mb-0">
                      <div className="bg-white p-3 rounded-circle shadow-sm text-primary">
                        <Upload size={24} />
                      </div>
                      <span className="fw-semibold text-dark small">Click to upload photograph</span>
                      <span className="text-muted small" style={{ fontSize: '0.75rem' }}>JPG, PNG or WEBP (Max 5MB)</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`btn w-100 py-3 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2 ${isLost ? 'btn-lost-action' : 'btn-found-action'}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    <span>Computing AI Embeddings & Matching...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Submit Report & Analyze Matches</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportItemPage;
