/**
 * =============================================================================
 * QUERY.IN - PEER QUEUE PAGE (Intern)
 * =============================================================================
 * Allows interns to view and answer escalated queries from other interns.
 *
 * FUNCTIONS:
 * 1. Fetch pending queries from peer queue (excludes own queries)
 * 2. Submit peer answers (max 5 per query)
 * 3. Skip queries (move to next)
 * 4. Mark queries as ambiguous (3-strike rule)
 *
 * @module pages/intern/PeerQueue
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import api from '../../utils/api';

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

const PeerQueue = () => {
  const [queries, setQueries] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await api.get('/peer/queue');
      setQueries(res.data.data || []);
      setCurrentIndex(0);
      setMessage('');
    } catch (err) {
      console.error('Failed to fetch queue', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim() || currentIndex >= queries.length) return;

    const query = queries[currentIndex];
    try {
      setSubmitting(true);
      await api.post('/peer/answer', {
        query_id: query._id,
        response_text: answerText.trim(),
      });
      setMessage('Answer submitted successfully!');
      setAnswerText('');
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setMessage('');
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (currentIndex < queries.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setAnswerText('');
      setMessage('');
    } else {
      setMessage('No more queries in queue');
    }
  };

  const handleMarkAmbiguous = async () => {
    if (currentIndex >= queries.length) return;
    const query = queries[currentIndex];

    try {
      const res = await api.post('/peer/ambiguous', { query_id: query._id });
      setMessage(res.data.message);
      setTimeout(() => {
        fetchQueue();
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to mark as ambiguous');
    }
  };

  const currentQuery = queries[currentIndex];

  return (
    <DashboardLayout navItems={navItems}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Peer Answer Queue</h1>
            <p className="text-text-secondary mt-1">Help your fellow interns by answering their questions</p>
          </div>
          <Badge variant="outline">{queries.length} queries pending</Badge>
        </div>

        {loading ? (
          <Card className="border-2 border-black rounded-lg p-8 text-center">
            <p className="text-text-muted">Loading queue...</p>
          </Card>
        ) : queries.length === 0 ? (
          <Card className="border-2 border-black rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-black mb-2">Queue Empty</h2>
            <p className="text-text-secondary">No pending queries to answer. Check back later!</p>
          </Card>
        ) : currentIndex >= queries.length ? (
          <Card className="border-2 border-black rounded-lg p-8 text-center">
            <h2 className="text-xl font-bold text-black mb-2">All Done!</h2>
            <p className="text-text-secondary mb-4">You've reviewed all available queries</p>
            <Button variant="outline" onClick={fetchQueue}>Refresh Queue</Button>
          </Card>
        ) : (
          <>
            <Card className="border-2 border-black rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="filled">Pending Query</Badge>
                <span className="text-sm text-text-muted">
                  {currentIndex + 1} of {queries.length}
                </span>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-4">
                <p className="text-black font-medium">{currentQuery.query_text}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
                <span>Asked by:</span>
                <span className="font-medium">{currentQuery.intern_id?.email || 'Unknown'}</span>
                <span>|</span>
                <span>{currentQuery.responses?.length || 0}/5 responses</span>
              </div>
            </Card>

            <Card className="border-2 border-black rounded-lg">
              <h3 className="font-semibold text-black mb-3">Your Answer</h3>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Type your answer here..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-black bg-white text-black placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-black rounded-lg resize-none"
                disabled={submitting}
              />
              {message && (
                <div className="mt-3 p-3 bg-gray-100 border border-gray-300 rounded-lg text-sm text-black">
                  {message}
                </div>
              )}
              <div className="flex gap-3 mt-4">
                <Button
                  variant="primary"
                  onClick={handleSubmitAnswer}
                  disabled={submitting || !answerText.trim()}
                  className="flex-1"
                >
                  {submitting ? 'Submitting...' : 'Submit Answer'}
                </Button>
                <Button variant="outline" onClick={handleSkip} disabled={submitting}>
                  Skip
                </Button>
                <Button variant="outline" onClick={handleMarkAmbiguous} disabled={submitting}>
                  Mark Ambiguous
                </Button>
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PeerQueue;