import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { api } from '../utils/api';
import type { User } from '../types';

interface AdminStats {
  totalUsers: number;
  userCount: number;
  moderatorCount: number;
  adminCount: number;
}

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.getAdminUsers();
      setUsers(data.users);
    } catch (_err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await api.getAdminStats();
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'user' | 'moderator' | 'admin') => {
    setUpdatingUser(userId);
    try {
      await api.updateUserRole(userId, newRole);
      // Update the user in the local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      // Refresh stats
      fetchStats();
    } catch (_err) {
      setError('Failed to update user role');
    } finally {
      setUpdatingUser(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 dark:bg-red-600 text-red-700 dark:text-white';
      case 'moderator': return 'bg-blue-100 dark:bg-blue-600 text-blue-700 dark:text-white';
      case 'user': return 'bg-neutral-100 dark:bg-gray-600 text-neutral-700 dark:text-white';
      default: return 'bg-neutral-100 dark:bg-gray-600 text-neutral-700 dark:text-white';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-neutral-900 dark:text-white transition-colors duration-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-neutral-500 dark:text-gray-400">You need admin privileges to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-neutral-900 dark:text-white transition-colors duration-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4">Loading admin panel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Admin Panel</h1>
          <p className="text-neutral-600 dark:text-gray-400">Manage users and platform settings</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-600 border border-red-200 dark:border-red-700 text-red-700 dark:text-white p-4 rounded-lg mb-6">
            {error}
            <button 
              onClick={() => setError(null)}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Stats Section */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-500">{stats.totalUsers}</p>
            </div>
            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Regular Users</h3>
              <p className="text-3xl font-bold text-neutral-600 dark:text-gray-400">{stats.userCount}</p>
            </div>
            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Moderators</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.moderatorCount}</p>
            </div>
            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Admins</h3>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.adminCount}</p>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">User Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-100 dark:bg-neutral-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-gray-300 uppercase tracking-wider">
                    Reputation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-gray-300 uppercase tracking-wider">
                    Integrity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-gray-300 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-neutral-900 dark:text-white">{user.username}</div>
                        <div className="text-sm text-neutral-500 dark:text-gray-400">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role || '')}`}>
                        {user.role || ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700 dark:text-gray-300">
                      {user.reputationPoints}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700 dark:text-gray-300">
                      {(user.integrityScore || 0).toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700 dark:text-gray-300">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <select
                        value={user.role || ''}
                        onChange={(e) => updateUserRole(user.id, e.target.value as 'user' | 'moderator' | 'admin')}
                        disabled={updatingUser === user.id}
                        className="bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                      {updatingUser === user.id && (
                        <div className="inline-block ml-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
};

export default Admin; 