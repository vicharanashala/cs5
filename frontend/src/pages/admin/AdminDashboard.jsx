/**
 * =============================================================================
 * QUERY.IN - ADMIN DASHBOARD (Complete 7-Card Layout)
 * =============================================================================
 * Card 1: User Registration (Single & Bulk JSON Upload)
 * Card 2: Broadcast Announcement
 * Card 3: User Management Directory
 * Card 4: Master Query Monitor & Integrated Review Suite
 * Card 5: FAQ Knowledge Base Editor
 * Card 6: Highly Rated Queries (first priority)
 * Card 7: Ambiguous Queries (3-strike rule)
 * Card 8: Resolve Query (remaining: Master, Stagnant, Unanswered, Low-Rated, Archive)
 * Card 9: AI-Assisted FAQ Suggestions
 *
 * @module pages/admin/AdminDashboard
 */

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import api from '../../utils/api';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { path: '/admin/suggestions', label: 'AI Suggestions', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg> },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Admin Dashboard</h1>
          <p className="text-text-secondary mt-1">Complete system management interface</p>
        </div>

        {/* Card 1: User Registration */}
        <Card title="User Registration" subtitle="Single onboarding or bulk batch account registration">
          <div className="flex border-b border-border-subtle mb-4">
            <button
              onClick={() => setActiveTab('single')}
              className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'single' ? 'border-black text-black' : 'border-transparent text-text-muted hover:text-black'}`}
            >
              Single User
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'bulk' ? 'border-black text-black' : 'border-transparent text-text-muted hover:text-black'}`}
            >
              Bulk JSON Upload
            </button>
          </div>

          {activeTab === 'single' ? <SingleUserForm /> : <BulkUploadForm />}
        </Card>

        {/* Card 2: Broadcast Announcement */}
        <Card title="Publish Global Announcement" subtitle="Form to publish global notices directly into the platform feed">
          <AnnouncementForm />
        </Card>

        {/* Card 3: User Management Directory */}
        <Card title="Registered Users Database" subtitle="High-level searchable table monitoring all active user accounts">
          <UserManagement />
        </Card>

        {/* Card 4: Master Query Monitor */}
        <Card title="Platform Queries Feed" subtitle="Central control grid for tracking and addressing active user tickets">
          <QueryMonitor />
        </Card>

        {/* Card 5: FAQ Knowledge Base Editor */}
        <Card title="FAQ Database Management" subtitle="Create, update, or delete entries in the FAQ collection">
          <FAQEditor />
        </Card>

        {/* Card 6: Highly Rated Queries (First Priority) */}
        <Card title="Highly Rated Queries" subtitle="Queries with 4-5 star ratings requiring urgent admin attention">
          <HighlyRatedQueries />
        </Card>

        {/* Card 7: Ambiguous Queries (3-Strike Rule) */}
        <Card title="Ambiguous Queries" subtitle="Queries marked unclear by 3 different peers">
          <AmbiguousQueries />
        </Card>

        {/* Card 8: Resolve Query */}
        <Card title="System Query Resolution Hub" subtitle="Central command terminal for reviewing, approving, or overriding escalated queries">
          <ResolveQueryHub />
        </Card>

        {/* Card 9: AI FAQ Suggestions */}
        <AISuggestions />
      </div>
    </DashboardLayout>
  );
};

/* ============================================================================
 * Card 1 - Single User Form
 * ============================================================================ */
