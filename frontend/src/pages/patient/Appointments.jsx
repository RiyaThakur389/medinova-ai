// Patient Appointments
import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { StatusBadge, Pagination } from '../../components/common/UI';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { formatDate, getAvatarUrl } from '../../utils/helpers';

const STATUSES = ['All', 'Pending', 'Approved', 'Completed', 'Cancelled'];

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  const cancelAppointment = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await api.put(`/appointments/${id}/cancel`, { reason: 'Cancelled by patient' });
      toast.success('Appointment cancelled');
      fetch();
    } catch { toast.error('Cancel failed'); }
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

        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
        ) : appointments.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-slate-400">No appointments found</p>
            <a href="/patient/book" className="btn-primary mt-4 inline-block">Book Appointment</a>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map(appt => (
              <div key={appt._id} className="card flex items-center gap-4">
                <img src={getAvatarUrl(appt.doctor?.user?.avatar, appt.doctor?.user?.name)} className="w-12 h-12 rounded-xl flex-shrink-0" alt="" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-800">{appt.doctor?.user?.name}</p>
                      <p className="text-blue-600 text-xs font-medium">{appt.doctor?.specialization}</p>
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>
                  <p className="text-slate-500 text-sm mt-1">{formatDate(appt.appointmentDate)} · {appt.timeSlot} · {appt.type}</p>
                  {appt.symptoms && <p className="text-slate-400 text-xs mt-0.5 truncate">Symptoms: {appt.symptoms}</p>}
                  {appt.doctorNotes && <p className="text-slate-600 text-xs mt-1 bg-blue-50 px-2 py-1 rounded-lg">Doctor's note: {appt.doctorNotes}</p>}
                </div>
                {['Pending', 'Approved'].includes(appt.status) && (
                  <button onClick={() => cancelAppointment(appt._id)}
                    className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </DashboardLayout>
  );
}
