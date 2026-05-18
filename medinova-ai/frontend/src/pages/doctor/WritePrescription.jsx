import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import { FiPlus, FiTrash2, FiCpu, FiSave } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const emptyMed = { name: '', dosage: '', frequency: 'Once daily', duration: '7 days', instructions: '' };

export default function WritePrescription() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const appointmentId = searchParams.get('appointmentId');
  const patientId = searchParams.get('patientId');

  const [patient, setPatient] = useState(null);
  const [form, setForm] = useState({
    diagnosis: '', instructions: '', followUpDate: '',
    vitals: { bloodPressure: '', heartRate: '', temperature: '', weight: '', oxygenSaturation: '' }
  });
  const [medicines, setMedicines] = useState([{ ...emptyMed }]);
  const [labTests, setLabTests] = useState([]);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState('');

  useEffect(() => {
    if (patientId) {
      api.get(`/patients/${patientId}`)
        .then(res => setPatient(res.data.patient))
        .catch(() => {});
    }
  }, [patientId]);

  const addMedicine = () => setMedicines([...medicines, { ...emptyMed }]);
  const removeMedicine = (i) => setMedicines(medicines.filter((_, idx) => idx !== i));
  const updateMed = (i, field, val) => {
    const updated = [...medicines];
    updated[i][field] = val;
    setMedicines(updated);
  };

  const getAISuggestions = async () => {
    if (!form.diagnosis) return toast.error('Enter diagnosis first');
    setAiLoading(true);
    try {
      const { data } = await api.post('/ai/prescription-assist', {
        diagnosis: form.diagnosis,
        patientAge: patient?.age,
        allergies: patient?.allergies || [],
        currentMedications: patient?.currentMedications?.map(m => m.name) || []
      });
      setAiSuggestions(data.suggestions);
      toast.success('AI suggestions ready!');
    } catch { toast.error('AI assist unavailable'); }
    finally { setAiLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.diagnosis) return toast.error('Diagnosis is required');
    if (medicines.some(m => !m.name)) return toast.error('All medicine names are required');
    setSaving(true);
    try {
      await api.post('/prescriptions', {
        appointmentId, patientId,
        ...form, medicines, labTests
      });
      toast.success('Prescription saved!');
      navigate('/doctor/prescriptions');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save prescription');
    } finally { setSaving(false); }
  };

  return (
    <DashboardLayout title="Write Prescription">
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Patient info */}
        {patient && (
          <div className="card flex items-center gap-4">
            <img src={`https://ui-avatars.com/api/?name=${patient.user?.name}&background=1d4ed8&color=fff&bold=true`}
              className="w-14 h-14 rounded-2xl" alt="" />
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{patient.user?.name}</h3>
              <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
                <span>{patient.age} years</span>
                <span>·</span>
                <span>{patient.gender}</span>
                <span>·</span>
                <span className="text-red-600 font-semibold">{patient.bloodGroup}</span>
              </div>
              {patient.allergies?.length > 0 && (
                <div className="flex gap-1 mt-1">
                  <span className="text-xs text-slate-500">Allergies:</span>
                  {patient.allergies.map(a => (
                    <span key={a} className="px-1.5 py-0.5 bg-red-50 text-red-600 text-xs rounded font-medium">{a}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vitals */}
        <div className="card">
          <h3 className="font-bold text-slate-800 font-display mb-4">Vitals</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { key: 'bloodPressure', label: 'BP (mmHg)', placeholder: '120/80' },
              { key: 'heartRate', label: 'Heart Rate', placeholder: '72 bpm' },
              { key: 'temperature', label: 'Temp (°F)', placeholder: '98.6' },
              { key: 'weight', label: 'Weight (kg)', placeholder: '70' },
              { key: 'oxygenSaturation', label: 'SpO2 (%)', placeholder: '98' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-1">
                <label className="text-xs font-medium text-slate-500">{label}</label>
                <input className="input-field text-sm" value={form.vitals[key]} placeholder={placeholder}
                  onChange={e => setForm({ ...form, vitals: { ...form.vitals, [key]: e.target.value } })} />
              </div>
            ))}
          </div>
        </div>

        {/* Diagnosis with AI */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 font-display">Diagnosis</h3>
            <button type="button" onClick={getAISuggestions} disabled={aiLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors">
              <FiCpu size={15} />
              {aiLoading ? 'Getting AI...' : 'AI Suggest'}
            </button>
          </div>
          <textarea className="input-field resize-none" rows={3} required value={form.diagnosis}
            onChange={e => setForm({ ...form, diagnosis: e.target.value })}
            placeholder="Enter diagnosis/condition..." />
          {aiSuggestions && (
            <div className="mt-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <FiCpu size={14} className="text-purple-600" />
                <span className="text-purple-700 text-xs font-semibold">AI Prescription Assistant</span>
              </div>
              <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{aiSuggestions}</div>
            </div>
          )}
        </div>

        {/* Medicines */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 font-display">Medicines</h3>
            <button type="button" onClick={addMedicine}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
              <FiPlus size={14} /> Add
            </button>
          </div>
          <div className="space-y-3">
            {medicines.map((med, i) => (
              <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-slate-50/80 rounded-xl relative">
                {[
                  { field: 'name', placeholder: 'Medicine name', colSpan: 'col-span-2 sm:col-span-1' },
                  { field: 'dosage', placeholder: 'Dosage', colSpan: '' },
                  { field: 'frequency', placeholder: 'Frequency', colSpan: '' },
                  { field: 'duration', placeholder: 'Duration', colSpan: '' },
                ].map(({ field, placeholder, colSpan }) => (
                  <input key={field} className={`input-field text-sm ${colSpan}`} placeholder={placeholder}
                    value={med[field]} onChange={e => updateMed(i, field, e.target.value)}
                    required={field === 'name'} />
                ))}
                <div className="flex items-center gap-2">
                  <input className="input-field text-sm flex-1" placeholder="Instructions" value={med.instructions}
                    onChange={e => updateMed(i, 'instructions', e.target.value)} />
                  {medicines.length > 1 && (
                    <button type="button" onClick={() => removeMedicine(i)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions + Follow up */}
        <div className="card">
          <h3 className="font-bold text-slate-800 font-display mb-4">Instructions & Follow-up</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">General Instructions</label>
              <textarea className="input-field resize-none" rows={4} value={form.instructions}
                onChange={e => setForm({ ...form, instructions: e.target.value })}
                placeholder="Diet restrictions, activity advice, etc." />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Follow-up Date</label>
              <input type="date" className="input-field" value={form.followUpDate}
                onChange={e => setForm({ ...form, followUpDate: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/doctor/appointments')} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <FiSave size={16} />
            {saving ? 'Saving...' : 'Save Prescription'}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}
