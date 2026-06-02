/**
 * =============================================================================
 * QUERY.IN - VIEW FAQs PAGE
 * =============================================================================
 * Modern SaaS-style knowledge base browser with clean cards and category accordions.
 * Dynamic: Updates automatically when new FAQs are added by admin.
 *
 * @module pages/intern/ViewFAQs
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';

const ViewFAQs = () => {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const [faqs, setFaqs] = useState([]);
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchFaqs = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  useEffect(() => {
    if (!token) return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const socketUrl = apiUrl.replace('/api', '');
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('faq_added', () => {
      fetchFaqs();
    });

    socket.on('new_notification', (notification) => {
      if (notification.type === 'faq_added') {
        fetchFaqs();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [token, fetchFaqs]);

  useEffect(() => {
    if (highlightId && faqs.length > 0) {
      const targetFaq = faqs.find(f => f._id === highlightId);
      if (targetFaq) {
        setExpandedCategory(targetFaq.category);
        setExpandedFaq(highlightId);
        setTimeout(() => {
          const element = document.getElementById(`faq-${highlightId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  }, [highlightId, faqs]);

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
    <DashboardLayout>
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
            {            search ? (
              /* Search Results */
              filteredFaqs.map((faq) => (
                <Card key={faq._id} id={`faq-${faq._id}`} className={`hover:shadow-lg transition-shadow border ${highlightId === faq._id ? 'border-black shadow-md ring-2 ring-black/10' : 'border-gray-100'}`} hover={false}>
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
                  <Card key={category} className="hover:shadow-lg transition-shadow overflow-hidden border border-gray-100" hover={false}>
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
                            id={`faq-${faq._id}`}
                            className={`p-5 border-b border-gray-50 last:border-b-0 hover:bg-gray-100 transition-colors cursor-pointer ${highlightId === faq._id ? 'bg-highlight-light' : ''}`}
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