/**
 * =============================================================================
 * QUERY.IN - PUBLIC FAQs PAGE
 * =============================================================================
 * A public page that displays all FAQs grouped by category.
 * Each category is a collapsible accordion section.
 * Accessible without authentication (public route).
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
  const [openCategories, setOpenCategories] = useState({});

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

  const filteredFaqs = faqs.filter(faq =>
    search === '' ||
    faq.clean_question.toLowerCase().includes(search.toLowerCase()) ||
    faq.search_text?.toLowerCase().includes(search.toLowerCase())
  );

  const groupedFaqs = categories.reduce((acc, category) => {
    const categoryFaqs = filteredFaqs.filter(f => f.category === category);
    if (categoryFaqs.length > 0) {
      acc[category] = categoryFaqs;
    }
    return acc;
  }, {});

  const toggleCategory = (category) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const totalFaqs = filteredFaqs.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-black sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
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
            <Button variant="outline" className="text-sm">Login</Button>
          </Link>
        </div>
      </header>

      {/* Search */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-5 py-4 border-2 border-black bg-white text-black placeholder-text-muted rounded-full focus:outline-none focus:ring-2 focus:ring-black text-sm"
          />
          <svg className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-sm text-text-secondary mt-3 px-2">
          {totalFaqs} FAQ{totalFaqs !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Categories & FAQs */}
      <div className="max-w-3xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : Object.keys(groupedFaqs).length === 0 ? (
          <Card className="border border-border-subtle text-center py-12 rounded-2xl">
            <p className="text-text-muted">No FAQs found matching your search.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
              <div key={category} className="rounded-2xl overflow-hidden border-2 border-black">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-6 py-4 bg-black text-white flex items-center justify-between hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="filled" className="bg-white text-black">
                      {categoryFaqs.length}
                    </Badge>
                    <span className="font-semibold text-sm uppercase tracking-wider">{category}</span>
                  </div>
                  <svg
                    className={`w-5 h-5 transition-transform duration-200 ${openCategories[category] ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* FAQ Items */}
                {openCategories[category] && (
                  <div className="bg-white divide-y divide-border-subtle">
                    {categoryFaqs.map((faq, idx) => (
                      <div key={faq._id} className={`px-6 py-5 ${idx === 0 ? 'pt-5' : ''} ${idx === categoryFaqs.length - 1 ? 'pb-5' : ''}`}>
                        <div className="flex items-start gap-3 mb-2">
                          <span className="flex-shrink-0 w-6 h-6 bg-gray-100 text-text-muted text-xs font-medium rounded-full flex items-center justify-center mt-1">
                            {idx + 1}
                          </span>
                          <h3 className="text-base font-semibold text-black leading-snug">{faq.clean_question}</h3>
                        </div>
                        <div className="ml-9">
                          <FormattedAnswer text={faq.answer} />
                          {faq.tags && faq.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                              {faq.tags.slice(0, 5).map(tag => (
                                <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-text-secondary rounded-full">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQs;