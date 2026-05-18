import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { StatCard, StatusBadge, CardSkeleton } from '../../components/common/UI';
import { FiUsers, FiCalendar, FiFileText, FiClock } from 'react-icons/fi';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { formatDate, getAvatarUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, patients: 0 });
  const [appointments, setAppointments] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [apptRes, profileRes] = await Promise.all([
          api.get('/appointments', { params: { limit: 50 } }),
          api.get('/auth/me')
        ]);
        const appts = apptRes.data.appointments;
        setAppointments(appts.slice(0, 5));
        setDoctorProfile(profileRes.data.profile);
        const unique = new Set(appts.map(a => a.patient?._id)).size;
        setStats({
          total: appts.length,
          pending: appts.filter(a => a.status === 'Pending').length,
          completed: appts.filter(a => a.status === 'Completed').length,
          patients: unique
        });
      } catch { toast.error('Failed to load data'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      toast.success(`Appointment ${status.toLowerCase()}`);
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
    } catch { toast.error('Update failed'); }
  };

  return (
    <DashboardLayout title="Doctor Dashboard">
      <div className="space-y-6">
        {/* Welcome banner */}
        <div className="rounded-2xl p-6 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0f4c75 100%)' }}>
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10 flex items-center gap-4">
            <img src={getAvatarUrl(user?.avatar, user?.name)} className="w-14 h-14 rounded-2xl ring-2 ring-white/30" alt="" />
            <div>
              <p className="text-blue-200 text-sm font-medium">Welcome back,</p>
              <h2 className="text-white text-2xl font-bold font-display">{user?.name}</h2>
              <p className="text-slate-400 text-sm">{doctorProfile?.specialization} · {doctorProfile?.department}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? [...Array(4)].map((_, i) => <CardSkeleton key={i} />) : (
            <>
              <StatCard label="Total Appointments" value={stats.total} icon={FiCalendar} gradient="linear-gradient(135deg,#1d4ed8,#3b82f6)" />
              <StatCard label="Pending" value={stats.pending} icon={FiClock} gradient="linear-gradient(135deg,#d97706,#f59e0b)" />
              <StatCard label="Completed" value={stats.completed} icon={FiFileText} gradient="linear-gradient(135deg,#059669,#10b981)" />
              <StatCard label="Patients" value={stats.patients} icon={FiUsers} gradient="linear-gradient(135deg,#7c3aed,#a78bfa)" />
            </>
          )}
        </div>

        {/* Today's appointments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 font-display">Recent Appointments</h3>
            <a href="/doctor/appointments" className="text-blue-600 text-sm font-medium hover:underline">View all →</a>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
          ) : appointments.length === 0 ? (
            <p className="text-center text-slate-400 py-8">No appointments yet</p>
          ) : (
            <div className="space-y-3">
              {appointments.map(appt => (
                <div key={appt._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <img src={getAvatarUrl(appt.patient?.user?.avatar, appt.patient?.user?.name)} className="w-10 h-10 rounded-full flex-shrink-0" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{appt.patient?.user?.name}</p>
                    <p className="text-slate-400 text-xs">{formatDate(appt.appointmentDate)} · {appt.timeSlot}</p>
                  </div>
                  <StatusBadge status={appt.status} />
                  {appt.status === 'Pending' && (
                    <div className="flex gap-1.5">
                      <button onClick={() => handleStatusUpdate(appt._id, 'Approved')}
                        className="px-3 py-1 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                        Approve
                      </button>
                      <button onClick={() => handleStatusUpdate(appt._id, 'Rejected')}
                        className="px-3 py-1 text-xs font-semibold text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
