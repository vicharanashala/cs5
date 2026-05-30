/**
 * =============================================================================
 * QUERY.IN - ADMIN USER MANAGEMENT PAGE
 * =============================================================================
 * Card 3: User Management Directory
 *
 * @module pages/admin/AdminUserManagement
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import api from '../../utils/api';

const AdminUserManagement = () => {
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
    <DashboardLayout>
      <Card title="Registered Users Database" subtitle="High-level searchable table monitoring all active user accounts">
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
      </Card>
    </DashboardLayout>
  );
};

export default AdminUserManagement;
