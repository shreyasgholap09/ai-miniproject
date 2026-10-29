import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import client from '../api/client';
import ReportCard from '../components/ReportCard';
import { Search, Filter, RotateCcw, Compass } from 'lucide-react';

const CATEGORIES = [
  'All',
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
  'All',
  'Black',
  'Blue',
  'Grey',
  'Silver',
  'Brown',
  'White',
  'Red',
  'Green',
  'Yellow'
];

const BrowsePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [reportType, setReportType] = useState(searchParams.get('type') || 'all');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [color, setColor] = useState(searchParams.get('color') || 'All');
  const [status, setStatus] = useState(searchParams.get('status') || 'open');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(1);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 9,
        status: status === 'all' ? undefined : status,
      };

      if (reportType !== 'all') params.report_type = reportType;
      if (category !== 'All') params.category = category;
      if (color !== 'All') params.color = color;
      if (search.trim()) params.search = search.trim();

      const res = await client.get('/reports/', { params });
      setReports(res.data.items || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch (err) {
      console.error('Failed to browse reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [reportType, category, color, status, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReports();
  };

  const handleReset = () => {
    setReportType('all');
    setCategory('All');
    setColor('All');
    setStatus('open');
    setSearch('');
    setPage(1);
  };

  return (
    <div className="container py-4">
      {/* Title */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <Compass className="text-primary" />
            Browse Campus Items
          </h2>
          <p className="text-muted small mb-0">Search and filter active lost and found reports submitted across campus.</p>
        </div>
        <div className="text-muted small fw-semibold">
          Showing {reports.length} of {total} total reports
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="card premium-card border-0 p-3 mb-4">
        <form onSubmit={handleSearchSubmit}>
          <div className="row g-2 align-items-center">
            {/* Search Input */}
            <div className="col-lg-4 col-md-12">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Keyword search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="col-lg-2 col-sm-6">
              <select
                className="form-select text-secondary"
                value={reportType}
                onChange={(e) => { setReportType(e.target.value); setPage(1); }}
              >
                <option value="all">All Types</option>
                <option value="lost">Lost Only</option>
                <option value="found">Found Only</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="col-lg-2 col-sm-6">
              <select
                className="form-select text-secondary"
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              >
                {CATEGORIES.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                ))}
              </select>
            </div>

            {/* Color Filter */}
            <div className="col-lg-2 col-sm-6">
              <select
                className="form-select text-secondary"
                value={color}
                onChange={(e) => { setColor(e.target.value); setPage(1); }}
              >
                {COLORS.map((col, idx) => (
                  <option key={idx} value={col}>{col === 'All' ? 'All Colors' : col}</option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="col-lg-2 col-sm-6 d-flex gap-2">
              <button type="submit" className="btn btn-primary-gradient w-100 fw-semibold">
                Apply
              </button>
              <button 
                type="button" 
                className="btn btn-light border p-2 text-muted" 
                onClick={handleReset}
                title="Reset Filters"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading reports...</span>
          </div>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 border p-4 shadow-sm">
          <div className="bg-light p-3 rounded-circle d-inline-flex mb-3 text-muted">
            <Filter size={32} />
          </div>
          <h5 className="fw-bold text-dark mb-1">No Matching Reports Found</h5>
          <p className="text-muted small mb-3">Try loosening your search query or resetting filters.</p>
          <button className="btn btn-sm btn-outline-primary" onClick={handleReset}>
            Reset All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            {reports.map((report) => (
              <div key={report.id} className="col-lg-4 col-md-6">
                <ReportCard report={report} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <nav aria-label="Page navigation">
                <ul className="pagination">
                  <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage(p => Math.max(1, p - 1))}>
                      Previous
                    </button>
                  </li>
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setPage(p)}>
                        {p}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${page === pages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage(p => Math.min(pages, p + 1))}>
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BrowsePage;
