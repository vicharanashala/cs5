/**
 * =============================================================================
 * QUERY.IN - ADMIN QUERY MONITOR PAGE
 * =============================================================================
 * Card 4: Master Query Monitor & Integrated Review Suite
 *
 * @module pages/admin/AdminQueries
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import api from '../../utils/api';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { path: '/admin/queries', label: 'Query Monitor', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> },
];

const AdminQueries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedQuery, setSelectedQuery] = useState(null);

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const res = await api.get('/admin/escalated?type=all');
        setQueries(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch queries', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQueries();
  }, []);

  const filteredQueries = queries
    .filter(q => statusFilter === 'all' || q.status.toLowerCase().replace(' ', '_') === statusFilter.toLowerCase())
    .sort((a, b) => sortOrder === 'desc' ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <DashboardLayout navItems={navItems}>
      <Card title="Platform Queries Feed" subtitle="Central control grid for tracking and addressing active user tickets">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-black bg-white text-black rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="peer_answered">Peer Answered</option>
              <option value="ambiguous">Ambiguous</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-2 border border-black bg-white text-black rounded-lg text-sm"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-8 text-text-muted">Loading queries...</div>
          ) : (
            <div className="space-y-3">
              {filteredQueries.map(query => (
                <div
                  key={query._id}
                  onClick={() => setSelectedQuery(query)}
                  className="border border-black rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-black">{query.query_text}</div>
                      <div className="text-sm text-text-muted mt-1">
                        From: {query.intern_id?.email || 'Unknown'} • {new Date(query.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <Badge variant={query.status === 'Resolved' ? 'verified' : query.status === 'Ambiguous' ? 'filled' : 'outline'}>
                      {query.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {filteredQueries.length === 0 && (
                <div className="text-center py-8 text-text-muted">No queries found</div>
              )}
            </div>
          )}
        </div>

        {selectedQuery && (
          <QueryDrawer query={selectedQuery} onClose={() => setSelectedQuery(null)} />
        )}
      </Card>
    </DashboardLayout>
  );
};

const QueryDrawer = ({ query, onClose }) => {
  const [overrideText, setOverrideText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWarnModal, setShowWarnModal] = useState(false);
  const [warnMessage, setWarnMessage] = useState('');

  const handleApprove = async (responseId) => {
    setLoading(true);
    try {
      await api.post('/admin/approve', { query_id: query._id, response_id: responseId });
      onClose();
    } catch (err) {
      console.error('Failed to approve', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOverride = async () => {
    if (!overrideText.trim()) return;
    setLoading(true);
    try {
      await api.post('/admin/override', { query_id: query._id, response_text: overrideText });
      onClose();
    } catch (err) {
      console.error('Failed to override', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWarnUser = async () => {
    setLoading(true);
    try {
      await api.post('/admin/warn-user', {
        intern_id: query.intern_id._id || query.intern_id,
        query_id: query._id,
        warning_message: warnMessage || 'You are misusing our system. If you continue, your account will be disabled after 5 warnings.',
      });
      setShowWarnModal(false);
      setWarnMessage('');
      alert('Warning sent successfully');
    } catch (err) {
      console.error('Failed to send warning', err);
      alert(err.response?.data?.error || 'Failed to send warning');
    } finally {
      setLoading(false);
    }
  };

  const statusColors = { peer: 'bg-gray-100 text-black', admin: 'bg-black text-white', moderator: 'bg-gray-600 text-white' };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-black">
        <div className="p-6 border-b border-black">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-black">Query Details</h3>
              <p className="text-text-muted text-sm mt-1">ID: {query._id}</p>
            </div>
            <button onClick={onClose} className="text-black hover:text-gray-600 text-2xl">&times;</button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 p-4 rounded border border-border-subtle">
            <div className="text-sm text-text-muted mb-1">The Core Question</div>
            <div className="font-medium text-black">{query.query_text}</div>
            <div className="text-sm text-text-muted mt-2">
              From: {query.intern_id?.email} • {new Date(query.createdAt).toLocaleString()}
            </div>
            {query.intern_id?.warning_count > 0 && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                  ⚠️ {query.intern_id.warning_count} warning{query.intern_id.warning_count > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          <div>
            <div className="text-sm font-medium text-black mb-3">Peer Response Carousel</div>
            {query.responses?.length > 0 ? (
              <div className="space-y-3">
                {query.responses.map(resp => (
                  <div key={resp._id} className="border border-black rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[resp.response_type]}`}>
                        {resp.response_type}
                      </span>
                      <span className="text-sm text-text-muted">
                        {resp.author_id?.email || 'Unknown'}
                      </span>
                      {resp.rating && (
                        <span className="text-yellow-600">★ {resp.rating}</span>
                      )}
                    </div>
                    <div className="text-black">{resp.response_text}</div>
                    {resp.peer_note && (
                      <div className="mt-2 text-sm text-text-muted italic bg-yellow-50 p-2 rounded">
                        Note: {resp.peer_note}
                      </div>
                    )}
                    {query.status === 'Peer Answered' && !query.is_locked && (
                      <button
                        onClick={() => handleApprove(resp._id)}
                        disabled={loading}
                        className="mt-3 text-sm px-3 py-1 border border-black rounded hover:bg-gray-50"
                      >
                        Approve Response
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-text-muted text-center py-4">No peer responses yet</div>
            )}
          </div>

          <div className="border-t border-border-subtle pt-4 space-y-4">
            <label className="block text-sm font-medium text-black">
              Admin Intervention / Override Box
            </label>
            <textarea
              value={overrideText}
              onChange={(e) => setOverrideText(e.target.value)}
              className="w-full px-4 py-3 border-2 border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black min-h-[100px]"
              placeholder="Type an official admin/moderator response if existing answers are incorrect or lacking context."
            />
            <div className="flex gap-3">
              <button
                onClick={handleOverride}
                disabled={loading || !overrideText.trim()}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
              >
                Submit Official Response & Resolve
              </button>
              <button
                onClick={() => setShowWarnModal(true)}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
              >
                ⚠️ Send Warning
              </button>
            </div>
          </div>
        </div>

        {showWarnModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full border-2 border-black">
              <div className="p-6 border-b border-black">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-black">Send Warning to Intern</h3>
                  <button onClick={() => setShowWarnModal(false)} className="text-black hover:text-gray-600 text-2xl">&times;</button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-text-muted">
                  Sending warning to: <strong>{query.intern_id?.email}</strong>
                </p>
                <p className="text-sm text-text-muted">
                  This will notify the intern that they are misusing the system. If they receive 5 warnings, their account will be automatically disabled.
                </p>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Custom Warning Message (optional)</label>
                  <textarea
                    value={warnMessage}
                    onChange={(e) => setWarnMessage(e.target.value)}
                    placeholder="You are misusing our system. If you continue, your account will be disabled after 5 warnings."
                    className="w-full px-4 py-3 border-2 border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black min-h-[100px]"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleWarnUser}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Sending...' : 'Send Warning'}
                  </button>
                  <button
                    onClick={() => setShowWarnModal(false)}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 disabled:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminQueries;