/**
 * =============================================================================
 * QUERY.IN - MODERATOR AMBIGUOUS QUERIES PAGE
 * =============================================================================
 * Card 4: Ambiguous Queries (3-Strike Rule)
 *
 * @module pages/moderator/ModeratorAmbiguous
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import api from '../../utils/api';

const ModeratorAmbiguous = () => {
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
    <DashboardLayout>
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
  const [showWarnModal, setShowWarnModal] = useState(false);
  const [warnMessage, setWarnMessage] = useState('');

  const handleOverride = async () => {
    if (!overrideText.trim()) return;
    setLoading(true);
    try {
      await api.post('/admin/override', { query_id: query._id, response_text: overrideText });
      onClose();
      window.location.reload();
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
            {query.intern_id?.warning_count > 0 && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                  ⚠️ {query.intern_id.warning_count} warning{query.intern_id.warning_count > 1 ? 's' : ''}
                </span>
              </div>
            )}
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

          <div className="border-t border-border-subtle pt-4 space-y-4">
            {query.status !== 'Resolved' && (
              <>
                <label className="block text-sm font-medium text-black">Submit Official Solution</label>
                <textarea
                  value={overrideText}
                  onChange={(e) => setOverrideText(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black min-h-[100px]"
                  placeholder="Type an authoritative answer to clarify this query..."
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleOverride}
                    disabled={loading || !overrideText.trim()}
                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
                  >
                    Submit & Resolve
                  </button>
                  <button
                    onClick={() => setShowWarnModal(true)}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                  >
                    ⚠️ Send Warning
                  </button>
                </div>
              </>
            )}
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

export default ModeratorAmbiguous;