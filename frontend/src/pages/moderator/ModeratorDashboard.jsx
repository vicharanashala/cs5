/**
 * =============================================================================
 * QUERY.IN - MODERATOR DASHBOARD (5-Card Layout)
 * =============================================================================
 * Card 1: Announcements (yellow alert when new, view-only for moderators)
 * Card 2: Master Query Monitor & Integrated Review Suite
 * Card 3: Highly Rated Queries (first priority)
 * Card 4: Ambiguous Queries (3-strike rule)
 * Card 5: Resolve Query Hub (remaining: Master, Unanswered, Low-Rated, Archive)
 *
 * @module pages/moderator/ModeratorDashboard
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import api from '../../utils/api';

/* ============================================================================
 * Card 1: Announcements (View-Only for Moderators)
 * Yellow alert state when new announcements exist
 * ============================================================================ */
const AnnouncementsCard = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasNew, setHasNew] = useState(false);
  const [viewed, setViewed] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get('/announcements');
        const data = res.data.data || [];
        setAnnouncements(data);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const hasNewAnnouncements = data.some(a => new Date(a.createdAt) > oneDayAgo);
        setHasNew(hasNewAnnouncements && !viewed);
      } catch (err) {
        console.error('Failed to fetch announcements', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, [viewed]);

  const handleOpen = () => {
    setViewed(true);
    setHasNew(false);
  };

  const cardClass = hasNew
    ? 'bg-yellow-50 border-yellow-400 border-2'
    : 'border border-black';

  return (
    <Card
      className={cardClass}
      title={
        <div className="flex items-center justify-between">
          <span>Platform Announcements</span>
          {hasNew && <span className="bg-yellow-400 text-black text-xs px-2 py-1 rounded animate-pulse">NEW</span>}
        </div>
      }
      subtitle="System-wide broadcasts from administrators"
    >
      <div onClick={handleOpen} className="space-y-3 cursor-pointer">
        {loading ? (
          <div className="text-center py-8 text-text-muted">Loading...</div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-8 text-text-muted border border-dashed border-black rounded-lg">
            No announcements at this time
          </div>
        ) : (
          announcements.slice(0, 5).map(ann => (
            <div key={ann._id} className="border border-black rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
              <div className="font-medium text-black">{ann.heading}</div>
              <div className="text-sm text-text-secondary mt-1 line-clamp-2">{ann.content}</div>
              <div className="text-xs text-text-muted mt-2">
                {new Date(ann.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

/* ============================================================================
 * Card 2: Master Query Monitor (Inherited from Admin Card 4)
 * ============================================================================ */
const QueryMonitor = () => {
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

      {selectedQuery && (
        <QueryDrawer query={selectedQuery} onClose={() => setSelectedQuery(null)} />
      )}
    </div>
  );
};

/* ============================================================================
 * Card 2: Query Drawer (Thread View)
 * ============================================================================ */
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
                      <Button
                        onClick={() => handleApprove(resp._id)}
                        disabled={loading}
                        className="mt-3 text-sm"
                      >
                        Approve Response
                      </Button>
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
            <Button
              onClick={handleOverride}
              disabled={loading || !overrideText.trim()}
              className="mt-3 w-full"
            >
              Submit Official Response & Resolve
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * Card 3: Highly Rated Queries (Moderator Standalone Card)
 * ============================================================================ */
const ModeratorHighlyRatedQueries = () => {
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
      {selectedQuery && (
        <ResolveDetailPanel query={selectedQuery} onClose={() => setSelectedQuery(null)} />
      )}
    </div>
  );
};

/* ============================================================================
 * Card 4: Ambiguous Queries (Moderator Standalone Card)
 * ============================================================================ */
const ModeratorAmbiguousQueries = () => {
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
      {selectedQuery && (
        <ResolveDetailPanel query={selectedQuery} onClose={() => setSelectedQuery(null)} />
      )}
    </div>
  );
};

/* ============================================================================
 * Card 5: Resolve Query Hub (remaining sections - Moderator Version)
 * ============================================================================ */
const ResolveQueryHub = () => {
  const [activeSection, setActiveSection] = useState('master');
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [loading, setLoading] = useState(true);

  const sections = [
    { id: 'master', label: 'Master Queue', count: 0 },
    { id: 'unanswered', label: 'Unanswered', count: 0 },
    { id: 'low_rated', label: 'Low-Rated', count: 0 },
    { id: 'high_rated', label: 'Highly-Rated', count: 0 },
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
    high_rated: queries.filter(q => {
      if (q.status !== 'Peer Answered' || !q.responses?.length) return false;
      return q.responses.some(r => r.rating && r.rating >= 4);
    }),
    archive: queries.filter(q => q.status === 'Resolved'),
  };

  const displayedQueries = categorized[activeSection] || [];

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Left Navigation */}
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

      {/* Main Content */}
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
        <ResolveDetailPanel query={selectedQuery} onClose={() => setSelectedQuery(null)} />
      )}
    </div>
  );
};

/* ============================================================================
 * Card 3: Resolve Detail Panel (Moderator Version)
 * ============================================================================ */
const ResolveDetailPanel = ({ query, onClose }) => {
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
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-text-muted">Intern ID:</span>
              <span className="ml-2 text-black">{query.intern_id?.email}</span>
            </div>
            <div>
              <span className="text-text-muted">Status:</span>
              <span className="ml-2 text-black">{query.status}</span>
            </div>
            <div>
              <span className="text-text-muted">Raised:</span>
              <span className="ml-2 text-black">{new Date(query.createdAt).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-text-muted">Resolution:</span>
              <span className="ml-2 text-black">{query.resolution_type || 'Pending'}</span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded border border-border-subtle">
            <div className="font-medium text-black">{query.query_text}</div>
          </div>

          <div>
            <div className="text-sm font-medium text-black mb-3">Peer Context Stream</div>
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
                    {resp.peer_note && (
                      <div className="mt-2 text-sm italic text-text-muted bg-yellow-50 p-2 rounded">
                        Internal Note: {resp.peer_note}
                      </div>
                    )}
                    {resp.rating >= 4 && query.status === 'Peer Answered' && (
                      <Button onClick={() => handleApprove(resp._id)} disabled={loading} className="mt-3 text-sm">
                        Approve Response
                      </Button>
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
              <label className="block text-sm font-medium text-black mb-2">Submit Official Solution & Resolve</label>
              <textarea
                value={overrideText}
                onChange={(e) => setOverrideText(e.target.value)}
                className="w-full px-4 py-3 border-2 border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black min-h-[100px]"
                placeholder="Type an authoritative answer..."
              />
              <Button onClick={handleOverride} disabled={loading || !overrideText.trim()} className="mt-3 w-full">
                Submit Official Response & Resolve
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * Main Moderator Dashboard
 * ============================================================================ */
const ModeratorDashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Moderator Dashboard</h1>
          <p className="text-text-secondary mt-1">Review and resolve escalated queries</p>
        </div>

        {/* Card 1: Announcements */}
        <AnnouncementsCard />

        {/* Card 2: Master Query Monitor */}
        <Card
          title="Platform Queries Feed"
          subtitle="Central control grid for tracking and addressing active user tickets"
        >
          <QueryMonitor />
        </Card>

        {/* Card 3: Highly Rated Queries (First Priority) */}
        <Card title="Highly Rated Queries" subtitle="Queries with 4-5 star ratings requiring urgent attention">
          <ModeratorHighlyRatedQueries />
        </Card>

        {/* Card 4: Ambiguous Queries (3-Strike Rule) */}
        <Card title="Ambiguous Queries" subtitle="Queries marked unclear by 3 different peers">
          <ModeratorAmbiguousQueries />
        </Card>

        {/* Card 5: Resolve Query Hub */}
        <Card
          title="System Query Resolution Hub"
          subtitle="Central command terminal for reviewing, approving, or overriding escalated queries"
        >
          <ResolveQueryHub />
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ModeratorDashboard;