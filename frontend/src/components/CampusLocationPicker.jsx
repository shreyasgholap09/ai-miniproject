import React from 'react';
import { MapPin } from 'lucide-react';

export const CAMPUS_SPOTS = [
  { name: 'Campus Central Library, 2nd Floor Study Area', lat: 37.7749, lon: -122.4194 },
  { name: 'Library 1st Floor Cafe & Circulation Desk', lat: 37.7748, lon: -122.4196 },
  { name: 'Engineering Hall Room 302 / Computer Lab', lat: 37.7760, lon: -122.4180 },
  { name: 'Engineering Block 3rd Floor East Wing', lat: 37.7762, lon: -122.4182 },
  { name: 'Student Activity Center Cafeteria & Lounge', lat: 37.7735, lon: -122.4210 },
  { name: 'Campus Athletic Gym & Locker Rooms', lat: 37.7720, lon: -122.4230 },
  { name: 'Science Auditorium & Lecture Hall A', lat: 37.7770, lon: -122.4165 },
  { name: 'Administration Complex & Registrar', lat: 37.7740, lon: -122.4175 }
];

const CampusLocationPicker = ({ value, onChange, onCoordinatesChange, latitude, longitude }) => {
  const handleSelectPreset = (e) => {
    const selectedName = e.target.value;
    if (!selectedName) return;

    const spot = CAMPUS_SPOTS.find(s => s.name === selectedName);
    if (spot) {
      onChange(spot.name);
      onCoordinatesChange(spot.lat, spot.lon);
    }
  };

  return (
    <div>
      <div className="mb-2">
        <label className="form-label small fw-semibold text-secondary d-flex align-items-center gap-1">
          <MapPin size={14} className="text-danger" />
          Location Name / Landmark <span className="text-danger">*</span>
        </label>
        <div className="input-group mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Campus Library 2nd Floor Study Room"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Preset Dropdown */}
      <div className="mb-2">
        <select 
          className="form-select form-select-sm text-secondary bg-light"
          onChange={handleSelectPreset}
          defaultValue=""
        >
          <option value="" disabled>📍 Choose from common campus locations (auto-fills GPS)...</option>
          {CAMPUS_SPOTS.map((spot, idx) => (
            <option key={idx} value={spot.name}>
              {spot.name}
            </option>
          ))}
        </select>
      </div>

      {/* GPS Lat / Lon Readout (Optional override) */}
      <div className="row g-2">
        <div className="col-6">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-light text-muted small">Lat</span>
            <input
              type="number"
              step="any"
              className="form-control form-control-sm text-muted"
              placeholder="e.g. 37.7749"
              value={latitude ?? ''}
              onChange={(e) => onCoordinatesChange(e.target.value ? parseFloat(e.target.value) : null, longitude)}
            />
          </div>
        </div>
        <div className="col-6">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-light text-muted small">Lon</span>
            <input
              type="number"
              step="any"
              className="form-control form-control-sm text-muted"
              placeholder="e.g. -122.4194"
              value={longitude ?? ''}
              onChange={(e) => onCoordinatesChange(latitude, e.target.value ? parseFloat(e.target.value) : null)}
            />
          </div>
        </div>
      </div>
      <small className="text-muted" style={{ fontSize: '0.72rem' }}>
        Coordinates enable proximity scoring (calculating distance in meters).
      </small>
    </div>
  );
};

export default CampusLocationPicker;
