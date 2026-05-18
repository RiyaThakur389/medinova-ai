import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import { FiPlus, FiDownload, FiEye } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { formatDate, getAvatarUrl } from '../../utils/helpers';

export default function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    <DashboardLayout title="Prescriptions">
      <div className="space-y-5">
        <div className="flex justify-end">
          <button onClick={() => navigate('/doctor/prescriptions/new')} className="btn-primary flex items-center gap-2">
            <FiPlus size={16} /><span>New Prescription</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton rounded-2xl h-40" />)}
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-slate-400 text-lg mb-2">No prescriptions yet</p>
            <p className="text-slate-300 text-sm">Create your first prescription from an appointment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {prescriptions.map(p => (
              <div key={p._id} className="card hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <img src={getAvatarUrl(p.patient?.user?.avatar, p.patient?.user?.name)} className="w-10 h-10 rounded-xl" alt="" />
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{p.patient?.user?.name}</p>
                    <p className="text-slate-400 text-xs">{formatDate(p.createdAt)}</p>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl mb-3">
                  <p className="text-blue-700 font-semibold text-sm">{p.diagnosis}</p>
                </div>
                <div className="mb-3">
                  <p className="text-slate-500 text-xs font-medium mb-1">Medicines ({p.medicines?.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {p.medicines?.slice(0, 3).map((m, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">{m.name}</span>
                    ))}
                    {p.medicines?.length > 3 && <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">+{p.medicines.length - 3} more</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => downloadPDF(p._id)}
                    className="flex items-center gap-1.5 flex-1 justify-center py-2 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
                    <FiDownload size={13} /> PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
