/**
 * =============================================================================
 * QUERY.IN - PUBLIC FAQs PAGE
 * =============================================================================
 * Modern SaaS-style public FAQ listing with clean accordions.
 * Black, white, and yellow highlight theme.
 *
 * @module pages/FAQs
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import FormattedAnswer from '../components/FormattedAnswer';
import publicApi from '../utils/publicApi';

const FAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const res = await publicApi.get('/faqs');
      setFaqs(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch FAQs', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(faqs.map(f => f.category))].sort();

  const filteredByCategory = categories.reduce((acc, cat) => {
    const categoryFaqs = faqs.filter(faq =>
      faq.category === cat &&
      (search === '' ||
        faq.clean_question.toLowerCase().includes(search.toLowerCase()) ||
        faq.search_text?.toLowerCase().includes(search.toLowerCase()))
    );
    if (categoryFaqs.length > 0) {
      acc[cat] = categoryFaqs;
    }
    return acc;
  }, {});

  const toggleCategory = (cat) => {
    setExpandedCategory(expandedCategory === cat ? null : cat);
    setExpandedFaq(null);
  };

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const totalCount = Object.values(filteredByCategory).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-gray-500 hover:text-black flex items-center gap-2 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </Link>
            <div className="w-px h-6 bg-gray-200" />
            <h1 className="text-xl font-bold text-black">Knowledge Base</h1>
          </div>
          <Link to="/login">
            <Button variant="outline" size="sm">Sign In</Button>
          </Link>
        </div>

        {/* Search bar */}
        <div className="max-w-4xl mx-auto px-6 pb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setExpandedCategory(null);
                setExpandedFaq(null);
              }}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-100 border-0 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white rounded-xl transition-all text-base"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-sm text-gray-500 mb-6">
          {loading ? 'Loading...' : `${totalCount} article${totalCount !== 1 ? 's' : ''} across ${Object.keys(filteredByCategory).length} categor${Object.keys(filteredByCategory).length !== 1 ? 'ies' : 'y'}`}
        </p>

        {loading ? (
          <Card className="py-16 text-center" hover={false}>
            <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading knowledge base...</p>
          </Card>
        ) : totalCount === 0 ? (
          <Card className="py-16 text-center" hover={false}>
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
            {Object.entries(filteredByCategory).map(([category, categoryFaqs]) => {
              const isExpanded = expandedCategory === category;
              return (
                <div key={category} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className={`w-full px-5 py-4 flex items-center justify-between transition-colors ${
                      isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        isExpanded ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <span className="font-semibold text-gray-900">{category}</span>
                        <span className="text-sm text-gray-500 ml-2">{categoryFaqs.length} articles</span>
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Category Content - Accordion */}
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="border-t border-gray-100">
                      {categoryFaqs.map((faq) => (
                        <div key={faq._id} className="border-b border-gray-50 last:border-b-0">
                          {/* FAQ Question */}
                          <button
                            onClick={() => toggleFaq(faq._id)}
                            className="w-full px-5 py-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between gap-4"
                          >
                            <span className="font-medium text-gray-900 text-sm pr-4 text-left">{faq.clean_question}</span>
                            <svg
                              className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ${expandedFaq === faq._id ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {/* FAQ Answer - Accordion */}
                          <div
                            className={`transition-all duration-300 ease-in-out overflow-hidden ${
                              expandedFaq === faq._id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                            }`}
                          >
                            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                              <FormattedAnswer text={faq.answer} />
                              {faq.tags && faq.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-200">
                                  {faq.tags.map(tag => (
                                    <span key={tag} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center">
          <p className="text-sm text-gray-500">Can't find what you're looking for?</p>
          <Link to="/login" className="text-sm font-medium text-black hover:underline mt-1 inline-block">
            Sign in to ask a question
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FAQs;