const SingleUserForm = () => {
  const [form, setForm] = useState({ email: '', password: '', role: 'intern' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.post('/auth/register', form);
      setMessage({ type: 'success', text: `User ${res.data.user.email} registered successfully as ${res.data.user.role}` });
      setForm({ email: '', password: '', role: 'intern' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 border border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-3 py-2 border border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Role</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full px-3 py-2 border border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="intern">Intern</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          {message.text}
        </div>
      )}
      <Button type="submit" disabled={loading} className="w-full md:w-auto">
        {loading ? 'Registering...' : 'Register User'}
      </Button>
    </form>
  );
};

/* ============================================================================
 * Card 1 - Bulk JSON Upload
 * ============================================================================ */
const BulkUploadForm = () => {
  const [file, setFile] = useState(null);
  const [selectedRole, setSelectedRole] = useState('intern');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) setFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === 'application/json') setFile(dropped);
  };

  const handleProcess = () => {
    if (!file) return;
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    setShowConfirm(false);
    try {
      const text = await file.text();
      const users = JSON.parse(text);
      if (!Array.isArray(users)) throw new Error('JSON must be an array of users');
      const emails = users.map(u => u.email);
      const res = await api.post('/auth/bulk-register', { users: emails.map(e => ({ email: e, password: 'TempPass123!', role: selectedRole })) });
      setMessage({ type: 'success', text: `Successfully registered ${res.data.count} users as ${selectedRole}` });
      setFile(null);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Bulk registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Assign Batch Role</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-3 py-2 border border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="intern">Intern</option>
            <option value="moderator">Moderator</option>
          </select>
        </div>
        <div></div>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-black rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />
        <div className="text-text-muted">
          {file ? (
            <div className="text-black font-medium">{file.name}</div>
          ) : (
            <>
              <div className="text-4xl mb-2">📁</div>
              <div>Drag & Drop JSON File or Click to Browse</div>
            </>
          )}
        </div>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <Button onClick={handleProcess} disabled={!file || loading} className="w-full md:w-auto">
        {loading ? 'Processing...' : 'Process File Upload'}
      </Button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 border-2 border-black">
            <h3 className="text-lg font-bold text-black mb-2">System Confirmation Request</h3>
            <p className="text-text-secondary mb-4">
              Warning: You are about to batch-register all users contained within this JSON file with the system role of <strong>{selectedRole.toUpperCase()}</strong>.
              <br /><br />
              Please ensure this matches your intended batch layout. This action will modify platform access keys.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowConfirm(false)} className="flex-1">
                Cancel / Go Back
              </Button>
              <Button onClick={handleConfirm} className="flex-1 bg-red-600 hover:bg-red-700">
                Confirm & Continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * Card 2: Broadcast Announcement
 * ============================================================================ */
const AnnouncementForm = () => {
  const [form, setForm] = useState({ heading: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await api.post('/announcements', form);
      setMessage({ type: 'success', text: 'Announcement published successfully!' });
      setForm({ heading: '', content: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to publish' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Announcement Heading / Title</label>
        <input
          type="text"
          value={form.heading}
          onChange={(e) => setForm({ ...form, heading: e.target.value })}
          className="w-full px-4 py-3 border-2 border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Enter announcement title"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Main Content Block</label>
        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="w-full px-4 py-3 border-2 border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black min-h-[120px]"
          placeholder="Enter announcement content"
          required
        />
      </div>
      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          {message.text}
        </div>
      )}
      <Button type="submit" disabled={loading} className="w-full md:w-auto">
        {loading ? 'Posting...' : 'Post Announcement'}
      </Button>
    </form>
  );
};

/* ============================================================================
 * Card 3: User Management Directory
 * ============================================================================ */
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/auth/users');
        setUsers(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users
    .filter(u => roleFilter === 'all' || u.role === roleFilter)
    .filter(u => !search || u.email.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortOrder === 'newest' ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(a.createdAt) - new Date(b.createdAt));

  const roleColors = { admin: 'bg-black text-white', moderator: 'bg-gray-600 text-white', intern: 'bg-gray-400 text-white' };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border border-black bg-white text-black rounded-lg text-sm"
        >
          <option value="all">All Roles</option>
          <option value="intern">Interns</option>
          <option value="moderator">Moderators</option>
          <option value="admin">Admins</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="px-3 py-2 border border-black bg-white text-black rounded-lg text-sm"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
        <input
          type="text"
          placeholder="Search users by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border border-black bg-white text-black rounded-lg text-sm min-w-[200px]"
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-text-muted">Loading users...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-black">
                <th className="text-left py-3 px-4 font-medium text-black">Email</th>
                <th className="text-left py-3 px-4 font-medium text-black">Role</th>
                <th className="text-left py-3 px-4 font-medium text-black">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id} className="border-b border-border-subtle hover:bg-gray-50">
                  <td className="py-3 px-4 text-black">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-text-muted text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-text-muted">No users found</div>
          )}
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * Card 4: Master Query Monitor
 * ============================================================================ */
