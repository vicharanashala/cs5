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

const navItems = [
  {
    path: '/admin',
    label: 'Dashboard',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  },
  {
    path: '/admin/users',
    label: 'User Management',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  },
  {
    path: '/admin/announcements',
    label: 'Broadcast Announcement',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>,
  },
  {
    path: '/admin/queries',
    label: 'Master Query Monitor',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  },
  {
    path: '/admin/faqs',
    label: 'FAQ Database',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    path: '/admin/suggestions',
    label: 'AI FAQ Suggestions',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  },
];

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
    <DashboardLayout navItems={navItems}>
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
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
