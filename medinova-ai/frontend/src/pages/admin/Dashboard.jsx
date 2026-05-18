import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { StatCard, StatusBadge, CardSkeleton } from '../../components/common/UI';
import { FiUsers, FiCalendar, FiFileText, FiActivity, FiClock, FiCheckCircle } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../../utils/api';
import { formatDate, getAvatarUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';

const COLORS = ['#1d4ed8', '#0d9488', '#7c3aed', '#db2777', '#d97706'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {loading ? [...Array(6)].map((_, i) => <CardSkeleton key={i} />) : (
            <>
              <StatCard label="Total Patients" value={stats.totalPatients || 0} icon={FiUsers}
                gradient="linear-gradient(135deg,#1d4ed8,#3b82f6)" />
              <StatCard label="Total Doctors" value={stats.totalDoctors || 0} icon={FiActivity}
                gradient="linear-gradient(135deg,#0d9488,#14b8a6)" />
              <StatCard label="Appointments" value={stats.totalAppointments || 0} icon={FiCalendar}
                gradient="linear-gradient(135deg,#7c3aed,#a78bfa)" />
              <StatCard label="Pending" value={stats.pendingAppointments || 0} icon={FiClock}
                gradient="linear-gradient(135deg,#d97706,#f59e0b)" />
              <StatCard label="Completed" value={stats.completedAppointments || 0} icon={FiCheckCircle}
                gradient="linear-gradient(135deg,#059669,#10b981)" />
              <StatCard label="Prescriptions" value={stats.totalPrescriptions || 0} icon={FiFileText}
                gradient="linear-gradient(135deg,#db2777,#f472b6)" />
            </>
          )}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly appointments bar chart */}
          <div className="card">
            <h3 className="font-bold text-slate-800 font-display mb-4">Monthly Appointments</h3>
            {loading ? <div className="skeleton h-48 w-full rounded-xl" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data?.monthlyData || []} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 13 }}
                  />
                  <Bar dataKey="count" name="Appointments" radius={[6, 6, 0, 0]}
                    fill="url(#barGradient)" />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1d4ed8" />
                      <stop offset="100%" stopColor="#0d9488" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Specialization pie chart */}
          <div className="card">
            <h3 className="font-bold text-slate-800 font-display mb-4">Doctors by Specialization</h3>
            {loading ? <div className="skeleton h-48 w-full rounded-xl" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={data?.specializationData || []}
                    cx="50%" cy="50%"
                    outerRadius={80} innerRadius={40}
                    dataKey="count" nameKey="_id"
                    paddingAngle={3}
                  >
                    {(data?.specializationData || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent appointments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 font-display">Recent Appointments</h3>
            <a href="/admin/appointments" className="text-blue-600 text-sm font-medium hover:underline">View all →</a>
          </div>

          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 text-left border-b border-slate-100">
                    <th className="pb-3 font-medium">Patient</th>
                    <th className="pb-3 font-medium hidden md:table-cell">Doctor</th>
                    <th className="pb-3 font-medium hidden sm:table-cell">Date</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(data?.recentAppointments || []).map(appt => (
                    <tr key={appt._id} className="table-row">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={getAvatarUrl(appt.patient?.user?.avatar, appt.patient?.user?.name)}
                            className="w-8 h-8 rounded-full"
                            alt=""
                          />
                          <span className="font-medium text-slate-700">{appt.patient?.user?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-3 text-slate-500 hidden md:table-cell">
                        {appt.doctor?.user?.name || 'N/A'}
                      </td>
                      <td className="py-3 text-slate-500 hidden sm:table-cell">
                        {formatDate(appt.appointmentDate)} · {appt.timeSlot}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={appt.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data?.recentAppointments?.length && (
                <p className="text-center text-slate-400 py-8">No appointments yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
