/**
 * =============================================================================
 * QUERY.IN - ASK AI PAGE
 * =============================================================================
 * Modern SaaS-style AI query interface with clean cards and professional spacing.
 * Features: Auto-complete, RAG search, LLM fallback, peer escalation.
 *
 * @module pages/intern/AskAI
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import FormattedAnswer from '../../components/FormattedAnswer';
import ConfirmModal from '../../components/ConfirmModal';
import api from '../../utils/api';

const AskAI = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [showEscalateConfirm, setShowEscalateConfirm] = useState(false);
  const [pendingVote, setPendingVote] = useState(null);

  const debounceRef = { current: null };

  const debounce = (func, wait) => {
    return (...args) => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => func(...args), wait);
    };
  };

  const cancelDebounce = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  };

  const searchSuggestions = useCallback(
    debounce(async (searchTerm) => {
      if (searchTerm.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const res = await api.get(`/ask/autocomplete?q=${encodeURIComponent(searchTerm)}`);
        setSuggestions(res.data.data || []);
        setShowSuggestions(res.data.data?.length > 0);
      } catch (err) {
        setSuggestions([]);
      }
    }, 300),
    []
  );

  const handleQueryChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setResponse(null);
    setError('');
    searchSuggestions(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      setShowSuggestions(false);
      setSuggestions([]);
      if (query.trim()) {
        handleSubmit(e);
      }
    }
  };

  const handleSelectSuggestion = async (faq) => {
    setShowSuggestions(false);
    setSuggestions([]);
    setQuery(faq.clean_question);
    setResponse({
      source: 'autocomplete',
      answer: faq.answer,
      clean_question: faq.clean_question,
      category: faq.category,
    });

    try {
      await api.post('/ask', {
        query: faq.clean_question,
        intern_id: user.id,
        action: 'autocomplete_select',
        faq_id: faq._id,
      });
    } catch (err) {
      console.error('Autocomplete telemetry failed:', err);
    }
  };

  const validateQuery = (text) => {
    const trimmed = text.trim();

    if (trimmed.length < 5) {
      return 'Please enter a more detailed question (at least 5 characters).';
    }

    if (trimmed.length > 1000) {
      return 'Query is too long. Please limit to 1000 characters.';
    }

    const letterCount = (trimmed.match(/[a-zA-Z]/g) || []).length;
    const totalChars = trimmed.replace(/\s/g, '').length;
    if (letterCount < 4) {
      return 'Please enter a valid question with actual words.';
    }

    const specialCharRatio = totalChars > 0 ? (totalChars - letterCount) / totalChars : 0;
    if (specialCharRatio > 0.3) {
      return 'Please enter a valid question without too many special characters.';
    }

    if (/^(.)\1{2,}$/.test(trimmed)) {
      return 'Please enter a valid question without repeated characters.';
    }

    if (!/[a-zA-Z]{3,}/.test(trimmed)) {
      return 'Please enter a valid question with at least 3 consecutive letters.';
    }

    const uniqueLetters = new Set(trimmed.toLowerCase().match(/[a-z]/g) || []);
    const requiredUnique = Math.min(6, Math.max(3, Math.floor(letterCount * 0.4)));
    if (uniqueLetters.size < requiredUnique) {
      return `Please enter a valid question with at least ${requiredUnique} different letters.`;
    }

    const commonWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'how', 'why', 'who', 'what', 'when', 'where', 'which', 'their', 'there', 'have', 'has', 'been', 'will', 'this', 'that', 'with', 'would', 'from', 'they', 'them', 'than'];
    const lowerTrimmed = trimmed.toLowerCase();
    const hasCommonWord = commonWords.some(word => lowerTrimmed.includes(word));
    if (letterCount > 20 && !hasCommonWord && uniqueLetters.size < 8) {
      return 'Please enter a meaningful question.';
    }

    const sequentialCount = (trimmed.match(/(.)\1{1,}/g) || []).join('').length;
    if (sequentialCount > trimmed.length * 0.4) {
      return 'Please enter a valid question without repeated patterns.';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateQuery(query);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    cancelDebounce();
    setShowSuggestions(false);
    setSuggestions([]);

    try {
      const res = await api.post('/ask', {
        query: query.trim(),
        intern_id: user.id,
      });

      const data = res.data;

      if (!data.success && data.error) {
        setError(data.error);
        return;
      }

      setResponse({
        source: data.source,
        answer: data.answer,
        clean_question: data.clean_question,
        category: data.category,
        faq_id: data.faq_id,
        resolution: data.resolution,
        message: data.message,
        originalQueryText: data.originalQueryText,
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (vote) => {
    if (!response) return;

    if (vote === 'downvote') {
      setPendingVote('downvote');
      setShowEscalateConfirm(true);
      return;
    }

    setLoading(true);
    const action = response.source === 'rag' ? `rag_${vote}` : `grok_${vote}`;

    try {
      const res = await api.post('/ask', {
        query: query.trim(),
        intern_id: user.id,
        action,
        faq_id: response.faq_id,
      });

      const data = res.data;

      if (data.resolution === 'escalated') {
        setResponse({
          resolution: 'escalated',
          query_id: data.query_id,
          message: data.message,
        });
      } else if (data.resolution === 'resolved') {
        setResponse({
          source: data.source || 'resolved',
          resolution: 'resolved',
          message: data.message || 'Thank you for your feedback!',
          originalQueryText: data.originalQueryText,
          answer: data.answer,
        });
      } else if (data.resolution === 'pending_feedback' && data.answer) {
        setResponse({
          source: data.source,
          answer: data.answer,
          clean_question: data.clean_question,
          category: data.category,
          faq_id: data.faq_id,
          resolution: data.resolution,
          message: data.message,
        });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to submit feedback. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setQuery('');
    setResponse(null);
    setError('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const confirmEscalate = async () => {
    setShowEscalateConfirm(false);
    if (!pendingVote) return;

    setLoading(true);
    const action = response.source === 'rag' ? `rag_${pendingVote}` : `grok_${pendingVote}`;
    setPendingVote(null);

    try {
      const res = await api.post('/ask', {
        query: query.trim(),
        intern_id: user.id,
        action,
        faq_id: response.faq_id,
      });

      const data = res.data;

      if (data.resolution === 'escalated') {
        setResponse({
          resolution: 'escalated',
          query_id: data.query_id,
          message: data.message,
        });
      } else if (data.resolution === 'resolved') {
        setResponse({
          source: data.source || 'resolved',
          resolution: 'resolved',
          message: data.message || 'Thank you for your feedback!',
          originalQueryText: data.originalQueryText,
          answer: data.answer,
        });
      } else if (data.resolution === 'pending_feedback' && data.answer) {
        setResponse({
          source: data.source,
          answer: data.answer,
          clean_question: data.clean_question,
          category: data.category,
          faq_id: data.faq_id,
          resolution: data.resolution,
          message: data.message,
        });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to submit feedback. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const cancelEscalate = () => {
    setShowEscalateConfirm(false);
    setPendingVote(null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black">Ask AI</h1>
          <p className="text-gray-500 mt-1">Get instant answers from our knowledge base</p>
        </div>

        {/* Query Input Card */}
        <Card className="hover:shadow-lg transition-shadow" hover={false}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type your question
              </label>
              <div className="relative">
                <textarea
                  value={query}
                  onChange={handleQueryChange}
                  onKeyDown={handleKeyDown}
                  placeholder="How do I submit my NOC? What is the process for... (Shift+Enter for new line)"
                  className="w-full px-4 py-3.5 pr-12 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black rounded-xl text-base transition-all resize-none min-h-[52px] max-h-40"
                  rows={1}
                  disabled={loading || response?.resolution === 'escalated' || response?.resolution === 'resolved'}
                  style={{ height: 'auto', overflow: 'hidden' }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || !query.trim() || response?.resolution === 'escalated' || response?.resolution === 'resolved'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Auto-complete suggestions dropdown */}
              {!response && showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-72 overflow-y-auto">
                  {suggestions.map((faq) => (
                    <button
                      key={faq._id}
                      type="button"
                      onClick={() => handleSelectSuggestion(faq)}
                      className="w-full text-left px-4 py-3.5 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="font-medium text-gray-900 text-sm">{faq.clean_question}</div>
                      <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 rounded text-xs">{faq.category}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm rounded-xl animate-fade-in">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              {response && response.resolution === 'pending_feedback' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={reset}
                  size="lg"
                >
                  Ask Another
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Response Display */}
        {response?.answer && (
          <Card className="hover:shadow-lg transition-shadow" hover={false}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <Badge variant={response.source === 'autocomplete' ? 'highlight' : response.source === 'rag' ? 'outline' : response.source === 'previously_resolved' ? 'filled' : 'filled'} size="lg">
                  {response.source === 'autocomplete' ? 'Instant Match' : response.source === 'rag' ? 'RAG Match' : response.source === 'previously_resolved' ? 'Previously Resolved' : 'AI Generated'}
                </Badge>
                {response.category && (
                  <span className="text-sm text-gray-500">{response.category}</span>
                )}
              </div>
            </div>

            {response.source === 'previously_resolved' && response.originalQueryText && (
              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Similar Query</p>
                <p className="text-gray-800 font-medium">{response.originalQueryText}</p>
              </div>
            )}

            {response.clean_question && (
              <h3 className="font-semibold text-gray-900 text-lg mb-4">{response.clean_question}</h3>
            )}

            <FormattedAnswer text={response.answer} />

            {response.resolution === 'pending_feedback' && (
              <div className="mt-6 pt-5 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-4 text-center">
                  {response.message || 'Was this helpful?'}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="primary"
                    onClick={() => handleVote('upvote')}
                    disabled={loading}
                    size="lg"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                    </svg>
                    Yes, helpful
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleVote('downvote')}
                    disabled={loading}
                    size="lg"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                    </svg>
                    Not helpful
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Escalated State */}
        {response?.resolution === 'escalated' && (
          <Card className="bg-black text-white text-center py-10 hover:shadow-xl transition-shadow" hover={false}>
            <div className="w-16 h-16 bg-green-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Query Escalated</h2>
            <p className="text-gray-400 mb-6 max-w-sm mx-auto">{response.message}</p>
            <Button variant="primary" onClick={reset}>Ask Another Question</Button>
          </Card>
        )}

        {/* Resolved State */}
        {response?.resolution === 'resolved' && response.source === 'previously_resolved' && (
          <Card className="hover:shadow-lg transition-shadow" hover={false}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-black">Previously Resolved</h2>
                <p className="text-sm text-gray-500">{response.message}</p>
              </div>
            </div>

            {response.originalQueryText && (
              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Similar Query Asked By Another Intern</p>
                <p className="text-gray-800 font-medium">{response.originalQueryText}</p>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Approved Response</p>
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">Answer: {response.answer || 'NO ANSWER PROVIDED'}</pre>
            </div>

            <div className="mt-6 pt-5 border-t border-gray-100">
              <Button variant="primary" onClick={reset} size="lg">Ask Another Question</Button>
            </div>
          </Card>
        )}

        {response?.resolution === 'resolved' && response.source !== 'previously_resolved' && (
          <Card className="bg-black text-white text-center py-10 hover:shadow-xl transition-shadow" hover={false}>
            <div className="w-16 h-16 bg-green-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Thank You!</h2>
            <p className="text-gray-400 mb-6">{response.message}</p>
            <Button variant="primary" onClick={reset}>Ask Another Question</Button>
          </Card>
        )}

        <ConfirmModal
          isOpen={showEscalateConfirm}
          onClose={cancelEscalate}
          onConfirm={confirmEscalate}
          title={response?.source === 'grok' ? 'Escalate to Peer Queue?' : 'Ask AI?'}
          message={response?.source === 'grok'
            ? 'Your query will be sent to other interns for help. An administrator will review the response.'
            : "I'll try to answer your question with AI. If you're still not satisfied, your query will be sent to other interns for help."
          }
          confirmText={response?.source === 'grok' ? 'Escalate' : 'Continue'}
          cancelText="Cancel"
          variant={response?.source === 'grok' ? 'warning' : 'primary'}
          isLoading={loading}
          icon={
            response?.source === 'grok' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            )
          }
        />
      </div>
    </DashboardLayout>
  );
};

export default AskAI;
