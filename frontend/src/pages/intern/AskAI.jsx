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
import api from '../../utils/api';

const navItems = [
  {
    path: '/intern',
    label: 'Dashboard',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  },
  {
    path: '/intern/ask',
    label: 'Ask AI',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  },
  {
    path: '/intern/faqs',
    label: 'View FAQs',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
];

const AskAI = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
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
    if (e.key === 'Enter') {
      if (showSuggestions && suggestions.length > 0) {
        e.preventDefault();
        setShowSuggestions(false);
        setSuggestions([]);
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
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (vote) => {
    if (!response) return;

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
          resolution: 'resolved',
          message: 'Thank you for your feedback!',
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

  return (
    <DashboardLayout navItems={navItems}>
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
                <input
                  type="text"
                  value={query}
                  onChange={handleQueryChange}
                  onKeyDown={handleKeyDown}
                  placeholder="How do I submit my NOC? What is the process for..."
                  className="w-full px-4 py-3.5 pr-12 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black rounded-xl text-base transition-all"
                  disabled={loading || response?.resolution === 'escalated' || response?.resolution === 'resolved'}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-gray-400" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Auto-complete suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
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
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !query.trim()}
                className="flex-1"
                size="lg"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </span>
                ) : 'Get Answer'}
              </Button>
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
                <Badge variant={response.source === 'autocomplete' ? 'highlight' : response.source === 'rag' ? 'outline' : 'filled'} size="lg">
                  {response.source === 'autocomplete' ? 'Instant Match' : response.source === 'rag' ? 'RAG Match' : 'AI Generated'}
                </Badge>
                {response.category && (
                  <span className="text-sm text-gray-500">{response.category}</span>
                )}
              </div>
            </div>

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
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095a2 2 0 01-2-2v4a2 2 0 002 2h3a2 2 0 012-2h3a2 2 0 001-2v-3a2 2 0 00-2-2h-3a2 2 0 00-2 2v4a2 2 0 01-2 2h-3a2 2 0 01-2-2V5a2 2 0 012-2h3a2 2 0 012 2v4" />
                    </svg>
                    Yes, helpful
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleVote('downvote')}
                    disabled={loading}
                    size="lg"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v4a2 2 0 01-2 2h-2" />
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
            <div className="w-16 h-16 bg-highlight text-black rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Query Escalated</h2>
            <p className="text-gray-400 mb-6 max-w-sm mx-auto">{response.message}</p>
            <Button variant="highlight" onClick={reset}>Ask Another Question</Button>
          </Card>
        )}

        {/* Resolved State */}
        {response?.resolution === 'resolved' && (
          <Card className="bg-black text-white text-center py-10 hover:shadow-xl transition-shadow" hover={false}>
            <div className="w-16 h-16 bg-highlight text-black rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Thank You!</h2>
            <p className="text-gray-400 mb-6">{response.message}</p>
            <Button variant="highlight" onClick={reset}>Ask Another Question</Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AskAI;
