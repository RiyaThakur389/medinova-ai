import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { FiCalendar, FiTrendingUp, FiAward } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '../../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/admin/reports'), api.get('/admin/dashboard')])
      .then(([reports, dashboard]) => setData({ ...reports.data, monthlyData: dashboard.data.monthlyData }))
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false));
  }, []);

  const metrics = [
    { label: "Today's Appointments", value: data?.reports?.todayAppointments, icon: FiCalendar, color: 'from-blue-500 to-blue-600' },
    { label: 'This Week', value: data?.reports?.thisWeekAppointments, icon: FiTrendingUp, color: 'from-teal-500 to-teal-600' },
    { label: 'This Month', value: data?.reports?.thisMonthAppointments, icon: FiAward, color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <DashboardLayout title="Reports & Insights">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {metrics.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`rounded-2xl p-6 bg-gradient-to-br ${color} text-white`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/80 text-sm font-medium">{label}</p>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Icon size={18} />
                </div>
              </div>
              {loading ? <div className="skeleton h-8 w-16 bg-white/20 rounded" /> : (
                <p className="text-4xl font-bold font-display">{value ?? 0}</p>
              )}
            </div>
          ))}
        </div>

        {/* Monthly chart */}
        <div className="card">
          <h3 className="font-bold text-slate-800 font-display mb-4">Appointment Trends (Last 6 Months)</h3>
          {loading ? <div className="skeleton h-56 rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data?.monthlyData || []} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" name="Appointments" radius={[8, 8, 0, 0]}>
                  {(data?.monthlyData || []).map((_, i) => (
                    <rect key={i} fill={`hsl(${220 + i * 15}, 70%, 55%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top doctors */}
        <div className="card">
          <h3 className="font-bold text-slate-800 font-display mb-4">Top Performing Doctors</h3>
          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
          ) : (
            <div className="space-y-3">
              {(data?.topDoctors || []).map((doc, i) => (
                <div key={doc._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: ['#1d4ed8','#0d9488','#7c3aed','#d97706','#059669'][i] }}>
                    {i + 1}
                  </div>
                  <img src={getAvatarUrl(doc.userInfo?.avatar, doc.userInfo?.name)} className="w-10 h-10 rounded-full" alt="" />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 text-sm">{doc.userInfo?.name}</p>
                    <p className="text-slate-400 text-xs">{doc.specialization}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">{doc.appointmentCount}</p>
                    <p className="text-slate-400 text-xs">appointments</p>
                  </div>
                </div>
              ))}
              {!data?.topDoctors?.length && <p className="text-center text-slate-400 py-8">No data available</p>}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