const QueryMonitor = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedQuery, setSelectedQuery] = useState(null);

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const res = await api.get('/admin/escalated?type=all');
        setQueries(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch queries', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQueries();
  }, []);

  const filteredQueries = queries
    .filter(q => statusFilter === 'all' || q.status.toLowerCase().replace(' ', '_') === statusFilter.toLowerCase())
    .sort((a, b) => sortOrder === 'desc' ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-black bg-white text-black rounded-lg text-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="peer_answered">Peer Answered</option>
          <option value="ambiguous">Ambiguous</option>
          <option value="resolved">Resolved</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="px-3 py-2 border border-black bg-white text-black rounded-lg text-sm"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-text-muted">Loading queries...</div>
      ) : (
        <div className="space-y-3">
          {filteredQueries.map(query => (
            <div
              key={query._id}
              onClick={() => setSelectedQuery(query)}
              className="border border-black rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-black">{query.query_text}</div>
                  <div className="text-sm text-text-muted mt-1">
                    From: {query.intern_id?.email || 'Unknown'} • {new Date(query.createdAt).toLocaleString()}
                  </div>
                </div>
                <Badge variant={query.status === 'Resolved' ? 'verified' : query.status === 'Ambiguous' ? 'filled' : 'outline'}>
                  {query.status}
                </Badge>
              </div>
            </div>
          ))}
          {filteredQueries.length === 0 && (
            <div className="text-center py-8 text-text-muted">No queries found</div>
          )}
        </div>
      )}

      {/* Thread View Drawer */}
      {selectedQuery && (
        <QueryDrawer query={selectedQuery} onClose={() => setSelectedQuery(null)} />
      )}
    </div>
  );
};

/* ============================================================================
 * Card 4: Query Drawer (Thread View)
 * ============================================================================ */
