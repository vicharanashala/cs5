/**
 * =============================================================================
 * QUERY.IN - ADMIN HIGH RATED QUERIES PAGE
 * =============================================================================
 * Card 6: Highly Rated Queries (First Priority)
 *
 * @module pages/admin/AdminHighRated
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import api from '../../utils/api';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { path: '/admin/high-rated', label: 'High Rated', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> },
];

const AdminHighRated = () => {
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const res = await api.get('/admin/escalated?type=high');
        setQueries(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch highly rated queries', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQueries();
  }, []);

  return (
    <DashboardLayout navItems={navItems}>
      <Card title="Highly Rated Queries" subtitle="Queries with 4-5 star ratings requiring urgent admin attention">
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-text-muted">Loading...</div>
          ) : queries.length === 0 ? (
            <div className="text-center py-8 text-text-muted border border-dashed border-black rounded-lg">
              No highly rated queries at this time
            </div>
          ) : (
            queries.map(query => (
              <div
                key={query._id}
                onClick={() => setSelectedQuery(query)}
                className="border border-black rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-black">{query.query_text}</div>
                    <div className="text-sm text-text-muted mt-1">
                      From: {query.intern_id?.email || 'Unknown'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-600 font-bold">
                      {query.responses?.find(r => r.rating >= 4)?.rating || '★'}/5
                    </div>
                    <div className="text-xs text-text-muted">
                      {query.responses?.length || 0} responses
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedQuery && (
          <QueryDetailPanel query={selectedQuery} onClose={() => setSelectedQuery(null)} />
        )}
      </Card>
    </DashboardLayout>
  );
};

const QueryDetailPanel = ({ query, onClose }) => {
  const [overrideText, setOverrideText] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleAddToFAQ = async () => {
    if (!confirm('Create an FAQ from this resolved query?')) return;
    setLoading(true);
    try {
      await api.post('/admin/create-faq', {
        query_id: query._id,
        category: 'General',
        tags: [],
        priority: 0,
      });
      alert('FAQ created successfully!');
    } catch (err) {
      console.error('Failed to create FAQ', err);
      alert('Failed to create FAQ');
    } finally {
      setLoading(false);
    }
  };

  const statusColors = { peer: 'bg-gray-100', admin: 'bg-black text-white', moderator: 'bg-gray-600 text-white' };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-black">
        <div className="p-6 border-b border-black flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-black">Query Details</h3>
            <p className="text-text-muted text-sm">ID: {query._id}</p>
          </div>
          <button onClick={onClose} className="text-2xl text-black hover:text-gray-600">&times;</button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-text-muted">Intern:</span>
              <span className="ml-2 text-black">{query.intern_id?.email}</span>
            </div>
            <div>
              <span className="text-text-muted">Status:</span>
              <span className="ml-2 text-black">{query.status}</span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded border border-border-subtle">
            <div className="font-medium text-black">{query.query_text}</div>
          </div>

          <div>
            <div className="text-sm font-medium text-black mb-3">Peer Responses</div>
            {query.responses?.length > 0 ? (
              <div className="space-y-3">
                {query.responses.map(resp => (
                  <div key={resp._id} className="border border-black rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[resp.response_type]}`}>
                        {resp.response_type}
                      </span>
                      <span className="text-sm">{resp.author_id?.email}</span>
                      {resp.rating && <span className="text-yellow-600">★ {resp.rating}/5</span>}
                    </div>
                    <div className="text-black">{resp.response_text}</div>
                    {resp.rating >= 4 && query.status === 'Peer Answered' && (
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
              <div className="text-center py-4 text-text-muted">No peer responses</div>
            )}
          </div>

          {query.status !== 'Resolved' && (
            <div className="border-t border-border-subtle pt-4">
              <label className="block text-sm font-medium text-black mb-2">Submit Official Solution</label>
              <textarea
                value={overrideText}
                onChange={(e) => setOverrideText(e.target.value)}
                className="w-full px-4 py-3 border-2 border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black min-h-[100px]"
                placeholder="Type an authoritative answer..."
              />
              <button
                onClick={handleOverride}
                disabled={loading || !overrideText.trim()}
                className="mt-3 w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
              >
                Submit & Resolve
              </button>
            </div>
          )}

          {query.status === 'Resolved' && (
            <div className="border-t border-border-subtle pt-4">
              <button
                onClick={handleAddToFAQ}
                disabled={loading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                + Add to FAQ Database
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHighRated;
