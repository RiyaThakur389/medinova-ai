// ── Admin Patients ─────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { StatusBadge, Pagination } from '../../components/common/UI';
import { FiSearch, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { formatDate, getAvatarUrl, calcAge } from '../../utils/helpers';

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/patients', { params: { search, page, limit: 10 } });
      setPatients(data.patients);
      setTotalPages(data.pages);
    } catch { toast.error('Failed to load patients'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPatients(); }, [search, page]);

  const toggleStatus = async (userId) => {
    try {
      const { data } = await api.put(`/admin/users/${userId}/toggle-status`);
      toast.success(data.message);
      fetchPatients();
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <DashboardLayout title="Manage Patients">
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input className="input-field pl-10" placeholder="Search patients..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-left">
                  <th className="px-5 py-3.5 font-medium">Patient</th>
                  <th className="px-5 py-3.5 font-medium hidden md:table-cell">Age / Gender</th>
                  <th className="px-5 py-3.5 font-medium hidden lg:table-cell">Blood Group</th>
                  <th className="px-5 py-3.5 font-medium hidden sm:table-cell">Joined</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? [...Array(6)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-5 py-3"><div className="skeleton h-12 rounded-lg" /></td></tr>
                )) : patients.map(p => (
                  <tr key={p._id} className="table-row">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img src={getAvatarUrl(p.user?.avatar, p.user?.name)} className="w-9 h-9 rounded-full" alt="" />
                        <div>
                          <p className="font-semibold text-slate-800">{p.user?.name}</p>
                          <p className="text-slate-400 text-xs">{p.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 hidden md:table-cell">
                      {calcAge(p.dateOfBirth) ? `${calcAge(p.dateOfBirth)} yrs` : 'N/A'} · {p.gender || 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs font-bold">{p.bloodGroup || 'N/A'}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 hidden sm:table-cell">{formatDate(p.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={p.user?.isActive ? 'Active' : 'Inactive'} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => toggleStatus(p.user?._id)}
                        className={`p-2 rounded-lg transition-colors ${p.user?.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-50'}`}>
                        {p.user?.isActive ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </DashboardLayout>
  );
}
