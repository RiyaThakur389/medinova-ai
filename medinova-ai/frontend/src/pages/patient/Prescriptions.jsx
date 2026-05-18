import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { FiDownload, FiCalendar } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { formatDate, getAvatarUrl } from '../../utils/helpers';

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/prescriptions').then(res => setPrescriptions(res.data.prescriptions))
      .catch(() => toast.error('Failed to load prescriptions'))
      .finally(() => setLoading(false));
  }, []);

  const downloadPDF = async (id) => {
    try {
      const response = await api.get(`/prescriptions/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF downloaded!');
    } catch { toast.error('PDF download failed'); }
  };

  return (
    <DashboardLayout title="My Prescriptions">
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}</div>
        ) : prescriptions.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-slate-400 text-lg mb-2">No prescriptions yet</p>
            <p className="text-slate-300 text-sm">Your prescriptions will appear here after doctor consultations</p>
          </div>
        ) : prescriptions.map(p => (
          <div key={p._id} className="card">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <img src={getAvatarUrl(p.doctor?.user?.avatar, p.doctor?.user?.name)} className="w-12 h-12 rounded-xl" alt="" />
                <div>
                  <p className="font-bold text-slate-800">{p.doctor?.user?.name}</p>
                  <p className="text-blue-600 text-xs font-medium">{p.doctor?.specialization}</p>
                  <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                    <FiCalendar size={11} /> {formatDate(p.createdAt)}
                  </p>
                </div>
              </div>
              <button onClick={() => downloadPDF(p._id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors flex-shrink-0">
                <FiDownload size={15} /> PDF
              </button>
            </div>

            <div className="p-3 bg-blue-50 rounded-xl mb-3">
              <p className="text-xs text-blue-500 font-medium mb-0.5">Diagnosis</p>
              <p className="text-blue-800 font-semibold">{p.diagnosis}</p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">Prescribed Medicines</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {p.medicines?.map((med, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 text-xs font-bold">{i + 1}</div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{med.name} <span className="text-slate-400 font-normal">{med.dosage}</span></p>
                      <p className="text-slate-500 text-xs">{med.frequency} · {med.duration}</p>
                      {med.instructions && <p className="text-slate-400 text-xs italic">{med.instructions}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {p.instructions && (
              <div className="mt-3 p-3 bg-amber-50 rounded-xl">
                <p className="text-xs text-amber-600 font-medium mb-0.5">Instructions</p>
                <p className="text-amber-800 text-sm">{p.instructions}</p>
              </div>
            )}

            {p.followUpDate && (
              <p className="mt-3 text-sm text-slate-600">
                <span className="font-medium">Follow-up:</span> {formatDate(p.followUpDate)}
              </p>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
