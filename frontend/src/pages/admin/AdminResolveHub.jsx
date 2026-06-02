/**
 * =============================================================================
 * QUERY.IN - ADMIN RESOLVE HUB PAGE
 * =============================================================================
 * Card 8: Resolve Query Hub (remaining sections: Master, Stagnant, Unanswered, Low-Rated, Archive)
 *
 * @module pages/admin/AdminResolveHub
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import api from '../../utils/api';

const AdminResolveHub = () => {
  const [activeSection, setActiveSection] = useState('pending');
  const [queries, setQueries] = useState([]);
  const [moderatorSuggestions, setModeratorSuggestions] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [loading, setLoading] = useState(true);

  const sections = [
    { id: 'pending', label: 'Pending Resolution', count: 0 },
    { id: 'ambiguous', label: 'Ambiguous Queries', count: 0 },
    { id: 'stagnant', label: 'Stagnant (Locked, 24h+)', count: 0 },
    { id: 'low_rated', label: 'Low-Rated', count: 0 },
    { id: 'archive', label: 'Archive', count: 0 },
    { id: 'moderator_suggested', label: 'Moderator Suggested', count: 0 },
  ];

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const res = await api.get('/admin/escalated?type=all');
        setQueries(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch', err);
      } finally {
        setLoading(false);
      }
    };
    const fetchModeratorSuggestions = async () => {
      try {
        const res = await api.get('/admin/moderator-suggestions');
        setModeratorSuggestions(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch moderator suggestions', err);
      }
    };
    fetchQueries();
    fetchModeratorSuggestions();
  }, []);

  const categorized = {
    pending: queries.filter(q => {
      if (q.status === 'Resolved') return false;
      if (q.status === 'Ambiguous') return false;
      const hasHighRating = q.responses?.some(r => r.rating >= 4);
      return hasHighRating;
    }),
    ambiguous: queries.filter(q => q.status === 'Ambiguous'),
    stagnant: queries.filter(q => {
      if (q.status === 'Resolved' || q.status === 'Ambiguous') return false;
      // 0 responses OR 1-4 low-rated responses, both requiring 24+ hours
      if (!q.responses || q.responses.length === 0) {
        // 0 responses AND 24+ hours old → stagnant
        const createdAt = new Date(q.createdAt);
        const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
        return hoursSinceCreation >= 24;
      }
      if (q.responses.length >= 5) return false;
      const allLowRated = q.responses.every(r => r.rating && r.rating < 4);
      if (!allLowRated) return false;
      const createdAt = new Date(q.createdAt);
      const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
      return hoursSinceCreation >= 24;
    }),
    low_rated: queries.filter(q => {
      if (q.status !== 'Peer Answered' || !q.responses?.length) return false;
      if (q.responses.length < 5) return false;
      const allLowRated = q.responses.every(r => r.rating && r.rating < 4);
      return allLowRated;
    }),
    archive: queries.filter(q => q.status === 'Resolved'),
    moderator_suggested: moderatorSuggestions,
  };

  const displayedQueries = categorized[activeSection] || [];

  return (
    <DashboardLayout>
      <Card title="System Query Resolution Hub" subtitle="Central command terminal for reviewing, approving, or overriding escalated queries">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-48 flex-shrink-0">
            <div className="border border-black rounded-lg overflow-hidden">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full px-4 py-3 text-left text-sm font-medium flex justify-between items-center border-b border-border-subtle last:border-b-0 transition-colors ${
                    activeSection === section.id ? 'bg-black text-white' : 'hover:bg-gray-50'
                  }`}
                >
                  <span>{section.label}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${activeSection === section.id ? 'bg-white text-black' : 'bg-gray-200 text-black'}`}>
                    {categorized[section.id]?.length || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-4">
            {loading ? (
              <div className="text-center py-8 text-text-muted">Loading...</div>
            ) : displayedQueries.length === 0 ? (
              <div className="text-center py-8 text-text-muted border border-dashed border-black rounded-lg">
                No queries in this queue
              </div>
            ) : (
              displayedQueries.map(query => (
                <div
                  key={query._id}
                  onClick={() => setSelectedQuery(query)}
                  className="border border-black rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium text-black">
                        {activeSection === 'moderator_suggested' ? query.question_text : query.query_text}
                      </div>
                      <div className="text-sm text-text-muted mt-1">
                        {activeSection === 'moderator_suggested' ? (
                          <>From: {query.suggested_by?.email} ({query.suggested_by?.role || 'moderator'})</>
                        ) : (
                          <>From: {query.intern_id?.email} • Status: {query.status}</>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-text-muted">
                      {activeSection === 'ambiguous' && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800 mr-2">
                          {query.ambiguous_count || 0}/3 strikes
                        </span>
                      )}
                      {activeSection === 'moderator_suggested' ? (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-200 text-black">
                          Suggested by {query.suggested_by?.role || 'moderator'}
                        </span>
                      ) : (
                        `${query.responses?.length || 0} responses`
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedQuery && (
            <QueryDetailPanel
              query={selectedQuery}
              activeSection={activeSection}
              onClose={() => setSelectedQuery(null)}
              onSuggestionDismissed={(closeFn) => {
                setModeratorSuggestions(prev => prev.filter(s => s._id !== selectedQuery._id));
                closeFn();
              }}
              onSuggestionApproved={(closeFn) => {
                setModeratorSuggestions(prev => prev.filter(s => s._id !== selectedQuery._id));
                closeFn();
              }}
            />
          )}
        </div>
      </Card>
    </DashboardLayout>
  );
};

const QueryDetailPanel = ({ query, activeSection, onClose, onSuggestionDismissed, onSuggestionApproved, onCloseAndReload }) => {
  const [overrideText, setOverrideText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWarnModal, setShowWarnModal] = useState(false);
  const [warnMessage, setWarnMessage] = useState('');
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [faqCategories, setFaqCategories] = useState([]);
  const [faqForm, setFaqForm] = useState({
    category: '',
    tags: '',
    keywords: '',
    priority: 5,
  });

  const isHighRatedSection = activeSection === 'pending';
  const isLowRatedSection = activeSection === 'low_rated';
  const isModeratorSuggested = activeSection === 'moderator_suggested';
  const isArchiveSection = activeSection === 'archive';

  const isSuggestionMode = isModeratorSuggested;

  const filteredResponses = isArchiveSection
    ? (query.responses || []).filter(r => r.approval === true)
    : isHighRatedSection
    ? (query.responses || [])
        .filter(r => r.rating >= 4)
        .sort((a, b) => b.rating - a.rating)
    : isLowRatedSection
    ? (query.responses || [])
        .filter(r => r.rating && r.rating < 4)
        .sort((a, b) => b.rating - a.rating)
    : query.responses || [];

  const handleApprove = async (responseId) => {
    setLoading(true);
    try {
      await api.post('/admin/approve', { query_id: query._id, response_id: responseId });
      onClose();
      setTimeout(() => window.location.reload(), 100);
    } catch (err) {
      console.error('Failed to approve', err);
      alert(err.response?.data?.error || 'Failed to approve');
    } finally {
      setLoading(false);
    }
  };

  const handleOverride = async () => {
    if (!overrideText.trim()) return;
    setLoading(true);
    try {
      await api.post('/admin/override', { query_id: query._id, response_text: overrideText });
      onClose();
      setTimeout(() => window.location.reload(), 100);
    } catch (err) {
      console.error('Failed to override', err);
      alert(err.response?.data?.error || 'Failed to override');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToFAQ = async () => {
    try {
      const res = await api.get('/faqs/categories');
      setFaqCategories(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch categories', err);
      setFaqCategories([]);
    }
    setFaqForm({ category: '', tags: '', keywords: '', priority: 5 });
    setShowFaqModal(true);
  };

  const handleFaqSubmit = async () => {
    const finalCategory = faqForm.category === 'Other'
      ? faqForm.customCategory?.trim()
      : faqForm.category.trim();

    if (!finalCategory) {
      alert('Please select or enter a category');
      return;
    }
    setLoading(true);
    try {
      const faqQueryId = isSuggestionMode ? (query.query_id?._id || query.query_id) : query._id;
      await api.post('/admin/create-faq', {
        query_id: faqQueryId,
        category: finalCategory,
        tags: faqForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        keywords: faqForm.keywords.split(',').map(k => k.trim()).filter(Boolean),
        priority: Number(faqForm.priority) || 0,
      });
      setShowFaqModal(false);
      if (isSuggestionMode) {
        onSuggestionApproved(onClose);
      } else {
        alert('FAQ created successfully!');
        onClose();
        setTimeout(() => window.location.reload(), 100);
      }
    } catch (err) {
      console.error('Failed to create FAQ', err);
      alert(err.response?.data?.error || 'Failed to create FAQ');
    } finally {
      setLoading(false);
    }
  };

  const handleWarnUser = async () => {
    setLoading(true);
    try {
      await api.post('/admin/warn-user', {
        intern_id: query.intern_id._id || query.intern_id,
        query_id: query._id,
        warning_message: warnMessage || 'You are misusing our system. If you continue, your account will be disabled after 5 warnings.',
      });
      setShowWarnModal(false);
      setWarnMessage('');
      alert('Warning sent successfully');
    } catch (err) {
      console.error('Failed to send warning', err);
      alert(err.response?.data?.error || 'Failed to send warning');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuery = async () => {
    if (!confirm('Are you sure you want to delete this query? This action cannot be undone.')) return;
    setLoading(true);
    try {
      await api.delete(`/admin/query/${query._id}`);
      onClose();
      window.location.reload();
    } catch (err) {
      console.error('Failed to delete query', err);
      alert(err.response?.data?.error || 'Failed to delete query');
    } finally {
      setLoading(false);
    }
  };

  const statusColors = { peer: 'bg-gray-100', admin: 'bg-black text-white', moderator: 'bg-gray-600 text-white' };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-black">
        <div className="p-6 border-b border-black flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-black">{isSuggestionMode ? 'Moderator FAQ Suggestion' : 'Query Details'}</h3>
            <p className="text-text-muted text-sm">{isSuggestionMode ? `From: ${query.suggested_by?.email || 'Unknown'} (${query.suggested_by?.role || 'moderator'})` : `ID: ${query._id}`}</p>
          </div>
          <button onClick={onClose} className="text-2xl text-black hover:text-gray-600">&times;</button>
        </div>

        <div className="p-6 space-y-6">
          {isSuggestionMode ? (
            <>
              <div className="bg-gray-50 p-4 rounded border border-border-subtle">
                <div className="text-sm font-medium text-black mb-2">Question (from archived query):</div>
                <div className="font-medium text-black">{query.question_text}</div>
                {query.query_id && (
                  <div className="text-sm text-text-muted mt-2">
                    Original Query ID: {query.query_id._id || query.query_id}
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm font-medium text-black mb-3">Suggested Answer (from approved response):</div>
                <div className="border border-black rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-gray-600 text-white">{query.suggested_by?.role || 'moderator'}</span>
                    <span className="text-sm">From: {query.suggested_by?.email}</span>
                  </div>
                  <div className="text-black">{query.suggested_answer}</div>
                </div>
              </div>

              <div className="border-t border-border-subtle pt-4 space-y-4">
                <button
                  onClick={handleAddToFAQ}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  + Add to FAQ Database
                </button>
                <button
                  onClick={async () => {
                    if (!confirm('Dismiss this suggestion?')) return;
                    setLoading(true);
                    try {
                      await api.patch(`/admin/moderator-suggestions/${query._id}/dismiss`);
                      onSuggestionDismissed(onClose);
                    } catch (err) {
                      console.error('Failed to dismiss', err);
                      alert(err.response?.data?.error || 'Failed to dismiss suggestion');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300"
                >
                  Dismiss Suggestion
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-gray-50 p-4 rounded border border-border-subtle">
                <div className="font-medium text-black">{query.query_text}</div>
                <div className="text-sm text-text-muted mt-2">
                  From: {query.intern_id?.email} • Status: {query.status}
                </div>
                {query.intern_id?.warning_count > 0 && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                      ⚠️ {query.intern_id.warning_count} warning{query.intern_id.warning_count > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>

              <div>
              <div className="text-sm font-medium text-black mb-3">
                {isArchiveSection ? 'Approved Response' : isHighRatedSection ? 'High-Rated Responses (4-5★)' : isLowRatedSection ? 'Low-Rated Responses (1-3★)' : 'Peer Responses'}
              </div>
              {filteredResponses.length > 0 ? (
                <div className="space-y-3">
                  {filteredResponses.map(resp => (
                    <div key={resp._id} className="border border-black rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[resp.response_type]}`}>
                          {resp.response_type}
                        </span>
                        <span className="text-sm">{resp.author_id?.email}</span>
                        {resp.rating && <span className="text-yellow-500">★ {resp.rating}/5</span>}
                        {resp.approval && <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Approved</span>}
                      </div>
                      <div className="text-black">{resp.response_text}</div>
                      {resp.peer_note && (
                        <div className="mt-2 text-sm text-gray-600 italic border-l-2 border-gray-300 pl-2">
                          Peer Note: {resp.peer_note}
                        </div>
                      )}
                      {resp.rater_note && (
                        <div className="mt-2 text-sm text-text-muted italic bg-blue-50 p-2 rounded border-l-2 border-blue-400">
                          Author's Review Note: {resp.rater_note}
                        </div>
                      )}
                      {!isArchiveSection && (resp.rating >= 4 || isLowRatedSection) && query.status === 'Peer Answered' && (
                        <button
                          onClick={() => handleApprove(resp._id)}
                          disabled={loading}
                          className="mt-3 text-sm px-3 py-1 border border-black rounded hover:bg-gray-50"
                        >
                          Approve Response
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-text-muted">
                  {isArchiveSection ? 'No approved response found' : isHighRatedSection ? 'No high-rated responses (4-5★)' : isLowRatedSection ? 'No low-rated responses (1-3★)' : 'No peer responses'}
                </div>
              )}
            </div>

            <div className="border-t border-border-subtle pt-4 space-y-4">
              {query.status !== 'Resolved' && (
                <>
                  <label className="block text-sm font-medium text-black">Submit Official Solution</label>
                  <textarea
                    value={overrideText}
                    onChange={(e) => setOverrideText(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black min-h-[100px]"
                    placeholder="Type an authoritative answer..."
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleOverride}
                      disabled={loading || !overrideText.trim()}
                      className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
                    >
                      Submit Official Response & Resolve
                    </button>
                    <button
                      onClick={() => setShowWarnModal(true)}
                      disabled={loading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                    >
                      ⚠️ Send Warning
                    </button>
                    {query.status === 'Ambiguous' && (
                      <button
                        onClick={handleDeleteQuery}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400"
                      >
                        🗑️ Remove Query
                      </button>
                    )}
                  </div>
                </>
              )}

              {query.status === 'Resolved' && !isSuggestionMode && (
                <button
                  onClick={handleAddToFAQ}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  + Add to FAQ Database
                </button>
              )}
            </div>
            </>
          )}
        </div>

        {showWarnModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full border-2 border-black">
              <div className="p-6 border-b border-black">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-black">Send Warning to Intern</h3>
                  <button onClick={() => setShowWarnModal(false)} className="text-black hover:text-gray-600 text-2xl">&times;</button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-text-muted">
                  Sending warning to: <strong>{query.intern_id?.email}</strong>
                </p>
                <p className="text-sm text-text-muted">
                  This will notify the intern that they are misusing the system. If they receive 5 warnings, their account will be automatically disabled.
                </p>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Custom Warning Message (optional)</label>
                  <textarea
                    value={warnMessage}
                    onChange={(e) => setWarnMessage(e.target.value)}
                    placeholder="You are misusing our system. If you continue, your account will be disabled after 5 warnings."
                    className="w-full px-4 py-3 border-2 border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black min-h-[100px]"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleWarnUser}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Sending...' : 'Send Warning'}
                  </button>
                  <button
                    onClick={() => setShowWarnModal(false)}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 disabled:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showFaqModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full border-2 border-black">
              <div className="p-6 border-b border-black">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-black">Add to FAQ Database</h3>
                  <button onClick={() => setShowFaqModal(false)} className="text-black hover:text-gray-600 text-2xl">&times;</button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-text-muted">
                  Creating FAQ from: <strong>{isSuggestionMode ? query.question_text : query.query_text}</strong>
                </p>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Category <span className="text-red-600">*</span></label>
                  <select
                    value={faqForm.category}
                    onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="">Select a category</option>
                    {faqCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="Other">Other (type below)</option>
                  </select>
                </div>

                {faqForm.category === 'Other' && (
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Enter Custom Category</label>
                    <input
                      type="text"
                      value={faqForm.customCategory || ''}
                      onChange={(e) => setFaqForm({ ...faqForm, customCategory: e.target.value })}
                      placeholder="Type custom category..."
                      className="w-full px-4 py-2 border-2 border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={faqForm.tags}
                    onChange={(e) => setFaqForm({ ...faqForm, tags: e.target.value })}
                    placeholder="training, onboarding, vins"
                    className="w-full px-4 py-2 border-2 border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Keywords (comma-separated, high-weight for autocomplete)</label>
                  <input
                    type="text"
                    value={faqForm.keywords}
                    onChange={(e) => setFaqForm({ ...faqForm, keywords: e.target.value })}
                    placeholder="noc, form, submission"
                    className="w-full px-4 py-2 border-2 border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Priority (0-10, higher = more important)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={faqForm.priority}
                    onChange={(e) => setFaqForm({ ...faqForm, priority: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleFaqSubmit}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
                  >
                    {loading ? 'Creating...' : 'Create FAQ'}
                  </button>
                  <button
                    onClick={() => setShowFaqModal(false)}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 disabled:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminResolveHub;