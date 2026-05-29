/**
 * =============================================================================
 * QUERY.IN - ADMIN USER REGISTRATION PAGE
 * =============================================================================
 * Card 1: User Registration (Single & Bulk JSON Upload)
 *
 * @module pages/admin/AdminUserRegistration
 */

import { useState, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import api from '../../utils/api';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { path: '/admin/registration', label: 'User Registration', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg> },
];

const AdminUserRegistration = () => {
  const [activeTab, setActiveTab] = useState('single');

  return (
    <DashboardLayout navItems={navItems}>
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
    </DashboardLayout>
  );
};

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
      const res = await api.post('/auth/bulk-register', { users: users.map(e => ({ email: e.email, password: 'TempPass123!', role: selectedRole })) });
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

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 border-2 border-black">
            <h3 className="text-lg font-bold text-black mb-2">System Confirmation Request</h3>
            <p className="text-text-secondary mb-4">
              Warning: You are about to batch-register all users contained within this JSON file with the system role of <strong>{selectedRole.toUpperCase()}</strong>.
              <br /><br />
              Please ensure this matches your intended batch layout.
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

export default AdminUserRegistration;
