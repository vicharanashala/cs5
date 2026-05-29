/**
 * =============================================================================
 * QUERY.IN - VIEW FAQs PAGE (Intern)
 * =============================================================================
 * Intern-facing FAQ browser with search and category filtering.
 * Similar to public FAQs but with different styling/layout.
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
      return <Badge variant="verified">Verified by Admin</Badge>;
    } else if (faq.priority >= 5) {
      return <Badge variant="filled">Peer Answered</Badge>;
    }
    return <Badge variant="outline">AI Generated</Badge>;
  };

  return (
    <DashboardLayout navItems={navItems}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Knowledge Base</h1>
          <p className="text-text-secondary mt-1">Browse FAQs and find answers to common questions</p>
        </div>

        <Card className="border-2 border-black rounded-lg">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQs..."
            className="w-full px-4 py-3 border-2 border-black bg-white text-black placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-black rounded-lg"
          />
        </Card>

        {loading ? (
          <Card className="border-2 border-black rounded-lg p-8 text-center">
            <p className="text-text-muted">Loading FAQs...</p>
          </Card>
        ) : filteredFaqs.length === 0 ? (
          <Card className="border-2 border-black rounded-lg p-8 text-center">
            <p className="text-text-muted">No FAQs found</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {search ? (
              filteredFaqs.map((faq) => (
                <Card key={faq._id} className="border-2 border-black rounded-lg">
                  <div
                    className="cursor-pointer p-4"
                    onClick={() => setExpandedFaq(expandedFaq === faq._id ? null : faq._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{faq.category}</Badge>
                        <h3 className="font-medium text-black">{faq.clean_question}</h3>
                      </div>
                      <svg
                        className={`w-5 h-5 transition-transform ${expandedFaq === faq._id ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {expandedFaq === faq._id && (
                    <div className="p-4 pt-0 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        {getStatusBadge(faq)}
                      </div>
                      <div className="text-text-secondary text-sm">
                        <ReactMarkdown>{faq.answer}</ReactMarkdown>
                      </div>
                      {faq.tags?.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {faq.tags.map((tag, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
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
              categories.map((category) => {
                const catFaqs = getFaqsByCategory(category);
                if (catFaqs.length === 0) return null;
                return (
                  <Card key={category} className="border-2 border-black rounded-lg">
                    <div
                      className="cursor-pointer p-4 flex items-center justify-between"
                      onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="filled">{catFaqs.length}</Badge>
                        <h3 className="font-semibold text-black">{category}</h3>
                      </div>
                      <svg
                        className={`w-5 h-5 transition-transform ${expandedCategory === category ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {expandedCategory === category && (
                      <div className="p-4 pt-0 space-y-2">
                        {catFaqs.map((faq) => (
                          <div
                            key={faq._id}
                            className="p-3 border border-gray-200 hover:border-black transition-all cursor-pointer rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedFaq(expandedFaq === faq._id ? null : faq._id);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-black">{faq.clean_question}</span>
                              <svg
                                className={`w-4 h-4 transition-transform ${expandedFaq === faq._id ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                            {expandedFaq === faq._id && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="flex items-center gap-2 mb-3">
                                  {getStatusBadge(faq)}
                                </div>
                                <div className="text-sm text-text-secondary">
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