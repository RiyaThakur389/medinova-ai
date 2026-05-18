import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import { StatCard, StatusBadge, CardSkeleton } from '../../components/common/UI';
import { FiCalendar, FiFileText, FiActivity, FiCpu, FiArrowRight } from 'react-icons/fi';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { formatDate, getAvatarUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, prescriptions: 0 });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [apptRes, rxRes] = await Promise.all([
          api.get('/appointments', { params: { limit: 20 } }),
          api.get('/prescriptions')
        ]);
        const appts = apptRes.data.appointments;
        setAppointments(appts.slice(0, 4));
        setStats({
          total: appts.length,
          pending: appts.filter(a => a.status === 'Pending').length,
          completed: appts.filter(a => a.status === 'Completed').length,
          prescriptions: rxRes.data.count
        });
      } catch { toast.error('Failed to load data'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const quickActions = [
    { label: 'Book Appointment', icon: FiCalendar, path: '/patient/book', color: 'from-blue-500 to-blue-600', desc: 'Schedule with a doctor' },
    { label: 'My Prescriptions', icon: FiFileText, path: '/patient/prescriptions', color: 'from-teal-500 to-teal-600', desc: 'View & download prescriptions' },
    { label: 'Symptom Checker', icon: FiActivity, path: '/patient/symptoms', color: 'from-purple-500 to-purple-600', desc: 'AI symptom analysis' },
    { label: 'AI Health Chat', icon: FiCpu, path: '/patient/chat', color: 'from-pink-500 to-pink-600', desc: '24/7 health assistant' },
  ];

  return (
    <DashboardLayout title="Patient Dashboard">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="rounded-2xl p-6 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0f4c75 100%)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <p className="text-blue-200 text-sm">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},</p>
            <h2 className="text-white text-2xl font-bold font-display mt-1">{user?.name} 👋</h2>
            <p className="text-slate-400 text-sm mt-1">Your health is our top priority. How are you feeling today?</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? [...Array(4)].map((_, i) => <CardSkeleton key={i} />) : (
            <>
              <StatCard label="Total Visits" value={stats.total} icon={FiCalendar} gradient="linear-gradient(135deg,#1d4ed8,#3b82f6)" />
              <StatCard label="Pending" value={stats.pending} icon={FiActivity} gradient="linear-gradient(135deg,#d97706,#f59e0b)" />
              <StatCard label="Completed" value={stats.completed} icon={FiFileText} gradient="linear-gradient(135deg,#059669,#10b981)" />
              <StatCard label="Prescriptions" value={stats.prescriptions} icon={FiFileText} gradient="linear-gradient(135deg,#7c3aed,#a78bfa)" />
            </>
          )}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map(({ label, icon: Icon, path, color, desc }) => (
            <button key={label} onClick={() => navigate(path)}
              className="card text-left hover:scale-105 transition-all group">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon size={20} className="text-white" />
              </div>
              <p className="font-bold text-slate-800 text-sm">{label}</p>
              <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
            </button>
          ))}
        </div>

        {/* Recent appointments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 font-display">Recent Appointments</h3>
            <button onClick={() => navigate('/patient/appointments')}
              className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:underline">
              View all <FiArrowRight size={14} />
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-400 mb-3">No appointments yet</p>
              <button onClick={() => navigate('/patient/book')} className="btn-primary text-sm py-2">
                Book your first appointment
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map(appt => (
                <div key={appt._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <img src={getAvatarUrl(appt.doctor?.user?.avatar, appt.doctor?.user?.name)} className="w-10 h-10 rounded-full flex-shrink-0" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{appt.doctor?.user?.name}</p>
                    <p className="text-slate-400 text-xs">{appt.doctor?.specialization} · {formatDate(appt.appointmentDate)} · {appt.timeSlot}</p>
                  </div>
                  <StatusBadge status={appt.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