const QueryDrawer = ({ query, onClose }) => {
  const [overrideText, setOverrideText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async (responseId) => {
    setLoading(true);
    try {
      await api.post('/admin/approve', { query_id: query._id, response_id: responseId });
      onClose();
    } catch (err) {
      console.error('Failed to approve', err);
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
    } catch (err) {
      console.error('Failed to override', err);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = { peer: 'bg-gray-100 text-black', admin: 'bg-black text-white', moderator: 'bg-gray-600 text-white' };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-black">
        <div className="p-6 border-b border-black">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-black">Query Details</h3>
              <p className="text-text-muted text-sm mt-1">ID: {query._id}</p>
            </div>
            <button onClick={onClose} className="text-black hover:text-gray-600 text-2xl">&times;</button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 p-4 rounded border border-border-subtle">
            <div className="text-sm text-text-muted mb-1">The Core Question</div>
            <div className="font-medium text-black">{query.query_text}</div>
            <div className="text-sm text-text-muted mt-2">
              From: {query.intern_id?.email} • {new Date(query.createdAt).toLocaleString()}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-black mb-3">Peer Response Carousel</div>
            {query.responses?.length > 0 ? (
              <div className="space-y-3">
                {query.responses.map(resp => (
                  <div key={resp._id} className="border border-black rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[resp.response_type]}`}>
                        {resp.response_type}
                      </span>
                      <span className="text-sm text-text-muted">
                        {resp.author_id?.email || 'Unknown'}
                      </span>
                      {resp.rating && (
                        <span className="text-yellow-600">★ {resp.rating}</span>
                      )}
                    </div>
                    <div className="text-black">{resp.response_text}</div>
                    {resp.peer_note && (
                      <div className="mt-2 text-sm text-text-muted italic bg-yellow-50 p-2 rounded">
                        Note: {resp.peer_note}
                      </div>
                    )}
                    {query.status === 'Peer Answered' && !query.is_locked && (
                      <Button
                        onClick={() => handleApprove(resp._id)}
                        disabled={loading}
                        className="mt-3 text-sm"
                      >
                        Approve Response
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-text-muted text-center py-4">No peer responses yet</div>
            )}
          </div>

          <div className="border-t border-border-subtle pt-4">
            <label className="block text-sm font-medium text-black mb-2">
              Admin Intervention / Override Box
            </label>
            <textarea
              value={overrideText}
              onChange={(e) => setOverrideText(e.target.value)}
              className="w-full px-4 py-3 border-2 border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black min-h-[100px]"
              placeholder="Type an official admin/moderator response if existing answers are incorrect or lacking context."
            />
            <Button
              onClick={handleOverride}
              disabled={loading || !overrideText.trim()}
              className="mt-3 w-full"
            >
              Submit Official Response & Resolve
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * Card 5: FAQ Knowledge Base Editor
 * ============================================================================ */
const FAQEditor = () => {
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
    <div className="space-y-4">
      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-black rounded-lg bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Standardized Question (clean_question)</label>
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
            <label className="block text-sm font-medium text-text-primary mb-1">Metadata Tags (comma-separated)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full px-3 py-2 border border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="tag1, tag2, tag3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Search Keywords (comma-separated)</label>
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
  );
};

/* ============================================================================
 * Card 6: Highly Rated Queries (Standalone Card)
 * ============================================================================ */
const HighlyRatedQueries = () => {
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const res = await api.get('/admin/escalated?type=high');
        setQueries(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch highly rated queries', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQueries();
  }, []);

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-8 text-text-muted">Loading...</div>
      ) : queries.length === 0 ? (
        <div className="text-center py-8 text-text-muted border border-dashed border-black rounded-lg">
          No highly rated queries at this time
        </div>
      ) : (
        queries.map(query => (
          <div
            key={query._id}
            onClick={() => setSelectedQuery(query)}
            className="border border-black rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-medium text-black">{query.query_text}</div>
                <div className="text-sm text-text-muted mt-1">
                  From: {query.intern_id?.email || 'Unknown'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-yellow-600 font-bold">
                  {query.responses?.find(r => r.rating >= 4)?.rating || '★'}/5
                </div>
                <div className="text-xs text-text-muted">
                  {query.responses?.length || 0} responses
                </div>
              </div>
            </div>
          </div>
        ))
      )}
      {selectedQuery && (
        <QueryDetailPanel query={selectedQuery} onClose={() => setSelectedQuery(null)} />
      )}
    </div>
  );
};

/* ============================================================================
 * Card 7: Ambiguous Queries (Standalone Card)
 * ============================================================================ */
const AmbiguousQueries = () => {
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const res = await api.get('/admin/escalated?type=ambiguous');
        setQueries(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch ambiguous queries', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQueries();
  }, []);

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-8 text-text-muted">Loading...</div>
      ) : queries.length === 0 ? (
        <div className="text-center py-8 text-text-muted border border-dashed border-black rounded-lg">
          No ambiguous queries at this time
        </div>
      ) : (
        queries.map(query => (
          <div
            key={query._id}
            onClick={() => setSelectedQuery(query)}
            className="border border-black rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-medium text-black">{query.query_text}</div>
                <div className="text-sm text-text-muted mt-1">
                  From: {query.intern_id?.email || 'Unknown'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-orange-600 font-bold">
                  {query.ambiguous_count || 0}/3 strikes
                </div>
              </div>
            </div>
          </div>
        ))
      )}
      {selectedQuery && (
        <QueryDetailPanel query={selectedQuery} onClose={() => setSelectedQuery(null)} />
      )}
    </div>
  );
};

/* ============================================================================
 * Card 8: Resolve Query Hub (remaining sections)
 * ============================================================================ */
const ResolveQueryHub = () => {
  const [activeSection, setActiveSection] = useState('master');
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [loading, setLoading] = useState(true);

  const sections = [
    { id: 'master', label: 'Master Queue', count: 0 },
    { id: 'stagnant', label: 'Stagnant (0 answers)', count: 0 },
    { id: 'unanswered', label: 'Unanswered', count: 0 },
    { id: 'low_rated', label: 'Low-Rated', count: 0 },
    { id: 'high_rated', label: 'Highly-Rated', count: 0 },
    { id: 'archive', label: 'Archive', count: 0 },
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
    fetchQueries();
  }, []);

  const categorized = {
    master: queries.filter(q => q.status !== 'Resolved'),
    stagnant: queries.filter(q => q.status !== 'Resolved' && q.is_locked && (!q.responses || q.responses.length === 0)),
    unanswered: queries.filter(q => q.status !== 'Resolved' && (!q.responses || q.responses.length === 0)),
    low_rated: queries.filter(q => {
      if (q.status !== 'Peer Answered' || !q.responses?.length) return false;
      const hasLowRatings = q.responses.some(r => r.rating && r.rating < 4);
      return hasLowRatings && q.responses.length >= 5;
    }),
    high_rated: queries.filter(q => {
      if (q.status !== 'Peer Answered' || !q.responses?.length) return false;
      return q.responses.some(r => r.rating && r.rating >= 4);
    }),
    archive: queries.filter(q => q.status === 'Resolved'),
  };

  const displayedQueries = categorized[activeSection] || [];

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Left Navigation */}
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

      {/* Main Content */}
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
                  <div className="font-medium text-black">{query.query_text}</div>
                  <div className="text-sm text-text-muted mt-1">
                    From: {query.intern_id?.email} • Status: {query.status}
                  </div>
                </div>
                <div className="text-right text-sm text-text-muted">
                  {query.responses?.length || 0} responses
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Query Detail Panel */}
      {selectedQuery && (
        <QueryDetailPanel query={selectedQuery} onClose={() => setSelectedQuery(null)} />
      )}
    </div>
  );
};

/* ============================================================================
 * Card 6: Query Detail Panel
 * ============================================================================ */
const QueryDetailPanel = ({ query, onClose }) => {
  const [overrideText, setOverrideText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async (responseId) => {
    setLoading(true);
    try {
      await api.post('/admin/approve', { query_id: query._id, response_id: responseId });
      onClose();
    } catch (err) {
      console.error('Failed to approve', err);
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
    } catch (err) {
      console.error('Failed to override', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToFAQ = async () => {
    if (!confirm('Create an FAQ from this resolved query?')) return;
    setLoading(true);
    try {
      await api.post('/admin/create-faq', {
        query_id: query._id,
        category: 'General',
        tags: [],
        priority: 0,
      });
      alert('FAQ created successfully!');
    } catch (err) {
      console.error('Failed to create FAQ', err);
      alert('Failed to create FAQ');
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
            <h3 className="text-lg font-bold text-black">Query Details</h3>
            <p className="text-text-muted text-sm">ID: {query._id}</p>
          </div>
          <button onClick={onClose} className="text-2xl text-black hover:text-gray-600">&times;</button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-text-muted">Intern ID:</span>
              <span className="ml-2 text-black">{query.intern_id?.email}</span>
            </div>
            <div>
              <span className="text-text-muted">Status:</span>
              <span className="ml-2 text-black">{query.status}</span>
            </div>
            <div>
              <span className="text-text-muted">Raised:</span>
              <span className="ml-2 text-black">{new Date(query.createdAt).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-text-muted">Resolution:</span>
              <span className="ml-2 text-black">{query.resolution_type || 'Pending'}</span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded border border-border-subtle">
            <div className="font-medium text-black">{query.query_text}</div>
          </div>

          <div>
            <div className="text-sm font-medium text-black mb-3">Peer Context Stream</div>
            {query.responses?.length > 0 ? (
              <div className="space-y-3">
                {query.responses.map(resp => (
                  <div key={resp._id} className="border border-black rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[resp.response_type]}`}>
                        {resp.response_type}
                      </span>
                      <span className="text-sm">{resp.author_id?.email}</span>
                      {resp.rating && <span className="text-yellow-600">★ {resp.rating}/5</span>}
                    </div>
                    <div className="text-black">{resp.response_text}</div>
                    {resp.peer_note && (
                      <div className="mt-2 text-sm italic text-text-muted bg-yellow-50 p-2 rounded">
                        Internal Note: {resp.peer_note}
                      </div>
                    )}
                    {resp.rating >= 4 && query.status === 'Peer Answered' && (
                      <Button onClick={() => handleApprove(resp._id)} disabled={loading} className="mt-3 text-sm">
                        Approve Response
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-text-muted">No peer responses</div>
            )}
          </div>

          {query.status !== 'Resolved' && (
            <div className="border-t border-border-subtle pt-4">
              <label className="block text-sm font-medium text-black mb-2">Submit Official Solution & Resolve</label>
              <textarea
                value={overrideText}
                onChange={(e) => setOverrideText(e.target.value)}
                className="w-full px-4 py-3 border-2 border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black min-h-[100px]"
                placeholder="Type an authoritative answer..."
              />
              <Button onClick={handleOverride} disabled={loading || !overrideText.trim()} className="mt-3 w-full">
                Submit Official Response & Resolve
              </Button>
            </div>
          )}

          {query.status === 'Resolved' && (
            <div className="border-t border-border-subtle pt-4">
              <Button onClick={handleAddToFAQ} disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                + Add to FAQ Database
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * Card 9: AI-Assisted FAQ Suggestions
 * ============================================================================ */
const AISuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suggestRes, statsRes] = await Promise.all([
          api.get('/analytics/faq-suggestions'),
          api.get('/analytics/stats'),
        ]);
        setSuggestions(suggestRes.data.data || []);
        setStats(statsRes.data.data);
        setHasUnread(suggestRes.data.data?.length > 0);
      } catch (err) {
        console.error('Failed to fetch suggestions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDismiss = async (id) => {
    try {
      await api.delete(`/analytics/suggestions/${id}`);
      setSuggestions(prev => prev.filter(s => s._id !== id));
      setHasUnread(suggestions.length > 1);
    } catch (err) {
      console.error('Failed to dismiss', err);
    }
  };

  const cardClass = hasUnread
    ? 'bg-yellow-50 border-yellow-400 border-2'
    : 'border border-black';

  return (
    <Card
      className={cardClass}
      title={
        <div className="flex items-center justify-between">
          <span>Smart FAQ Intake & Suggestion Engine</span>
          {hasUnread && <span className="bg-yellow-400 text-black text-xs px-2 py-1 rounded">UNREAD</span>}
        </div>
      }
      subtitle="Automatically identifies documentation gaps by aggregating unanswerable student questions"
    >
      <div className="space-y-4">
        {stats && (
          <div className="flex gap-4 text-sm">
            <div className="px-3 py-2 bg-white border border-black rounded">
              <span className="text-text-muted">Suggestions Ready:</span>
              <span className="ml-2 font-bold text-black">{stats.suggestions_ready || 0}</span>
            </div>
            <div className="px-3 py-2 bg-white border border-black rounded">
              <span className="text-text-muted">Total Gaps:</span>
              <span className="ml-2 font-bold text-black">{stats.total_content_gaps || 0}</span>
            </div>
            <div className="px-3 py-2 bg-white border border-black rounded">
              <span className="text-text-muted">Avg Occurrences:</span>
              <span className="ml-2 font-bold text-black">{stats.average_occurrences?.toFixed(1) || 0}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-text-muted">Loading suggestions...</div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-8 text-text-muted border border-dashed border-black rounded-lg">
            No FAQ suggestions at this time
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map(suggestion => (
              <div key={suggestion._id} className="border border-black rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-black">{suggestion.queryText}</div>
                    <div className="flex gap-4 mt-2 text-sm text-text-muted">
                      <span>Hits: <strong className="text-black">{suggestion.occurrenceCount}</strong></span>
                      <span>Distinct Students: <strong className="text-black">{suggestion.impactedInterns?.length || 0}</strong></span>
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-text-muted">
                      <span>First: {new Date(suggestion.firstLoggedDate).toLocaleDateString()}</span>
                      <span>Last: {new Date(suggestion.lastUpdatedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleDismiss(suggestion._id)}
                      className="px-3 py-1 text-sm border border-black rounded hover:bg-gray-100 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default AdminDashboard;