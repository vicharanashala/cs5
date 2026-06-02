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

const MyEscalations = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuery, setExpandedQuery] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [rating, setRating] = useState(0);
  const [raterNote, setRaterNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [deleteModal, setDeleteModal] = useState({ show: false, query: null });
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteEscalation = async () => {
    if (!deleteModal.query) return;
    try {
      setDeleting(true);
      await api.delete(`/peer/${deleteModal.query._id}`);
      await fetchMyQueries();
      setDeleteModal({ show: false, query: null });
    } catch (err) {
      console.error('Failed to delete escalation', err);
      alert(err.response?.data?.error || 'Failed to delete escalation');
    } finally {
      setDeleting(false);
    }
  };

  const canDeleteQuery = (query) => {
    if (query.status === 'Resolved' || query.status === 'Ambiguous') return false;
    if (query.responses?.some((r) => r.approval === true)) return false;
    return true;
  };

  const getStatusBadge = (query) => {
    if (query.resolution_type === 'peer_approved' || query.resolution_type === 'admin_override') {
      return <Badge variant="success" size="lg">Approved</Badge>;
    }
    switch (query.status) {
      case 'Pending':
        return <Badge variant="pending" size="lg">Pending</Badge>;
      case 'Peer Answered':
        return <Badge variant="peer" size="lg">Peer Answered</Badge>;
      case 'Ambiguous':
        return <Badge variant="error" size="lg">Ambiguous</Badge>;
      case 'Resolved':
        return <Badge variant="success" size="lg">Resolved</Badge>;
      default:
        return <Badge variant="outline" size="lg">{query.status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
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
          <div className="bg-red-50 border-l-4 border-l-red-600 border border-red-200 rounded-xl p-5 shadow-md">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-red-200">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-red-700">Warning: Misuse Alert</h3>
                <p className="text-red-600 text-sm mt-1">
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
                        {canDeleteQuery(query) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteModal({ show: true, query });
                            }}
                            className="text-xs font-medium text-red-600 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        )}
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
                                <Badge variant="filled" size="sm">
                                  {response.response_type === 'admin'
                                    ? (response.approval ? 'Admin Approved' : 'Admin Override')
                                    : response.response_type === 'moderator'
                                    ? (response.approval ? 'Moderator Approved' : 'Moderator Override')
                                    : response.response_type === 'peer' && response.approval
                                    ? (query.resolved_by?.role === 'moderator' ? 'Moderator Approved' : 'Admin Approved')
                                    : 'Peer'}
                                </Badge>
                                <span className="text-sm text-gray-600">
                                  {response.author_id?.email || 'Anonymous'}
                                </span>
                              </div>
                              {response.rating !== null && (
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <span
                                        key={star}
                                        className={`text-lg ${star <= (response.rating || 0) ? 'text-yellow-500' : 'text-gray-300'}`}
                                      >
                                        ★
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
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
                                      className={`text-2xl transition-colors ${star <= rating ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-500`}
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

        {/* Delete Confirmation Modal */}
        {deleteModal.show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-red-200">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Escalation</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-gray-600 mb-2">
                Are you sure you want to delete this escalation?
              </p>
              <p className="text-sm text-gray-500 mb-6 p-3 bg-gray-50 rounded-xl border border-gray-100">
                "{deleteModal.query?.query_text?.substring(0, 100)}{deleteModal.query?.query_text?.length > 100 ? '...' : ''}"
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  onClick={handleDeleteEscalation}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700 border-red-600"
                >
                  {deleting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Deleting...
                    </span>
                  ) : 'Delete'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDeleteModal({ show: false, query: null })}
                  disabled={deleting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyEscalations;
