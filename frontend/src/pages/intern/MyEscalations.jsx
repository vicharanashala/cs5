/**
 * =============================================================================
 * QUERY.IN - MY ESCALATIONS PAGE (Intern)
 * =============================================================================
 * Shows the intern's own submitted queries and their resolution status.
 * Allows rating peer responses on their queries.
 * Real-time updates: Listens for new_peer_answer and query_resolved socket events.
 *
 * @module pages/intern/MyEscalations
 */

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import FormattedAnswer from '../../components/FormattedAnswer';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  {
    path: '/intern',
    label: 'Dashboard',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  },
  {
    path: '/intern/announcements',
    label: 'Announcements',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>,
  },
  {
    path: '/intern/faqs',
    label: 'View FAQs',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    path: '/intern/ask',
    label: 'Ask AI',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  },
  {
    path: '/intern/my-queries',
    label: 'My Escalations',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  },
  {
    path: '/intern/peer-queue',
    label: 'Peer Answer Queue',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  },
];

const MyEscalations = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuery, setExpandedQuery] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    fetchMyQueries();
  }, []);

  useEffect(() => {
    if (!token) return;

    const socket = io(import.meta.env.VITE_API_URL.replace('/api', ''), {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('new_peer_answer', (data) => {
      setQueries((prev) => {
        const exists = prev.some((q) => q._id === data.query_id);
        if (exists) {
          fetchMyQueries();
        }
        return prev;
      });
    });

    socket.on('query_resolved', (data) => {
      setQueries((prev) => {
        const exists = prev.some((q) => q._id === data.query_id);
        if (exists) {
          fetchMyQueries();
        }
        return prev;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const fetchMyQueries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/peer/my-escalations');
      setQueries(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch queries', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (responseId, ratingValue) => {
    try {
      setSubmitting(true);
      await api.post(`/ratings/${responseId}`, { rating: ratingValue });
      await fetchMyQueries();
      setSelectedResponse(null);
      setRating(0);
    } catch (err) {
      console.error('Failed to rate', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'Peer Answered':
        return <Badge variant="filled">Peer Answered</Badge>;
      case 'Ambiguous':
        return <Badge variant="ambiguous">Ambiguous</Badge>;
      case 'Resolved':
        return <Badge variant="verified">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout navItems={navItems}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-black">My Escalations</h1>
          <p className="text-text-secondary mt-1">Track your submitted queries and rate peer responses</p>
        </div>

        {loading ? (
          <Card className="border-2 border-black rounded-lg p-8 text-center">
            <p className="text-text-muted">Loading...</p>
          </Card>
        ) : queries.length === 0 ? (
          <Card className="border-2 border-black rounded-lg p-8 text-center">
            <p className="text-text-muted">No escalations yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {queries.map((query) => (
              <Card key={query._id} className="border-2 border-black rounded-lg">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedQuery(expandedQuery === query._id ? null : query._id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusBadge(query.status)}
                      {query.is_locked && <Badge variant="outline">Locked</Badge>}
                    </div>
                    <p className="text-black font-medium">{query.query_text}</p>
                    <p className="text-sm text-text-muted mt-1">
                      {query.responses?.length || 0} responses | Created {new Date(query.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <svg
                    className={`w-5 h-5 transition-transform ${expandedQuery === query._id ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {expandedQuery === query._id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {query.responses?.length > 0 ? (
                      <div className="space-y-3">
                        {query.responses.map((response) => (
                          <div key={response._id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant={response.response_type === 'admin' ? 'verified' : 'outline'}>
                                  {response.response_type}
                                </Badge>
                                <span className="text-sm text-text-muted">
                                  {response.author_id?.email || 'Anonymous'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() => {
                                      setSelectedResponse(response._id);
                                      setRating(star);
                                    }}
                                    className={`text-xl ${star <= (response.rating || 0) ? 'text-yellow-500' : 'text-gray-300'}`}
                                  >
                                    ★
                                  </button>
                                ))}
                                {response.approval && (
                                  <Badge variant="verified" className="ml-2">Approved</Badge>
                                )}
                              </div>
                            </div>
                            <FormattedAnswer text={response.response_text} />
                            {selectedResponse === response._id && !query.is_locked && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-sm text-text-muted mb-2">Rate this response:</p>
                                <div className="flex items-center gap-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      onClick={() => handleRate(response._id, star)}
                                      disabled={submitting}
                                      className={`text-2xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-500`}
                                    >
                                      ★
                                    </button>
                                  ))}
                                  <span className="text-sm text-text-muted ml-2">
                                    {rating <= 3 ? 'Low rating' : rating >= 4 ? 'High rating' : ''}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-text-muted text-sm">No responses yet</p>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyEscalations;
