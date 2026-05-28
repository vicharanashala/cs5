/**
 * =============================================================================
 * QUERY.IN - ASK AI PAGE (Intern)
 * =============================================================================
 * Provides the "Ask AI" experience with intelligent query resolution:
 *
 * PHASE 0 - Auto-complete: Live suggestions as user types (debounced 300ms)
 * PHASE 1 - RAG Search: Database lookup with >50% keyword match
 *   - Upvote: Mark resolved
 *   - Downvote: Trigger Gemini LLM
 * PHASE 2 - Gemini LLM: Context-aware answer synthesis
 *   - Upvote: Mark resolved
 *   - Downvote: Escalate to peer queue
 * PHASE 3 - Peer Escalation: Query added to pending queue
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

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
      }
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
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
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Ask AI</h1>
          <p className="text-text-secondary mt-1">Get instant answers or escalate to peers</p>
        </div>

        {/* Query Input */}
        <Card className="border-2 border-black rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Type your question below
              </label>
              <input
                type="text"
                value={query}
                onChange={handleQueryChange}
                onKeyDown={handleKeyDown}
                placeholder="How do I submit my NOC?"
                className="w-full px-4 py-3 border-2 border-black bg-white text-black placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-black rounded-lg text-lg"
                disabled={loading || response?.resolution === 'escalated' || response?.resolution === 'resolved'}
              />

              {/* Auto-complete suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border-2 border-black rounded-lg shadow-elevated max-h-64 overflow-y-auto">
                  {suggestions.map((faq) => (
                    <button
                      key={faq._id}
                      type="button"
                      onClick={() => handleSelectSuggestion(faq)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-border-subtle last:border-b-0 transition-colors"
                    >
                      <div className="font-medium text-black text-sm">{faq.clean_question}</div>
                      <div className="text-xs text-text-muted mt-1">{faq.category}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm rounded-lg">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !query.trim()}
                className="flex-1"
              >
                {loading ? 'Processing...' : 'Get Answer'}
              </Button>
              {response && (response.resolution === 'pending_feedback') && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={reset}
                >
                  Ask Another
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Response Display */}
        {response?.answer && (
          <Card className="border-2 border-black rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge variant={response.source === 'autocomplete' ? 'verified' : response.source === 'rag' ? 'outline' : 'filled'}>
                  {response.source === 'autocomplete' ? 'Instant Match' : response.source === 'rag' ? 'RAG Match' : 'AI Generated'}
                </Badge>
                {response.category && (
                  <span className="text-sm text-text-muted">{response.category}</span>
                )}
              </div>
            </div>

            {response.clean_question && (
              <h3 className="font-semibold text-black mb-3">{response.clean_question}</h3>
            )}

            <FormattedAnswer text={response.answer} />

            {response.resolution === 'pending_feedback' && (
              <div className="mt-6 pt-4 border-t border-border-subtle">
                <p className="text-sm text-text-secondary mb-4 text-center">
                  {response.message || 'Was this helpful?'}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="primary"
                    onClick={() => handleVote('upvote')}
                    disabled={loading}
                    className="px-8"
                  >
                    ↑ Upvote
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleVote('downvote')}
                    disabled={loading}
                    className="px-8"
                  >
                    ↓ Downvote
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Resolution States */}
        {response?.resolution === 'escalated' && (
          <Card className="border-2 border-black rounded-lg text-center py-8">
            <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-black mb-2">Query Escalated</h2>
            <p className="text-text-secondary mb-4">{response.message}</p>
            <Button variant="outline" onClick={reset}>Ask Another Question</Button>
          </Card>
        )}

        {response?.resolution === 'resolved' && (
          <Card className="border-2 border-black rounded-lg text-center py-8">
            <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-black mb-2">Thank You!</h2>
            <p className="text-text-secondary mb-4">{response.message}</p>
            <Button variant="outline" onClick={reset}>Ask Another Question</Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AskAI;