/**
 * =============================================================================
 * QUERY.IN - MODERATOR RESOLVE HUB PAGE
 * =============================================================================
 * Card 5: Resolve Query Hub (remaining sections: Master, Unanswered, Low-Rated, Archive)
 *
 * @module pages/moderator/ModeratorResolveHub
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import api from '../../utils/api';

const navItems = [
  { path: '/moderator', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { path: '/moderator/resolve', label: 'Resolve Hub', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
];

const ModeratorResolveHub = () => {
  const [activeSection, setActiveSection] = useState('master');
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [loading, setLoading] = useState(true);

  const sections = [
    { id: 'master', label: 'Master Queue', count: 0 },
    { id: 'unanswered', label: 'Unanswered', count: 0 },
    { id: 'low_rated', label: 'Low-Rated', count: 0 },
    { id: 'archive', label: 'Archive', count: 0 },
  ];

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const res = await api.get('/admin/escalated?type=all');
        setQueries(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQueries();
  }, []);

  const categorized = {
    master: queries.filter(q => q.status !== 'Resolved'),
    unanswered: queries.filter(q => q.status !== 'Resolved' && (!q.responses || q.responses.length === 0)),
    low_rated: queries.filter(q => {
      if (q.status !== 'Peer Answered' || !q.responses?.length) return false;
      const hasLowRatings = q.responses.some(r => r.rating && r.rating < 4);
      return hasLowRatings && q.responses.length >= 5;
    }),
    archive: queries.filter(q => q.status === 'Resolved'),
  };

  const displayedQueries = categorized[activeSection] || [];

  return (
    <DashboardLayout navItems={navItems}>
      <Card title="System Query Resolution Hub" subtitle="Central command terminal for reviewing, approving, or overriding escalated queries">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-48 flex-shrink-0">
            <div className="border border-black rounded-lg overflow-hidden">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full px-4 py-3 text-left text-sm font-medium flex justify-between items-center border-b border-border-subtle last:border-b-0 transition-colors ${
                    activeSection === section.id ? 'bg-black text-white' : 'hover:bg-gray-50'
                  }`}
                >
                  <span>{section.label}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${activeSection === section.id ? 'bg-white text-black' : 'bg-gray-200 text-black'}`}>
                    {categorized[section.id]?.length || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-4">
            {loading ? (
              <div className="text-center py-8 text-text-muted">Loading...</div>
            ) : displayedQueries.length === 0 ? (
              <div className="text-center py-8 text-text-muted border border-dashed border-black rounded-lg">
                No queries in this queue
              </div>
            ) : (
              displayedQueries.map(query => (
                <div
                  key={query._id}
                  onClick={() => setSelectedQuery(query)}
                  className="border border-black rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium text-black">{query.query_text}</div>
                      <div className="text-sm text-text-muted mt-1">
                        From: {query.intern_id?.email} • Status: {query.status}
                      </div>
                    </div>
                    <div className="text-right text-sm text-text-muted">
                      {query.responses?.length || 0} responses
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedQuery && (
            <QueryDetailPanel query={selectedQuery} onClose={() => setSelectedQuery(null)} />
          )}
        </div>
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
                Submit Official Response & Resolve
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModeratorResolveHub;
