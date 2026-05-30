/**
 * =============================================================================
 * QUERY.IN - ADMIN ANNOUNCEMENT PAGE
 * =============================================================================
 * Card 2: Broadcast Announcement
 *
 * @module pages/admin/AdminAnnouncement
 */

import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import api from '../../utils/api';

const AdminAnnouncement = () => {
  const [form, setForm] = useState({ heading: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await api.post('/announcements', form);
      setMessage({ type: 'success', text: 'Announcement published successfully!' });
      setForm({ heading: '', content: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to publish' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Card title="Publish Global Announcement" subtitle="Form to publish global notices directly into the platform feed">
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
          {message && (
            <div className={`px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
              {message.text}
            </div>
          )}
          <Button type="submit" disabled={loading} className="w-full md:w-auto">
            {loading ? 'Posting...' : 'Post Announcement'}
          </Button>
        </form>
      </Card>
    </DashboardLayout>
  );
};

export default AdminAnnouncement;
