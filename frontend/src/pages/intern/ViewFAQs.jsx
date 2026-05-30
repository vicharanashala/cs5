/**
 * =============================================================================
 * QUERY.IN - VIEW FAQs PAGE
 * =============================================================================
 * Modern SaaS-style knowledge base browser with clean cards and category accordions.
 *
 * @module pages/intern/ViewFAQs
 */

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
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

const ViewFAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFaqs();
  }, []);

  useEffect(() => {
    if (search.trim()) {
      const filtered = faqs.filter(
        (faq) =>
          faq.clean_question.toLowerCase().includes(search.toLowerCase()) ||
          faq.answer.toLowerCase().includes(search.toLowerCase()) ||
          faq.tags?.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
      );
      setFilteredFaqs(filtered);
    } else {
      setFilteredFaqs(faqs);
    }
  }, [search, faqs]);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/faqs');
      const data = res.data.data || [];
      setFaqs(data);
      setFilteredFaqs(data);

      const cats = [...new Set(data.map((faq) => faq.category))].sort();
      setCategories(cats);
    } catch (err) {
      console.error('Failed to fetch FAQs', err);
    } finally {
      setLoading(false);
    }
  };

  const getFaqsByCategory = (category) => {
    return filteredFaqs.filter((faq) => faq.category === category);
  };

  const getStatusBadge = (faq) => {
    if (faq.priority >= 8) {
      return <Badge variant="highlight" size="sm">Verified by Admin</Badge>;
    } else if (faq.priority >= 5) {
      return <Badge variant="filled" size="sm">Peer Answered</Badge>;
    }
    return <Badge variant="outline" size="sm">AI Generated</Badge>;
  };

  return (
    <DashboardLayout navItems={navItems}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-black">Knowledge Base</h1>
            <p className="text-gray-500 mt-1">Find answers to common questions</p>
          </div>
          <a href="/intern/ask">
            <Button variant="primary" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ask a Question
            </Button>
          </a>
        </div>

        {/* Search Card */}
        <Card className="hover:shadow-lg transition-shadow" hover={false}>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions, answers, and tags..."
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-0 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white rounded-xl transition-all text-base"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </Card>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-gray-500">
            {filteredFaqs.length} {filteredFaqs.length === 1 ? 'article' : 'articles'} found
          </p>
        )}

        {/* Loading State */}
        {loading ? (
          <Card className="py-12 text-center" hover={false}>
            <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading knowledge base...</p>
          </Card>
        ) : filteredFaqs.length === 0 ? (
          <Card className="py-12 text-center" hover={false}>
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No results found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search terms</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {search ? (
              /* Search Results */
              filteredFaqs.map((faq) => (
                <Card key={faq._id} className="hover:shadow-lg transition-shadow" hover={false}>
                  <div
                    className="cursor-pointer p-5"
                    onClick={() => setExpandedFaq(expandedFaq === faq._id ? null : faq._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant="outline" size="sm">{faq.category}</Badge>
                        <h3 className="font-medium text-gray-900">{faq.clean_question}</h3>
                      </div>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${expandedFaq === faq._id ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {expandedFaq === faq._id && (
                    <div className="px-5 pb-5 pt-0 border-t border-gray-100 mt-4">
                      <div className="flex items-center gap-2 mb-4">
                        {getStatusBadge(faq)}
                      </div>
                      <div className="prose prose-sm max-w-none text-gray-600">
                        <ReactMarkdown>{faq.answer}</ReactMarkdown>
                      </div>
                      {faq.tags?.length > 0 && (
                        <div className="flex gap-2 mt-4 flex-wrap">
                          {faq.tags.map((tag, idx) => (
                            <span key={idx} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))
            ) : (
              /* Categories */
              categories.map((category) => {
                const catFaqs = getFaqsByCategory(category);
                if (catFaqs.length === 0) return null;
                const isExpanded = expandedCategory === category;
                return (
                  <Card key={category} className="hover:shadow-lg transition-shadow overflow-hidden" hover={false}>
                    <div
                      className="cursor-pointer p-5 flex items-center justify-between"
                      onClick={() => setExpandedCategory(isExpanded ? null : category)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isExpanded ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{category}</h3>
                          <p className="text-sm text-gray-500">{catFaqs.length} {catFaqs.length === 1 ? 'article' : 'articles'}</p>
                        </div>
                      </div>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {isExpanded && (
                      <div className="border-t border-gray-100">
                        {catFaqs.map((faq) => (
                          <div
                            key={faq._id}
                            className="p-5 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => setExpandedFaq(expandedFaq === faq._id ? null : faq._id)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-gray-900 font-medium">{faq.clean_question}</span>
                              <svg
                                className={`w-4 h-4 text-gray-400 transition-transform ${expandedFaq === faq._id ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                            {expandedFaq === faq._id && (
                              <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2 mb-3">
                                  {getStatusBadge(faq)}
                                </div>
                                <div className="prose prose-sm max-w-none text-gray-600">
                                  <ReactMarkdown>{faq.answer}</ReactMarkdown>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ViewFAQs;