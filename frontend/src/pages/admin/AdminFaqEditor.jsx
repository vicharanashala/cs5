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

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { path: '/admin/faqs', label: 'FAQ Editor', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
];

const AdminFaqEditor = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFaq, setEditingFaq] = useState(null);
  const [form, setForm] = useState({
    clean_question: '', answer: '', category: '', tags: '', keywords: '', intent: '', priority: 0, escalate_if_uncertain: false
  });
  const [message, setMessage] = useState(null);

  const loadFaqs = async () => {
    try {
      const res = await api.get('/faqs');
      setFaqs(res.data.data || []);
    } catch (err) {
      console.error('Failed to load FAQs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFaqs(); }, []);

  const handleEdit = (faq) => {
    setEditingFaq(faq._id);
    setForm({
      clean_question: faq.clean_question,
      answer: faq.answer,
      category: faq.category,
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
      const payload = {
        ...form,
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
      setForm({ clean_question: '', answer: '', category: '', tags: '', keywords: '', intent: '', priority: 0, escalate_if_uncertain: false });
      loadFaqs();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Operation failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems}>
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
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="e.g., Program Info, Timeline, Rules"
                  required
                />
              </div>
            </div>
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
                <Button type="button" variant="outline" onClick={() => { setEditingFaq(null); setForm({ clean_question: '', answer: '', category: '', tags: '', keywords: '', intent: '', priority: 0, escalate_if_uncertain: false }); }}>
                  Cancel
                </Button>
              )}
            </div>
          </form>

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
                    {faqs.map(faq => (
                      <tr key={faq._id} className="border-t border-border-subtle hover:bg-gray-50">
                        <td className="py-2 px-4 text-xs text-text-muted font-mono">{faq._id.slice(-6)}</td>
                        <td className="py-2 px-4 text-sm text-black">{faq.clean_question.slice(0, 50)}...</td>
                        <td className="py-2 px-4 text-sm">{faq.category}</td>
                        <td className="py-2 px-4 text-right">
                          <button onClick={() => handleEdit(faq)} className="text-blue-600 hover:text-blue-800 text-sm mr-3">Edit</button>
                          <button onClick={() => handleDelete(faq._id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                        </td>
                      </tr>
                    ))}
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
