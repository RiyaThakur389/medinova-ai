import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { StatusBadge, Pagination, Modal } from '../../components/common/UI';
import { FiSearch, FiFilter, FiEdit2 } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { formatDate, getAvatarUrl } from '../../utils/helpers';

const STATUSES = ['All', 'Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'];

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filterStatus !== 'All') params.status = filterStatus;
      const { data } = await api.get('/appointments', { params });
      setAppointments(data.appointments);
      setTotalPages(data.pages || 1);
    } catch { toast.error('Failed to load appointments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAppointments(); }, [filterStatus, page]);

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    setUpdating(true);
    try {
      await api.put(`/appointments/${selectedAppt._id}/status`, { status: newStatus });
      toast.success('Status updated');
      setSelectedAppt(null);
      fetchAppointments();
    } catch { toast.error('Update failed'); }
    finally { setUpdating(false); }
  };

  return (
    <DashboardLayout title="Manage Appointments">
      <div className="space-y-5">
        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterStatus === s
                ? 'text-white shadow-md'
                : 'text-slate-600 bg-white hover:bg-slate-50 border border-slate-200'}`}
              style={filterStatus === s ? { background: 'linear-gradient(135deg,#1d4ed8,#0d9488)' } : {}}>
              {s}
            </button>
          ))}
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-left">
                  <th className="px-5 py-3.5 font-medium">Patient</th>
                  <th className="px-5 py-3.5 font-medium hidden md:table-cell">Doctor</th>
                  <th className="px-5 py-3.5 font-medium hidden sm:table-cell">Date & Time</th>
                  <th className="px-5 py-3.5 font-medium hidden lg:table-cell">Type</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? [...Array(8)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-5 py-3"><div className="skeleton h-12 rounded-lg" /></td></tr>
                )) : appointments.map(appt => (
                  <tr key={appt._id} className="table-row">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <img src={getAvatarUrl(appt.patient?.user?.avatar, appt.patient?.user?.name)} className="w-8 h-8 rounded-full" alt="" />
                        <span className="font-medium text-slate-700">{appt.patient?.user?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 hidden md:table-cell">{appt.doctor?.user?.name || 'N/A'}</td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <p className="font-medium text-slate-700">{formatDate(appt.appointmentDate)}</p>
                      <p className="text-slate-400 text-xs">{appt.timeSlot}</p>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{appt.type}</span>
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={appt.status} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => { setSelectedAppt(appt); setNewStatus(appt.status); }}
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors">
                        <FiEdit2 size={15} />
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

      {/* Status update modal */}
      <Modal isOpen={!!selectedAppt} onClose={() => setSelectedAppt(null)} title="Update Appointment Status" size="sm">
        {selectedAppt && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm font-medium text-slate-700">{selectedAppt.patient?.user?.name} → {selectedAppt.doctor?.user?.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{formatDate(selectedAppt.appointmentDate)} · {selectedAppt.timeSlot}</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">New Status</label>
              <select className="input-field" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                {['Pending','Approved','Rejected','Completed','Cancelled'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSelectedAppt(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleStatusUpdate} disabled={updating} className="btn-primary flex-1">
                {updating ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
