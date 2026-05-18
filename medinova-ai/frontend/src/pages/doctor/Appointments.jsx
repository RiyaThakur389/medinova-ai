import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { StatusBadge, Pagination, Modal } from '../../components/common/UI';
import { FiEdit2, FiFileText } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { formatDate, getAvatarUrl } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

const STATUSES = ['All', 'Pending', 'Approved', 'Completed', 'Cancelled', 'Rejected'];

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [notes, setNotes] = useState('');
  const navigate = useNavigate();

  const fetch = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filterStatus !== 'All') params.status = filterStatus;
      const { data } = await api.get('/appointments', { params });
      setAppointments(data.appointments);
      setTotalPages(data.pages || 1);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [filterStatus, page]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status, doctorNotes: notes });
      toast.success(`Appointment ${status.toLowerCase()}`);
      setSelectedAppt(null);
      setNotes('');
      fetch();
    } catch { toast.error('Update failed'); }
  };

  return (
    <DashboardLayout title="My Appointments">
      <div className="space-y-5">
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterStatus === s
                ? 'text-white shadow-md' : 'text-slate-600 bg-white hover:bg-slate-50 border border-slate-200'}`}
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
                  <th className="px-5 py-3.5 font-medium hidden sm:table-cell">Date & Time</th>
                  <th className="px-5 py-3.5 font-medium hidden lg:table-cell">Symptoms</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? [...Array(6)].map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-5 py-3"><div className="skeleton h-12 rounded-lg" /></td></tr>
                )) : appointments.map(appt => (
                  <tr key={appt._id} className="table-row">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <img src={getAvatarUrl(appt.patient?.user?.avatar, appt.patient?.user?.name)} className="w-8 h-8 rounded-full" alt="" />
                        <div>
                          <p className="font-semibold text-slate-800">{appt.patient?.user?.name || 'N/A'}</p>
                          <p className="text-slate-400 text-xs">{appt.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <p className="font-medium text-slate-700">{formatDate(appt.appointmentDate)}</p>
                      <p className="text-slate-400 text-xs">{appt.timeSlot}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 max-w-xs hidden lg:table-cell">
                      <p className="truncate text-xs">{appt.symptoms || '—'}</p>
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={appt.status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        {appt.status === 'Pending' && (
                          <button onClick={() => { setSelectedAppt(appt); setNotes(''); }}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors">
                            <FiEdit2 size={15} />
                          </button>
                        )}
                        {appt.status === 'Approved' && (
                          <button onClick={() => navigate(`/doctor/prescriptions/new?appointmentId=${appt._id}&patientId=${appt.patient?._id}`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors">
                            <FiFileText size={13} />Prescribe
                          </button>
                        )}
                      </div>
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
      <Modal isOpen={!!selectedAppt} onClose={() => setSelectedAppt(null)} title="Update Appointment" size="sm">
        {selectedAppt && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl text-sm">
              <p className="font-semibold text-slate-800">{selectedAppt.patient?.user?.name}</p>
              <p className="text-slate-500">{formatDate(selectedAppt.appointmentDate)} · {selectedAppt.timeSlot}</p>
              {selectedAppt.symptoms && <p className="text-slate-600 mt-1 text-xs">Symptoms: {selectedAppt.symptoms}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Doctor's Notes (optional)</label>
              <textarea className="input-field resize-none" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add notes for the patient..." />
            </div>
            <div className="flex gap-2">
              <button onClick={() => updateStatus(selectedAppt._id, 'Approved')} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors">
                Approve
              </button>
              <button onClick={() => updateStatus(selectedAppt._id, 'Rejected')} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors">
                Reject
              </button>
            </div>
            <button onClick={() => setSelectedAppt(null)} className="btn-secondary w-full">Cancel</button>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
