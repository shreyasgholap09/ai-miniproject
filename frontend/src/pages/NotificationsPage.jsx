import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Bell, CheckCheck, Clock, ExternalLink, Sparkles } from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fetchUnreadCount } = useAuth();
  const navigate = useNavigate();

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await client.get('/notifications/');
      setNotifications(res.data || []);
      await fetchUnreadCount();
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await client.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      await fetchUnreadCount();
    } catch (err) {
      alert('Failed to mark all as read.');
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await client.patch(`/notifications/${notif.id}/read`);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
        await fetchUnreadCount();
      } catch (e) {
        // Continue navigation regardless
      }
    }
    if (notif.link_url) {
      navigate(notif.link_url);
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <Bell className="text-primary" />
            Notifications & Alerts
          </h2>
          <p className="text-muted small mb-0">Stay updated on potential AI matches, claim verifications, and report changes.</p>
        </div>

        {notifications.some(n => !n.is_read) && (
          <button 
            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
            onClick={handleMarkAllRead}
          >
            <CheckCheck size={16} />
            Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading notifications...</span>
          </div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="card premium-card border-0 p-5 text-center">
          <Bell size={40} className="text-muted mx-auto mb-2 opacity-50" />
          <h5 className="fw-bold text-dark mb-1">No Notifications</h5>
          <p className="text-muted small mb-0">You're all caught up! New match detections will appear here automatically.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`card premium-card border-0 p-3 cursor-pointer transition ${notif.is_read ? 'bg-white' : 'bg-light border-start border-primary border-4'}`}
              onClick={() => handleNotificationClick(notif)}
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex align-items-start justify-content-between gap-3">
                <div className="d-flex align-items-start gap-3">
                  <div className={`p-2 rounded-circle flex-shrink-0 ${notif.is_read ? 'bg-light text-muted' : 'bg-primary-subtle text-primary'}`}>
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h6 className={`mb-1 ${notif.is_read ? 'text-secondary' : 'text-dark fw-bold'}`}>
                      {notif.title}
                    </h6>
                    <p className="text-muted small mb-1" style={{ lineHeight: '1.4' }}>
                      {notif.message}
                    </p>
                    <small className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                      <Clock size={12} />
                      {new Date(notif.created_at).toLocaleString()}
                    </small>
                  </div>
                </div>

                {notif.link_url && (
                  <div className="text-muted p-1 flex-shrink-0">
                    <ExternalLink size={16} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
