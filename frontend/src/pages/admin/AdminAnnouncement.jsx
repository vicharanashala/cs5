/**
 * =============================================================================
 * QUERY.IN - ADMIN ANNOUNCEMENT PAGE
 * =============================================================================
 * Create, view, edit and delete announcements.
 * Dynamic: Updates automatically when announcements change.
 *
 * @module pages/admin/AdminAnnouncement
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import api from '../../utils/api';
import { formatDateTime } from '../../utils/dateFormat';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';

const AdminAnnouncement = () => {
  const { token } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ heading: '', content: '', priority: 'medium' });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [hasNew, setHasNew] = useState(false);
  const initialLoadDoneRef = useRef(false);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await api.get('/announcements');
      const data = res.data.data || [];
      setAnnouncements(data);
      if (initialLoadDoneRef.current && data.length > 0 && new Date(data[0].createdAt) > new Date(Date.now() - 60000)) {
        setHasNew(true);
      }
      initialLoadDoneRef.current = true;
    } catch (err) {
      console.error('Failed to fetch announcements', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  useEffect(() => {
    if (!token) return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const socketUrl = apiUrl.replace('/api', '');
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('announcement_created', () => {
      fetchAnnouncements();
    });

    return () => {
      socket.disconnect();
    };
  }, [token, fetchAnnouncements]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setMessage(null);
    try {
      if (editingId) {
        await api.put(`/announcements/${editingId}`, { heading: form.heading, content: form.content, priority: form.priority });
        setMessage({ type: 'success', text: 'Announcement updated successfully!' });
      } else {
        await api.post('/announcements', { heading: form.heading, content: form.content, priority: form.priority });
        setMessage({ type: 'success', text: 'Announcement published successfully!' });
      }
      setForm({ heading: '', content: '', priority: 'medium' });
      setEditingId(null);
      setHasNew(true);
      await fetchAnnouncements();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to save announcement' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (ann) => {
    setForm({ heading: ann.heading, content: ann.content, priority: ann.priority });
    setEditingId(ann._id);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      setMessage({ type: 'success', text: 'Announcement deleted successfully!' });
      await fetchAnnouncements();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to delete announcement' });
    }
  };

  const handleCancelEdit = () => {
    setForm({ heading: '', content: '', priority: 'medium' });
    setEditingId(null);
  };

  const handleDismissNew = () => {
    setHasNew(false);
  };

  const priorityColors = {
    high: 'bg-red-600 text-white',
    medium: 'bg-yellow-400 text-black',
    low: 'bg-green-800 text-white',
  };

  const priorityDotColors = {
    high: 'bg-red-600',
    medium: 'bg-yellow-400',
    low: 'bg-green-800',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {hasNew && (
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-600"></span>
              </span>
              <span className="text-green-800 font-medium">New announcement posted!</span>
            </div>
            <button onClick={handleDismissNew} className="text-green-600 hover:text-green-800 text-sm underline">
              Dismiss
            </button>
          </div>
        )}

        <Card title={editingId ? 'Edit Announcement' : 'Publish Global Announcement'} subtitle="Form to publish global notices directly into the platform feed">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Announcement Heading / Title</label>
              <input
                type="text"
                value={form.heading}
                onChange={(e) => setForm({ ...form, heading: e.target.value })}
                className="w-full px-4 py-3 border-2 border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter announcement title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Main Content Block</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full px-4 py-3 border-2 border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black min-h-[120px]"
                placeholder="Enter announcement content"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Priority Level</label>
              <div className="flex gap-3">
                {['low', 'medium', 'high'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm({ ...form, priority: p })}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      form.priority === p
                        ? priorityColors[p]
                        : 'bg-gray-100 text-black hover:bg-gray-200'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {message && (
              <div className={`px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                {message.text}
              </div>
            )}
            <div className="flex gap-3">
              <Button type="submit" disabled={submitLoading} className="w-full md:w-auto">
                {submitLoading ? 'Saving...' : editingId ? 'Update Announcement' : 'Post Announcement'}
              </Button>
              {editingId && (
                <Button type="button" onClick={handleCancelEdit} variant="secondary" className="w-full md:w-auto">
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>

        <Card title="All Announcements" subtitle={`${announcements.length} total announcement${announcements.length !== 1 ? 's' : ''}`}>
          {loading ? (
            <div className="text-center py-8 text-text-muted">Loading...</div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-8 text-text-muted border border-dashed border-black rounded-lg">
              No announcements yet
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((ann) => (
                <div key={ann._id} className="border-2 border-black rounded-lg p-4 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <span className={`mt-2 w-3 h-3 rounded-full flex-shrink-0 ${priorityDotColors[ann.priority]}`}></span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-black">{ann.heading}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[ann.priority]}`}>
                            {ann.priority.charAt(0).toUpperCase() + ann.priority.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary whitespace-pre-wrap">{ann.content}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                          <span>By: {ann.admin_id?.email || 'Admin'}</span>
                          <span>{formatDateTime(ann.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(ann)}
                        className="px-3 py-1.5 text-sm border border-black rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(ann._id)}
                        className="px-3 py-1.5 text-sm border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnnouncement;