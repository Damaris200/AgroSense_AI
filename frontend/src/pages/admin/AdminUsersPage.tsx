import { AlertCircle, Loader2, Search, UserCheck, UserX } from 'lucide-react';
import { useEffect, useState } from 'react';

import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { useTheme } from '../../context/ThemeContext';
import { extractApiError } from '../../services/auth.service';
import { getAdminUsers, setAdminUserActive, type AdminUser } from '../../services/admin.service';

const roleBadge = {
  farmer:     { text: 'Farmer',     cls: 'bg-blue-100 text-blue-700',    darkCls: 'bg-blue-900/40 text-blue-300' },
  agronomist: { text: 'Agronomist', cls: 'bg-purple-100 text-purple-700',darkCls: 'bg-purple-900/40 text-purple-300' },
  admin:      { text: 'Admin',      cls: 'bg-red-100 text-red-700',      darkCls: 'bg-red-900/40 text-red-300' },
};

export function AdminUsersPage() {
  const { isDark } = useTheme();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()),
  );

  async function loadUsers() {
    setLoading(true);
    setError('');
    try {
      setUsers(await getAdminUsers());
    } catch (err) {
      setError(extractApiError(err, 'Could not load users.'));
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(id: string, current: boolean) {
    setError('');
    try {
      const updated = await setAdminUserActive(id, !current);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (err) {
      setError(extractApiError(err, 'Could not update user.'));
    }
  }

  useEffect(() => { void loadUsers(); }, []);

  return (
    <DashboardLayout>
      <PageHeader title="User Management" subtitle="View and manage all registered users." />

      <div className="mb-4">
        <div className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
          <Search className={`h-4 w-4 flex-shrink-0 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            className={`flex-1 bg-transparent text-sm outline-none ${isDark ? 'text-white placeholder-zinc-500' : 'text-zinc-900 placeholder-zinc-400'}`}
          />
        </div>
      </div>

      {error && (
        <div className={`mb-4 flex items-start gap-3 rounded-2xl border p-4 ${isDark ? 'border-rose-900/40 bg-rose-900/20 text-rose-300' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Unable to load users</p>
            <p className="mt-0.5 text-sm opacity-80">{error}</p>
          </div>
        </div>
      )}

      <div className={`overflow-hidden rounded-2xl border ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className={isDark ? 'bg-zinc-800/60' : 'bg-zinc-50'}>
                {['Name', 'Email', 'Role', 'Locale', 'Joined', 'Status', ''].map((h) => (
                  <th key={h} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-zinc-800' : 'divide-zinc-100'}`}>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-emerald-500" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className={`py-10 text-center text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>No users found.</td>
                </tr>
              ) : (
                filtered.map((user) => {
                  const rb = roleBadge[user.role];
                  return (
                    <tr key={user.id} className={`transition ${isDark ? 'hover:bg-zinc-800/40' : 'hover:bg-zinc-50'}`}>
                      <td className={`px-4 py-3 font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>{user.name}</td>
                      <td className={`px-4 py-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${isDark ? rb.darkCls : rb.cls}`}>{rb.text}</span>
                      </td>
                      <td className={`px-4 py-3 uppercase text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{user.locale}</td>
                      <td className={`px-4 py-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{user.createdAt}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${user.isActive ? (isDark ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-700') : (isDark ? 'bg-zinc-700 text-zinc-400' : 'bg-zinc-100 text-zinc-500')}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => toggleActive(user.id, user.isActive)}
                          title={user.isActive ? 'Deactivate user' : 'Activate user'}
                          className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${user.isActive ? (isDark ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-50 text-red-500 hover:bg-red-100') : (isDark ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100')}`}
                        >
                          {user.isActive ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
