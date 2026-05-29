/**
 * =============================================================================
 * QUERY.IN - ADMIN AMBIGUOUS QUERIES PAGE
 * =============================================================================
 * Card 7: Ambiguous Queries (3-Strike Rule)
 *
 * @module pages/admin/AdminAmbiguous
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import api from '../../utils/api';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { path: '/admin/ambiguous', label: 'Ambiguous', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> },
];

const AdminAmbiguous = () => {
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const res = await api.get('/admin/escalated?type=ambiguous');
        setQueries(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch ambiguous queries', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQueries();
  }, []);

  return (
    <DashboardLayout navItems={navItems}>
      <Card title="Ambiguous Queries" subtitle="Queries marked unclear by 3 different peers (3-strike rule)">
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-text-muted">Loading...</div>
          ) : queries.length === 0 ? (
            <div className="text-center py-8 text-text-muted border border-dashed border-black rounded-lg">
              No ambiguous queries at this time
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
                    <div className="text-orange-600 font-bold">
                      {query.ambiguous_count || 0}/3 strikes
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
          <div className="bg-gray-50 p-4 rounded border border-border-subtle">
            <div className="font-medium text-black">{query.query_text}</div>
            <div className="text-sm text-text-muted mt-2">
              From: {query.intern_id?.email} • {query.ambiguous_count || 0}/3 strikes
            </div>
          </div>

          {query.responses?.length > 0 && (
            <div>
              <div className="text-sm font-medium text-black mb-3">Peer Responses</div>
              <div className="space-y-3">
                {query.responses.map(resp => (
                  <div key={resp._id} className="border border-black rounded-lg p-4">
                    <div className="text-sm text-text-muted mb-1">{resp.author_id?.email}</div>
                    <div className="text-black">{resp.response_text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {query.status !== 'Resolved' && (
            <div className="border-t border-border-subtle pt-4">
              <label className="block text-sm font-medium text-black mb-2">Submit Official Solution</label>
              <textarea
                value={overrideText}
                onChange={(e) => setOverrideText(e.target.value)}
                className="w-full px-4 py-3 border-2 border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black min-h-[100px]"
                placeholder="Type an authoritative answer to clarify this query..."
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

export default AdminAmbiguous;
