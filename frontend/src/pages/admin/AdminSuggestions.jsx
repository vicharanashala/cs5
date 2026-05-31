/**
 * =============================================================================
 * QUERY.IN - ADMIN SUGGESTIONS PAGE
 * =============================================================================
 * Card 7: AI FAQ Suggestions with content gap tracking.
 *
 * FEATURES:
 * 1. Displays suggestions where occurrenceCount >= 10
 * 2. Yellow border alert when new unread suggestions exist OR yellow_alert socket event received
 * 3. Dismiss action to clear suggestions
 * 4. "Add to FAQs" button that opens modal to create FAQ
 * 5. Listens for real-time yellow_alert events from Socket.IO
 *
 * @module pages/admin/AdminSuggestions
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import api from '../../utils/api';
import { useNotifications } from '../../context/NotificationContext';

const AdminSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasNewSuggestions, setHasNewSuggestions] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [faqForm, setFaqForm] = useState({
    clean_question: '',
    answer: '',
    category: 'General',
    keywords: '',
    tags: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const { yellowAlert, clearYellowAlert } = useNotifications();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (yellowAlert) {
      setHasNewSuggestions(true);
    }
  }, [yellowAlert]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [suggestionsRes, statsRes] = await Promise.all([
        api.get('/analytics/faq-suggestions'),
        api.get('/analytics/stats'),
      ]);
      setSuggestions(suggestionsRes.data.data || []);
      setStats(statsRes.data.data);
      setHasNewSuggestions(suggestionsRes.data.data?.length > 0);
    } catch (err) {
      console.error('Failed to fetch suggestions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (id) => {
    try {
      await api.delete(`/analytics/suggestions/${id}`);
      setSuggestions((prev) => prev.filter((s) => s._id !== id));
      if (suggestions.length <= 1) {
        setHasNewSuggestions(false);
      }
    } catch (err) {
      console.error('Failed to dismiss', err);
    }
  };

  const handleAddToFaqs = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setFaqForm({
      clean_question: suggestion.queryText,
      answer: '',
      category: 'General',
      keywords: '',
      tags: '',
    });
    setShowFaqModal(true);
  };

  const handleCreateFaq = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const faqData = {
        ...faqForm,
        keywords: faqForm.keywords.split(',').map((k) => k.trim()).filter(Boolean),
        tags: faqForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };
      await api.post('/analytics/create-faq', { id: selectedSuggestion._id, ...faqData });
      setShowFaqModal(false);
      setSuggestions((prev) => prev.filter((s) => s._id !== selectedSuggestion._id));
      if (suggestions.length <= 1) {
        setHasNewSuggestions(false);
      }
    } catch (err) {
      console.error('Failed to create FAQ', err);
    } finally {
      setSubmitting(false);
    }
  };

  const cardClass = hasNewSuggestions
    ? 'border-4 border-yellow-400 bg-yellow-50'
    : 'border-2 border-black';

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-black">AI FAQ Suggestions</h1>
          <p className="text-text-secondary mt-1">
            Content gaps detected from unanswerable queries (10+ occurrences)
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className={hasNewSuggestions ? 'border-2 border-yellow-400' : 'border border-black'}>
              <div className="text-3xl font-bold text-black">{stats.suggestions_ready}</div>
              <div className="text-sm text-text-secondary mt-1">Suggestions Ready</div>
            </Card>
            <Card className="border border-black">
              <div className="text-3xl font-bold text-black">{stats.total_content_gaps}</div>
              <div className="text-sm text-text-secondary mt-1">Total Content Gaps</div>
            </Card>
            <Card className="border border-black">
              <div className="text-3xl font-bold text-black">{stats.average_occurrences?.toFixed(1) || 0}</div>
              <div className="text-sm text-text-secondary mt-1">Avg Occurrences</div>
            </Card>
          </div>
        )}

        {yellowAlert && (
          <div className="p-4 border-4 border-yellow-400 bg-yellow-50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-black">New Content Gap Alert!</p>
                <p className="text-sm text-black mt-1">
                  "{yellowAlert.queryText}" has reached {yellowAlert.occurrenceCount} occurrences
                </p>
              </div>
              <button
                onClick={clearYellowAlert}
                className="text-sm text-yellow-700 hover:text-yellow-900 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <Card className={cardClass}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-black">FAQ Creation Suggestions</h2>
              {hasNewSuggestions && (
                <Badge variant="filled" className="bg-yellow-400 text-black">
                  New
                </Badge>
              )}
            </div>
            {hasNewSuggestions && (
              <button
                onClick={() => setHasNewSuggestions(false)}
                className="text-sm text-text-muted hover:text-black underline"
              >
                Dismiss Alert
              </button>
            )}
          </div>

          {loading ? (
            <p className="text-text-muted">Loading suggestions...</p>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-muted">No suggestions yet. Keep monitoring content gaps.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion._id}
                  className="p-4 border border-gray-200 hover:border-gray-400 transition-all rounded-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="filled">{suggestion.occurrenceCount} hits</Badge>
                        <span className="text-sm text-text-muted">
                          {suggestion.impactedInterns?.length || 0} interns affected
                        </span>
                      </div>
                      <p className="text-black font-medium">{suggestion.queryText}</p>
                      <p className="text-sm text-text-muted mt-1">
                        First logged: {new Date(suggestion.firstLoggedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        onClick={() => handleAddToFaqs(suggestion)}
                        className="px-4 py-2 text-sm"
                      >
                        Add to FAQs
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDismiss(suggestion._id)}
                        className="px-4 py-2 text-sm"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {showFaqModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="border-2 border-black rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-black mb-4">Create FAQ from Suggestion</h3>
            <form onSubmit={handleCreateFaq} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">Question</label>
                <input
                  type="text"
                  value={faqForm.clean_question}
                  onChange={(e) => setFaqForm({ ...faqForm, clean_question: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Answer</label>
                <textarea
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Category</label>
                  <select
                    value={faqForm.category}
                    onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option>General</option>
                    <option>Program Info</option>
                    <option>Eligibility</option>
                    <option>Rules</option>
                    <option>Timeline</option>
                    <option>Application</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Keywords (comma-separated)</label>
                  <input
                    type="text"
                    value={faqForm.keywords}
                    onChange={(e) => setFaqForm({ ...faqForm, keywords: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="internship, vINS, program"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={faqForm.tags}
                  onChange={(e) => setFaqForm({ ...faqForm, tags: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="free, online, certificate"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="primary" disabled={submitting} className="flex-1">
                  {submitting ? 'Creating...' : 'Create FAQ'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowFaqModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminSuggestions;
