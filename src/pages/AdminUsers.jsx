import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, UserX, UserCheck, Trash2, ShieldAlert, Calendar, Mail, X } from 'lucide-react';
import { adminApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Badge, Card, LoadingState, PageHeader, Input } from '../components/ui';

const PAGE_SIZE = 20;

export default function AdminUsers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pageCount: 1, total: 0, hasNext: false, hasPrev: false });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleteConfirmDisabled, setDeleteConfirmDisabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;
    const timer = setTimeout(() => {
      const next = new URLSearchParams();
      if (search.trim()) next.set('search', search.trim());
      next.set('page', '1');
      setSearchParams(next);
    }, 350);
    return () => clearTimeout(timer);
  }, [search, setSearchParams, user]);

  const fetchUsers = async () => {
    if (!user || user.role !== 'ADMIN') return;
    setLoading(true);
    try {
      const params = {
        page,
        limit: PAGE_SIZE,
        ...(search.trim() ? { search: search.trim() } : {}),
      };
      const data = await adminApi.listUsers(params);
      setUsers(data.users || data.items || []);
      setMeta({
        page: Number(data.page || page),
        pageCount: Number(data.pageCount || data.pages || 1),
        total: Number(data.total || data.count || 0),
        hasNext: Boolean(data.hasNext || (Number(data.page || page) < Number(data.pageCount || data.pages || 1))),
        hasPrev: Boolean(data.hasPrev || Number(data.page || page) > 1),
      });
    } catch (err) {
      toast.error(err.message || 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;
    fetchUsers();
  }, [searchParams, user]);

  const adminEmail = user?.email?.toLowerCase();

  const toggleUserStatus = async (row) => {
    if (row.email?.toLowerCase() === adminEmail) return;
    try {
      setSubmitting(true);
      if (row.isActive) {
        await adminApi.suspendUser(row.id);
        toast.success('User suspended.');
      } else {
        await adminApi.reactivateUser(row.id);
        toast.success('User reactivated.');
      }
      await fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Unable to update user status.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteCandidate || deleteEmail.trim().toLowerCase() !== deleteCandidate.email.toLowerCase()) return;
    try {
      setSubmitting(true);
      await adminApi.deleteUser(deleteCandidate.id);
      toast.success('User deleted.');
      setDeleteCandidate(null);
      setDeleteEmail('');
      await fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Unable to delete user.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return <LoadingState message="Checking access…" />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader title="Admin · Users" subtitle="Manage account access, memberships, and account lifecycle." />
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              className="pl-10"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users"
            />
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            {meta.total} total
          </div>
        </div>

        {loading ? (
          <LoadingState message="Loading users…" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Verified</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((row) => {
                  const ownRow = row.email?.toLowerCase() === adminEmail;
                  return (
                    <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold text-slate-800">{row.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><Badge variant="blue">{row.role}</Badge></td>
                      <td className="px-4 py-3">
                        <Badge variant={row.isActive ? 'green' : 'red'}>{row.isActive ? 'Active' : 'Suspended'}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={row.isVerified ? 'green' : 'gray'}>{row.isVerified ? 'Yes' : 'No'}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Calendar className="w-4 h-4" />
                          <span>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={ownRow || submitting}
                            onClick={() => toggleUserStatus(row)}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {row.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            {row.isActive ? 'Suspend' : 'Reactivate'}
                          </button>
                          <button
                            type="button"
                            disabled={ownRow || submitting}
                            onClick={() => setDeleteCandidate(row)}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="py-8 text-center text-slate-500 text-sm">No users found.</div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            disabled={!meta.hasPrev || loading}
            onClick={() => {
              const newPage = Math.max(1, page - 1);
              setPage(newPage);
              setSearchParams({ ...(search ? { search } : {}), page: String(newPage) });
            }}
            className="px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 disabled:opacity-50"
          >Previous</button>
          <span className="text-sm font-semibold text-slate-500">Page {meta.page || page} / {meta.pageCount || 1}</span>
          <button
            type="button"
            disabled={!meta.hasNext || loading}
            onClick={() => {
              const newPage = page + 1;
              setPage(newPage);
              setSearchParams({ ...(search ? { search } : {}), page: String(newPage) });
            }}
            className="px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 disabled:opacity-50"
          >Next</button>
        </div>
      </Card>

      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <h3 className="font-display font-bold text-slate-900">Delete user</h3>
              </div>
              <button type="button" onClick={() => { setDeleteCandidate(null); setDeleteEmail(''); }} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-slate-600">
                This will permanently delete this user and all their companies and emission data. This cannot be undone.
              </p>
              <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
                Type <span className="underline">{deleteCandidate.email}</span> to confirm deletion.
              </div>
              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Confirm email</label>
                <Input
                  type="text"
                  value={deleteEmail}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDeleteEmail(v);
                    setDeleteConfirmDisabled(v.trim().toLowerCase() !== deleteCandidate.email.toLowerCase());
                  }}
                  placeholder={deleteCandidate.email}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100">
              <button type="button" onClick={() => { setDeleteCandidate(null); setDeleteEmail(''); }} className="px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 text-slate-700">Cancel</button>
              <button type="button" disabled={deleteConfirmDisabled || submitting} onClick={confirmDelete} className="px-4 py-2 rounded-xl text-sm font-bold border border-red-200 bg-red-600 text-white disabled:opacity-50">
                Delete user
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
