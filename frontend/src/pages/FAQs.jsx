/**
 * =============================================================================
 * QUERY.IN - PUBLIC FAQs PAGE
 * =============================================================================
 * Public FAQ listing page with accordion-style category groupings.
 * Each category is a collapsible dropdown with smooth animations.
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
      <header className="bg-white border-b border-black sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-text-secondary hover:text-black flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </Link>
            <h1 className="text-xl font-bold text-black">FAQs</h1>
          </div>
          <Link to="/login">
            <Button variant="outline" className="text-sm py-2">Login</Button>
          </Link>
        </div>

        {/* Search bar */}
        <div className="max-w-4xl mx-auto px-4 pb-4">
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setExpandedCategory(null);
              setExpandedFaq(null);
            }}
            className="w-full px-4 py-3 border border-black bg-white text-black placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-black rounded-sm"
          />
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <p className="text-sm text-text-secondary mb-6">
          {loading ? 'Loading...' : `${totalCount} question${totalCount !== 1 ? 's' : ''} across ${Object.keys(filteredByCategory).length} categor${Object.keys(filteredByCategory).length !== 1 ? 'ies' : 'y'}`}
        </p>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : totalCount === 0 ? (
          <Card className="text-center py-16 border rounded-lg">
            <p className="text-text-muted text-lg">No questions found.</p>
            <p className="text-text-muted text-sm mt-2">Try a different search term.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {Object.entries(filteredByCategory).map(([category, categoryFaqs]) => (
              <div key={category} className="border border-black rounded-lg overflow-hidden">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-5 py-4 bg-black text-white flex items-center justify-between hover:bg-gray-800 transition-colors"
                >
                  <span className="font-semibold text-sm uppercase tracking-wide">{category}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs opacity-70">{categoryFaqs.length} question{categoryFaqs.length !== 1 ? 's' : ''}</span>
                    <svg
                      className={`w-5 h-5 transition-transform duration-200 ${expandedCategory === category ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Category Content - Accordion */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    expandedCategory === category ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="divide-y divide-border-subtle">
                    {categoryFaqs.map((faq) => (
                      <div key={faq._id}>
                        {/* FAQ Question */}
                        <button
                          onClick={() => toggleFaq(faq._id)}
                          className="w-full px-5 py-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between gap-4"
                        >
                          <span className="font-medium text-black text-sm pr-4">{faq.clean_question}</span>
                          <svg
                            className={`w-4 h-4 flex-shrink-0 text-text-muted transition-transform duration-200 ${expandedFaq === faq._id ? 'rotate-180' : ''}`}
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
                          <div className="px-5 py-4 bg-gray-50 border-t border-border-subtle">
                            <FormattedAnswer text={faq.answer} />
                            {faq.tags && faq.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-border-subtle">
                                {faq.tags.map(tag => (
                                  <span key={tag} className="text-xs px-2 py-1 bg-white border border-border-subtle text-text-secondary rounded-full">
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQs;