/**
 * =============================================================================
 * QUERY.IN - ADMIN USER MANAGEMENT PAGE
 * =============================================================================
 * Combined page for:
 * - User Registration (Single & Bulk CSV)
 * - User Management (list with active/inactive toggle)
 * - Spoiled Users (warnings visualization in same table)
 * Dynamic: Updates automatically when users are added/modified.
 *
 * @module pages/admin/AdminUserManagement
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';

const AdminUserManagement = () => {
  const [showRegistration, setShowRegistration] = useState(false);
  const [activeTab, setActiveTab] = useState('single');
  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">User Management</h1>
            <p className="text-text-secondary mt-1">Register new users, manage accounts, and monitor warning levels</p>
          </div>
          <Button
            onClick={() => setShowRegistration(!showRegistration)}
            variant={showRegistration ? 'secondary' : 'primary'}
          >
            {showRegistration ? 'Close Registration' : '+ Register User'}
          </Button>
        </div>
      </div>

      {showRegistration && (
        <Card title="Register New User" subtitle="Single onboarding or bulk CSV batch account registration" className="mb-6">
          <div className="flex border-b border-border-subtle mb-4">
            <TabButton active={activeTab === 'single'} label="Single User" onClick={() => setActiveTab('single')} />
            <TabButton active={activeTab === 'bulk'} label="Bulk CSV Upload" onClick={() => setActiveTab('bulk')} />
          </div>
          {activeTab === 'single' ? (
            <SingleUserForm onSuccess={() => setShowRegistration(false)} />
          ) : (
            <BulkCsvUploadForm onSuccess={() => setShowRegistration(false)} />
          )}
        </Card>
      )}

      <UserListTable />
    </DashboardLayout>
  );
};

const TabButton = ({ active, label, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 font-medium text-sm border-b-2 ${active ? 'border-black text-black' : 'border-transparent text-text-muted hover:text-black'}`}
  >
    {label}
  </button>
);

const SingleUserForm = ({ onSuccess }) => {
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
      if (onSuccess) setTimeout(onSuccess, 1500);
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

const BulkCsvUploadForm = ({ onSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have a header row and at least one data row');
    }
    const header = lines[0].toLowerCase().split(',').map(h => h.trim());
    const requiredCols = ['email', 'password', 'role'];
    for (const col of requiredCols) {
      if (!header.includes(col)) {
        throw new Error(`CSV must contain columns: ${requiredCols.join(', ')}`);
      }
    }
    const emailIdx = header.indexOf('email');
    const passwordIdx = header.indexOf('password');
    const roleIdx = header.indexOf('role');

    const users = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < header.length) continue;
      const email = values[emailIdx];
      const password = values[passwordIdx];
      const role = values[roleIdx];
      if (email && password && role) {
        users.push({ email, password, role });
      }
    }
    if (users.length === 0) {
      throw new Error('No valid users found in CSV');
    }
    return users;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    if (!selectedFile.name.endsWith('.csv')) {
      setMessage({ type: 'error', text: 'Please select a .csv file' });
      return;
    }
    setFile(selectedFile);
    setMessage(null);
    setResults(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a CSV file' });
      return;
    }
    setLoading(true);
    setMessage(null);
    setResults(null);
    try {
      const text = await file.text();
      const users = parseCSV(text);
      const res = await api.post('/auth/bulk-register', { users });
      setResults({
        count: res.data.count,
        created: res.data.created || [],
        errors: res.data.errors || [],
      });
      setMessage({ type: 'success', text: `Bulk registration complete: ${res.data.count} user(s) created` });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onSuccess) setTimeout(onSuccess, 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Bulk registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">CSV File</label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="w-full px-3 py-2 border border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        />
        <p className="text-xs text-text-muted mt-1">
          CSV must have columns: email, password, role (e.g., "email,password,role")
        </p>
      </div>
      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          {message.text}
        </div>
      )}
      {results && (
        <div className="space-y-2">
          {results.created.length > 0 && (
            <div className="text-sm text-green-700">
              <strong>Created ({results.created.length}):</strong> {results.created.map(u => u.email).join(', ')}
            </div>
          )}
          {results.errors.length > 0 && (
            <div className="text-sm text-red-700">
              <strong>Errors ({results.errors.length}):</strong>
              <ul className="list-disc list-inside">
                {results.errors.map((err, i) => <li key={i}>{err.email}: {err.error}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
      <Button type="submit" disabled={loading} className="w-full md:w-auto">
        {loading ? 'Processing...' : 'Upload & Register'}
      </Button>
    </form>
  );
};

const UserListTable = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [search, setSearch] = useState('');
  const { user: currentUser } = useAuth();

  const [menuOpenId, setMenuOpenId] = useState(null);
  const menuRef = useRef(null);

  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({ email: '', role: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (!token) return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const socketUrl = apiUrl.replace('/api', '');
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('new_notification', () => {
      fetchUsers();
    });

    return () => {
      socket.disconnect();
    };
  }, [token, fetchUsers]);

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const res = await api.patch(`/auth/users/${userId}/toggle-status`);
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: res.data.data.isActive } : u));
      setMenuOpenId(null);
    } catch (err) {
      console.error('Failed to toggle status', err);
      alert(err.response?.data?.error || 'Failed to toggle user status');
    }
  };

  const handleRemoveWarnings = async (userId) => {
    if (!confirm('Are you sure you want to remove all warnings for this user?')) return;
    try {
      const res = await api.patch(`/auth/users/${userId}/remove-warnings`);
      setUsers(users.map(u => u._id === userId ? { ...u, warning_count: res.data.data.warning_count, is_disabled: res.data.data.is_disabled } : u));
      setMenuOpenId(null);
    } catch (err) {
      console.error('Failed to remove warnings', err);
      alert(err.response?.data?.error || 'Failed to remove warnings');
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!confirm(`Are you sure you want to permanently delete user "${userEmail}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/auth/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      setMenuOpenId(null);
    } catch (err) {
      console.error('Failed to delete user', err);
      alert(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const openEditModal = (user) => {
    setEditModal(user);
    setEditForm({ email: user.email, role: user.role });
    setEditMessage(null);
    setMenuOpenId(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditMessage(null);
    try {
      const res = await api.patch(`/auth/users/${editModal._id}`, editForm);
      setUsers(users.map(u => u._id === editModal._id ? { ...u, email: res.data.data.email, role: res.data.data.role } : u));
      setEditMessage({ type: 'success', text: 'User updated successfully' });
      setTimeout(() => setEditModal(null), 1500);
    } catch (err) {
      setEditMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update user' });
    } finally {
      setEditLoading(false);
    }
  };

  const filteredUsers = users
    .filter(u => roleFilter === 'all' || u.role === roleFilter)
    .filter(u => {
      if (statusFilter === 'active') return u.isActive !== false;
      if (statusFilter === 'inactive') return u.isActive === false;
      return true;
    })
    .filter(u => !search || u.email.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortOrder === 'newest' ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(a.createdAt) - new Date(b.createdAt));

  const roleColors = { admin: 'bg-black text-white', moderator: 'bg-gray-600 text-white', intern: 'bg-gray-400 text-white' };

  const getWarningBadge = (warning_count) => {
    if (warning_count >= 5) return { bg: 'bg-red-600', text: 'text-white', label: warning_count };
    if (warning_count >= 1) return { bg: 'bg-yellow-400', text: 'text-black', label: warning_count };
    return { bg: 'bg-green-100', text: 'text-green-800', label: '0' };
  };

  return (
    <>
      <Card title="All Users" subtitle={`${filteredUsers.length} user(s)`}>
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-black bg-white text-black rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
                    <th className="text-left py-3 px-4 font-medium text-black">Warnings</th>
                    <th className="text-left py-3 px-4 font-medium text-black">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-black">Joined</th>
                    <th className="text-left py-3 px-4 font-medium text-black">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => {
                    const warningBadge = getWarningBadge(user.warning_count);
                    const isSelf = currentUser?.id === user._id || currentUser?.userId === user._id;

                    return (
                      <tr key={user._id} className="border-b border-border-subtle hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-black">{user.email}</span>
                            {isSelf && <span className="text-xs text-text-muted">(you)</span>}
                            {user.is_disabled && (
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-600 text-white">Disabled</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${roleColors[user.role]}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${warningBadge.bg} ${warningBadge.text}`}>
                            {warningBadge.label} {warningBadge.label === 1 ? 'warning' : 'warnings'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {user.isActive === false ? (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">Inactive</span>
                          ) : (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Active</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-text-muted text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          {user.role !== 'admin' && !isSelf ? (
                            <div className="relative" ref={menuOpenId === user._id ? menuRef : null}>
                              <button
                                onClick={() => setMenuOpenId(menuOpenId === user._id ? null : user._id)}
                                className="p-1 rounded hover:bg-gray-100"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                              </button>
                              {menuOpenId === user._id && (
                                <div className="absolute right-0 mt-1 w-48 bg-white border border-black rounded-lg shadow-lg z-10">
                                  <button
                                    onClick={() => openEditModal(user)}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-t-lg"
                                  >
                                    Edit User
                                  </button>
                                  <button
                                    onClick={() => handleToggleStatus(user._id, user.isActive)}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                  >
                                    {user.isActive === false ? 'Activate User' : 'Deactivate User'}
                                  </button>
                                  {user.warning_count > 0 && (
                                    <button
                                      onClick={() => handleRemoveWarnings(user._id)}
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-yellow-600"
                                    >
                                      Remove Warnings
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteUser(user._id, user.email)}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600 rounded-b-lg"
                                  >
                                    Remove User
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-text-muted text-sm">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-text-muted">No users found</div>
              )}
            </div>
          )}
        </div>
      </Card>

      {editModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white border-2 border-black rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-black mb-4">Edit User</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-black bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="intern">Intern</option>
                  <option value="moderator">Moderator</option>
                </select>
              </div>
              {editMessage && (
                <div className={`px-4 py-3 rounded-lg text-sm ${editMessage.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                  {editMessage.text}
                </div>
              )}
              <div className="flex gap-3">
                <Button type="submit" disabled={editLoading} className="w-full">
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button type="button" onClick={() => setEditModal(null)} variant="secondary" className="w-full">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminUserManagement;