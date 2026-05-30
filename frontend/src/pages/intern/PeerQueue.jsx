/**
 * =============================================================================
 * QUERY.IN - PEER ANSWER QUEUE PAGE
 * =============================================================================
 * Modern SaaS-style interface for answering peer queries.
 * Sequential query viewing with submit/skip/ambiguous actions.
 *
 * @module pages/intern/PeerQueue
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import api from '../../utils/api';

const PeerQueue = () => {
  const [queries, setQueries] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

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
      setMessageType('');
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
      setMessage('');
      await api.post('/peer/answer', {
        query_id: query._id,
        response_text: answerText.trim(),
      });
      setMessage('Answer submitted successfully!');
      setMessageType('success');
      setAnswerText('');
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setMessage('');
        setMessageType('');
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to submit answer');
      setMessageType('error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (currentIndex < queries.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setAnswerText('');
      setMessage('');
      setMessageType('');
    } else {
      setMessage('No more queries in queue');
      setMessageType('info');
    }
  };

  const handleMarkAmbiguous = async () => {
    if (currentIndex >= queries.length) return;
    const query = queries[currentIndex];

    try {
      const res = await api.post('/peer/ambiguous', { query_id: query._id });
      setMessage(res.data.message);
      setMessageType('info');
      setTimeout(() => {
        fetchQueue();
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to mark as ambiguous');
      setMessageType('error');
    }
  };

  const currentQuery = queries[currentIndex];

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Peer Answer Queue</h1>
            <p className="text-gray-500 mt-1">Help your fellow interns by answering their questions</p>
          </div>
          <Badge variant="filled" size="lg">{queries.length} pending</Badge>
        </div>

        {/* Loading State */}
        {loading ? (
          <Card className="py-12 text-center" hover={false}>
            <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading queue...</p>
          </Card>
        ) : queries.length === 0 ? (
          <Card className="py-12 text-center" hover={false}>
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Queue Empty</h2>
            <p className="text-gray-500 mb-5">No pending queries to answer right now</p>
            <Button variant="outline" onClick={fetchQueue}>Refresh Queue</Button>
          </Card>
        ) : currentIndex >= queries.length ? (
          <Card className="py-12 text-center" hover={false}>
            <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">All Done!</h2>
            <p className="text-gray-500 mb-5">You've reviewed all available queries</p>
            <Button variant="primary" onClick={fetchQueue}>Review More</Button>
          </Card>
        ) : (
          <>
            {/* Query Card */}
            <Card className="hover:shadow-lg transition-shadow" hover={false}>
              <div className="flex items-center justify-between mb-5">
                <Badge variant="outline" size="lg">Pending Query</Badge>
                <span className="text-sm text-gray-500">
                  {currentIndex + 1} of {queries.length}
                </span>
              </div>

              <div className="p-5 bg-gray-50 rounded-xl mb-4">
                <p className="text-gray-900 font-medium text-base leading-relaxed">{currentQuery.query_text}</p>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-xs font-bold">
                    {currentQuery.intern_id?.email?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className="text-gray-600">{currentQuery.intern_id?.email || 'Unknown'}</span>
                </div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-gray-600">{currentQuery.responses?.length || 0}/5 responses</span>
                </div>
              </div>
            </Card>

            {/* Answer Form */}
            <Card className="hover:shadow-lg transition-shadow" hover={false}>
              <h3 className="font-semibold text-gray-900 mb-4">Your Answer</h3>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Share your knowledge to help your peer..."
                rows={5}
                className="w-full px-4 py-3 bg-gray-50 border-0 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white rounded-xl transition-all resize-none text-base"
                disabled={submitting}
              />
              
              {message && (
                <div className={`mt-4 p-4 rounded-xl text-sm ${
                  messageType === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                  messageType === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                  'bg-gray-50 text-gray-700 border border-gray-200'
                }`}>
                  {message}
                </div>
              )}

              <div className="flex gap-3 mt-5">
                <Button
                  variant="primary"
                  onClick={handleSubmitAnswer}
                  disabled={submitting || !answerText.trim()}
                  className="flex-1"
                  size="lg"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Submitting...
                    </span>
                  ) : 'Submit Answer'}
                </Button>
                <Button variant="outline" onClick={handleSkip} disabled={submitting} size="lg">
                  Skip
                </Button>
                <Button variant="ghost" onClick={handleMarkAmbiguous} disabled={submitting} size="lg">
                  Mark Unclear
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