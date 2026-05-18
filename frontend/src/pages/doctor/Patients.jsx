// Doctor Patients page
import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { calcAge, getAvatarUrl } from '../../utils/helpers';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me').then(async ({ data: me }) => {
      if (me.profile) {
        const { data } = await api.get(`/doctors/${me.profile._id}/patients`);
        setPatients(data.patients || []);
      }
    }).catch(() => toast.error('Failed to load patients')).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="My Patients">
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? [...Array(6)].map((_, i) => (
            <div key={i} className="skeleton rounded-2xl h-32" />
          )) : patients.length === 0 ? (
            <div className="col-span-3 text-center py-16 text-slate-400">No patients assigned yet</div>
          ) : patients.map(p => (
            <div key={p._id} className="card hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-3">
                <img src={getAvatarUrl(p.user?.avatar, p.user?.name)} className="w-12 h-12 rounded-xl" alt="" />
                <div>
                  <h3 className="font-bold text-slate-800">{p.user?.name}</h3>
                  <p className="text-slate-500 text-xs">{p.user?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  ['Age', calcAge(p.dateOfBirth) ? `${calcAge(p.dateOfBirth)}y` : '—'],
                  ['Blood', p.bloodGroup || '—'],
                  ['Gender', p.gender?.[0] || '—']
                ].map(([lbl, val]) => (
                  <div key={lbl} className="bg-slate-50 rounded-xl p-2">
                    <p className="text-slate-800 font-bold text-sm">{val}</p>
                    <p className="text-slate-400 text-xs">{lbl}</p>
                  </div>
                ))}
              </div>
              {p.allergies?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {p.allergies.map(a => (
                    <span key={a} className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded-full font-medium">{a}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
