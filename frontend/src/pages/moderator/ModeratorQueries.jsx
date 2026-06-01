/**
 * =============================================================================
 * QUERY.IN - MODERATOR QUERY MONITOR PAGE
 * =============================================================================
 * Card 2: Master Query Monitor & Integrated Review Suite
 *
 * @module pages/moderator/ModeratorQueries
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import api from '../../utils/api';

const ModeratorQueries = () => {
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
    <DashboardLayout>
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
                        <span className="text-yellow-500">★ {resp.rating}</span>
                      )}
                    </div>
                    <div className="text-black">{resp.response_text}</div>
                    {resp.peer_note && (
                      <div className="mt-2 text-sm text-text-muted italic bg-yellow-50 p-2 rounded">
                        Peer Note: {resp.peer_note}
                      </div>
                    )}
                    {resp.rater_note && (
                      <div className="mt-2 text-sm text-text-muted italic bg-blue-50 p-2 rounded border-l-2 border-blue-400">
                        Author's Review Note: {resp.rater_note}
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

          <div className="border-t border-border-subtle pt-4">
            <label className="block text-sm font-medium text-black mb-2">
              Moderator Intervention / Override Box
            </label>
            <textarea
              value={overrideText}
              onChange={(e) => setOverrideText(e.target.value)}
              className="w-full px-4 py-3 border-2 border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black min-h-[100px]"
              placeholder="Type an official moderator response if existing answers are incorrect or lacking context."
            />
            <button
              onClick={handleOverride}
              disabled={loading || !overrideText.trim()}
              className="mt-3 w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
            >
              Submit Official Response & Resolve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeratorQueries;
