/**
 * =============================================================================
 * QUERY.IN - ADMIN SPOILED USERS PAGE
 * =============================================================================
 * Shows all interns who have received warnings and their credibility status.
 *
 * @module pages/admin/AdminSpoiledUsers
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import api from '../../utils/api';

const AdminSpoiledUsers = () => {
  const [spoiledUsers, setSpoiledUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpoiledUsers();
  }, []);

  const fetchSpoiledUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/spoiled-users');
      setSpoiledUsers(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch spoiled users', err);
    } finally {
      setLoading(false);
    }
  };

  const getWarningLevel = (count) => {
    if (count >= 5) return { label: 'Disabled', variant: 'bg-red-600 text-white' };
    if (count >= 4) return { label: 'Critical', variant: 'bg-red-500 text-white' };
    if (count >= 3) return { label: 'High', variant: 'bg-orange-500 text-white' };
    if (count >= 2) return { label: 'Medium', variant: 'bg-yellow-500 text-black' };
    return { label: 'Low', variant: 'bg-yellow-300 text-black' };
  };

  const getProgressBarColor = (count) => {
    if (count >= 5) return 'bg-red-600';
    if (count >= 4) return 'bg-red-500';
    if (count >= 3) return 'bg-orange-500';
    if (count >= 2) return 'bg-yellow-500';
    return 'bg-yellow-400';
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">Spoiled Users</h1>
        <p className="text-text-secondary mt-1">Interns with warning flags - credibility at risk</p>
      </div>

      <Card title="Warning Overview" subtitle={`${spoiledUsers.length} user(s) with warnings`}>
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-red-700 font-medium">
              {spoiledUsers.filter(u => u.is_disabled).length} account(s) disabled
            </span>
            <span className="text-red-600">|</span>
            <span className="text-red-600">
              {spoiledUsers.filter(u => u.warning_count >= 3 && !u.is_disabled).length} at risk
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-text-muted">Loading...</div>
        ) : spoiledUsers.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-text-muted">No users with warnings</p>
            <p className="text-sm text-text-muted mt-1">All interns are in good standing</p>
          </div>
        ) : (
          <div className="space-y-4">
            {spoiledUsers.map(user => {
              const level = getWarningLevel(user.warning_count);
              const progressPercent = Math.min((user.warning_count / 5) * 100, 100);
              
              return (
                <div key={user._id} className="border border-black rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-black">{user.email}</span>
                        {user.is_disabled && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-600 text-white">
                            DISABLED
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-text-muted mt-1">
                        Created: {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${level.variant}`}>
                      {level.label}
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-text-muted">Warning Level</span>
                      <span className="text-black font-medium">{user.warning_count} / 5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${getProgressBarColor(user.warning_count)}`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {user.warning_count >= 3 && !user.is_disabled && (
                    <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-700">
                      ⚠️ At risk of account disablement
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
};

export default AdminSpoiledUsers;