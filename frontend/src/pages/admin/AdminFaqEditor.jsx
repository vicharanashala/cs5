/**
 * =============================================================================
 * QUERY.IN - ADMIN FAQ EDITOR PAGE
 * =============================================================================
 * Card 5: FAQ Knowledge Base Editor
 *
 * @module pages/admin/AdminFaqEditor
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import api from '../../utils/api';

const AdminFaqEditor = () => {
  const [faqs, setFaqs] = useState([]);
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingFaq, setEditingFaq] = useState(null);
  const [form, setForm] = useState({
    clean_question: '', answer: '', category: '', customCategory: '', tags: '', keywords: '', intent: '', priority: 0, escalate_if_uncertain: false
  });
  const [message, setMessage] = useState(null);

  const loadFaqs = async () => {
    try {
      const res = await api.get('/faqs');
      const data = res.data.data || [];
      setFaqs(data);
      setFilteredFaqs(data);

      const cats = [...new Set(data.map((faq) => faq.category))].sort();
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load FAQs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFaqs(); }, []);

  useEffect(() => {
    if (search.trim()) {
      const filtered = faqs.filter(
        (faq) =>
          faq.clean_question.toLowerCase().includes(search.toLowerCase()) ||
          faq.answer.toLowerCase().includes(search.toLowerCase()) ||
          faq.tags?.some((tag) => tag.toLowerCase().includes(search.toLowerCase())) ||
          faq.category.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredFaqs(filtered);
    } else {
      setFilteredFaqs(faqs);
    }
  }, [search, faqs]);

  const handleEdit = (faq) => {
    setEditingFaq(faq._id);
    setForm({
      clean_question: faq.clean_question,
      answer: faq.answer,
      category: faq.category,
      customCategory: '',
      tags: faq.tags?.join(', ') || '',
      keywords: faq.keywords?.join(', ') || '',
      intent: faq.intent || '',
      priority: faq.priority || 0,
      escalate_if_uncertain: faq.escalate_if_uncertain || false,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this FAQ?')) return;
    try {
      await api.delete(`/faqs/${id}`);
      loadFaqs();
    } catch (err) {
      console.error('Failed to delete FAQ', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const finalCategory = form.category === 'Other'
        ? form.customCategory?.trim()
        : form.category;

      if (!finalCategory) {
        setMessage({ type: 'error', text: 'Please select or enter a category' });
        setLoading(false);
        return;
      }

      const payload = {
        ...form,
        category: finalCategory,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
        search_text: `${form.clean_question} ${form.answer}`,
      };
      if (editingFaq) {
        await api.put(`/faqs/${editingFaq}`, payload);
        setMessage({ type: 'success', text: 'FAQ updated successfully' });
      } else {
        await api.post('/faqs', payload);
        setMessage({ type: 'success', text: 'FAQ created successfully' });
      }
      setEditingFaq(null);
      setForm({ clean_question: '', answer: '', category: '', customCategory: '', tags: '', keywords: '', intent: '', priority: 0, escalate_if_uncertain: false });
      loadFaqs();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Operation failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Card title="FAQ Database Management" subtitle="Create, update, or delete entries in the FAQ collection">
        <div className="space-y-4">
          {message && (
            <div className={`px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-black rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Standardized Question</label>
                <input
                  type="text"
                  value={form.clean_question}
                  onChange={(e) => setForm({ ...form, clean_question: e.target.value })}
                  className="w-full px-3 py-2 border border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value, customCategory: '' })}
                  className="w-full px-3 py-2 border border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="Other">Other (type below)</option>
                </select>
              </div>
            </div>
            {form.category === 'Other' && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Enter Custom Category</label>
                <input
                  type="text"
                  value={form.customCategory}
                  onChange={(e) => setForm({ ...form, customCategory: e.target.value })}
                  className="w-full px-3 py-2 border border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Type custom category..."
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Answer Text</label>
              <textarea
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                className="w-full px-3 py-2 border border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black min-h-[80px]"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="tag1, tag2, tag3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Keywords (comma-separated)</label>
                <input
                  type="text"
                  value={form.keywords}
                  onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  className="w-full px-3 py-2 border border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="keyword1, keyword2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">System Intent</label>
                <input
                  type="text"
                  value={form.intent}
                  onChange={(e) => setForm({ ...form, intent: e.target.value })}
                  className="w-full px-3 py-2 border border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Priority Level: {form.priority}</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="escalate"
                  checked={form.escalate_if_uncertain}
                  onChange={(e) => setForm({ ...form, escalate_if_uncertain: e.target.checked })}
                  className="w-4 h-4 mr-2"
                />
                <label htmlFor="escalate" className="text-sm font-medium text-text-primary">Automated Escalation Flag</label>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : editingFaq ? 'Update FAQ' : 'Create FAQ'}
              </Button>
              {editingFaq && (
                <Button type="button" variant="outline" onClick={() => { setEditingFaq(null); setForm({ clean_question: '', answer: '', category: '', customCategory: '', tags: '', keywords: '', intent: '', priority: 0, escalate_if_uncertain: false }); }}>
                  Cancel
                </Button>
              )}
            </div>
          </form>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions, answers, tags..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-black text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black rounded-lg"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <p className="text-sm text-text-muted">
            Showing {filteredFaqs.length} of {faqs.length} entries
          </p>

          <div className="border border-black rounded-lg overflow-hidden">
            <div className="bg-black text-white px-4 py-2 font-medium">Active FAQ Index</div>
            <div className="max-h-[300px] overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-text-muted">Loading...</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr className="text-left text-sm">
                      <th className="py-2 px-4 font-medium">ID</th>
                      <th className="py-2 px-4 font-medium">Question</th>
                      <th className="py-2 px-4 font-medium">Category</th>
                      <th className="py-2 px-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFaqs.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-4 px-4 text-center text-text-muted">No FAQs found</td>
                      </tr>
                    ) : (
                      filteredFaqs.map(faq => (
                        <tr key={faq._id} className="border-t border-border-subtle hover:bg-gray-50">
                          <td className="py-2 px-4 text-xs text-text-muted font-mono">{faq._id.slice(-6)}</td>
                          <td className="py-2 px-4 text-sm text-black">{faq.clean_question.slice(0, 50)}...</td>
                          <td className="py-2 px-4 text-sm">{faq.category}</td>
                          <td className="py-2 px-4 text-right">
                            <button onClick={() => handleEdit(faq)} className="text-blue-600 hover:text-blue-800 text-sm mr-3">Edit</button>
                            <button onClick={() => handleDelete(faq._id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
};

export default AdminFaqEditor;
