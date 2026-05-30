/**
 * =============================================================================
 * QUERY.IN - MY ESCALATIONS PAGE
 * =============================================================================
 * Modern SaaS-style query tracking page with rating system.
 * Real-time updates via Socket.IO for new answers and resolutions.
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
  const [raterNote, setRaterNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [warningCount, setWarningCount] = useState(0);

  const { token, user } = useAuth();

  useEffect(() => {
    fetchMyQueries();
    fetchUserWarnings();
  }, []);

  useEffect(() => {
    if (!token) return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const socketUrl = apiUrl.replace('/api', '');
    const socket = io(socketUrl, {
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

  const fetchUserWarnings = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.data) {
        setWarningCount(res.data.data.warning_count || 0);
      }
    } catch (err) {
      console.error('Failed to fetch user warnings', err);
    }
  };

  const handleRate = async (responseId, ratingValue) => {
    try {
      setSubmitting(true);
      await api.post(`/ratings/${responseId}`, { rating: ratingValue, rater_note: raterNote });
      await fetchMyQueries();
      setSelectedResponse(null);
      setRating(0);
      setRaterNote('');
    } catch (err) {
      console.error('Failed to rate', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (query) => {
    if (query.resolution_type === 'peer_approved' || query.resolution_type === 'admin_override') {
      return <Badge variant="highlight" size="lg">Approved</Badge>;
    }
    switch (query.status) {
      case 'Pending':
        return <Badge variant="outline" size="lg">Pending</Badge>;
      case 'Peer Answered':
        return <Badge variant="filled" size="lg">Peer Answered</Badge>;
      case 'Ambiguous':
        return <Badge variant="error" size="lg">Needs Rephrase</Badge>;
      case 'Resolved':
        return <Badge variant="success" size="lg">Resolved</Badge>;
      default:
        return <Badge variant="outline" size="lg">{query.status}</Badge>;
    }
  };

  return (
    <DashboardLayout navItems={navItems}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-black">My Escalations</h1>
            <p className="text-gray-500 mt-1">Track your queries and rate peer responses</p>
          </div>
          <div className="text-sm text-gray-500">
            {queries.length} {queries.length === 1 ? 'query' : 'queries'}
          </div>
        </div>

        {/* Warning Banner */}
        {warningCount > 0 && (
          <div className="bg-highlight-light border-l-4 border-l-highlight rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-highlight rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-black">Warning: Misuse Alert</h3>
                <p className="text-gray-700 text-sm mt-1">
                  You have {warningCount} warning{warningCount > 1 ? 's' : ''}.
                  {warningCount >= 3 && ' At 5 warnings your account will be disabled.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <Card className="py-12 text-center" hover={false}>
            <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading your queries...</p>
          </Card>
        ) : queries.length === 0 ? (
          <Card className="py-12 text-center" hover={false}>
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No escalations yet</h3>
            <p className="text-gray-500 text-sm">When you submit queries, they'll appear here</p>
            <a href="/intern/ask" className="mt-4 inline-block">
              <Button variant="primary" size="sm">Ask a Question</Button>
            </a>
          </Card>
        ) : (
          <div className="space-y-4">
            {queries.map((query) => (
              <Card key={query._id} className="hover:shadow-lg transition-shadow" hover={false}>
                <div
                  className="cursor-pointer p-5"
                  onClick={() => setExpandedQuery(expandedQuery === query._id ? null : query._id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {getStatusBadge(query)}
                        {query.is_locked && <Badge variant="outline" size="sm">Locked</Badge>}
                      </div>
                      <p className="text-gray-900 font-medium text-base">{query.query_text}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {query.responses?.length || 0} responses | {new Date(query.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${expandedQuery === query._id ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {expandedQuery === query._id && (
                  <div className="px-5 pb-5 pt-0 border-t border-gray-100 mt-4">
                    {query.responses?.length > 0 ? (
                      <div className="space-y-4">
                        {query.responses.map((response) => (
                          <div key={response._id} className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <Badge variant={response.response_type === 'admin' ? 'highlight' : 'outline'} size="sm">
                                  {response.response_type}
                                </Badge>
                                <span className="text-sm text-gray-600">
                                  {response.author_id?.email || 'Anonymous'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                      key={star}
                                      className={`text-lg ${star <= (response.rating || 0) ? 'text-highlight' : 'text-gray-300'}`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                                {response.approval && (
                                  <Badge variant="highlight" size="sm">Approved</Badge>
                                )}
                              </div>
                            </div>
                            <FormattedAnswer text={response.response_text} />
                            {response.rating === null && !query.is_locked && selectedResponse !== response._id && (
                              <button
                                onClick={() => {
                                  setSelectedResponse(response._id);
                                  setRating(0);
                                  setRaterNote('');
                                }}
                                className="mt-4 text-sm font-medium text-black hover:text-gray-700 inline-flex items-center gap-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                                Rate this response
                              </button>
                            )}
                            {selectedResponse === response._id && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm font-medium text-gray-700 mb-3">Rate this response:</p>
                                <div className="flex items-center gap-2 mb-4">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      onClick={() => setRating(star)}
                                      disabled={submitting}
                                      className={`text-2xl transition-colors ${star <= rating ? 'text-highlight' : 'text-gray-300'} hover:text-highlight`}
                                    >
                                      ★
                                    </button>
                                  ))}
                                  <span className="text-sm text-gray-500 ml-3">
                                    {rating > 0 && (rating <= 2 ? 'Low quality' : rating <= 4 ? 'Good quality' : 'Excellent')}
                                  </span>
                                </div>
                                <div className="mb-4">
                                  <label className="text-sm font-medium text-gray-700 block mb-2">Add a note (optional):</label>
                                  <textarea
                                    value={raterNote}
                                    onChange={(e) => setRaterNote(e.target.value)}
                                    placeholder="Provide feedback for admins..."
                                    maxLength={500}
                                    disabled={submitting}
                                    className="w-full p-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all bg-white"
                                    rows={3}
                                  />
                                  <p className="text-xs text-gray-400 mt-1 text-right">{raterNote.length}/500</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Button
                                    onClick={() => handleRate(response._id, rating)}
                                    disabled={rating === 0 || submitting}
                                    size="sm"
                                  >
                                    {submitting ? (
                                      <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Submitting...
                                      </span>
                                    ) : 'Submit Rating'}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedResponse(null);
                                      setRating(0);
                                      setRaterNote('');
                                    }}
                                    disabled={submitting}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                            {response.rater_note && (
                              <div className="mt-4 p-4 bg-highlight-light rounded-xl">
                                <p className="text-xs font-medium text-gray-500 mb-1">Your note:</p>
                                <p className="text-gray-800 text-sm">{response.rater_note}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-500">Waiting for peer responses...</p>
                      </div>
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
