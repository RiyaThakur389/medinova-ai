import { useState } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import { FiActivity, FiAlertCircle, FiCheckCircle, FiLoader } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function SymptomChecker() {
  const [form, setForm] = useState({ symptoms: '', age: '', gender: '', medicalHistory: '' });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!form.symptoms.trim()) return toast.error('Please describe your symptoms');
    setLoading(true);
    setResult('');
    try {
      const { data } = await api.post('/ai/symptom-check', form);
      setResult(data.analysis);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Symptom analysis unavailable');
    } finally {
      setLoading(false);
    }
  };

  const commonSymptoms = [
    'Fever and chills', 'Headache and dizziness', 'Chest pain',
    'Shortness of breath', 'Nausea and vomiting', 'Fatigue and weakness',
    'Cough and sore throat', 'Joint pain and stiffness'
  ];

  return (
    <DashboardLayout title="AI Symptom Checker">
      <div className="max-w-3xl space-y-6">
        {/* Info banner */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
          <FiAlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-amber-800 font-semibold text-sm">Important Disclaimer</p>
            <p className="text-amber-700 text-xs mt-0.5 leading-relaxed">
              This AI symptom checker is for informational purposes only and does not replace professional medical diagnosis. Always consult a qualified healthcare provider for medical concerns.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#a78bfa)' }}>
              <FiActivity className="text-white" size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 font-display">Describe Your Symptoms</h3>
              <p className="text-slate-400 text-xs">Powered by Groq AI (Llama 3.3)</p>
            </div>
          </div>

          <form onSubmit={handleCheck} className="space-y-4">
            {/* Common symptom chips */}
            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Common symptoms (click to add):</p>
              <div className="flex flex-wrap gap-2">
                {commonSymptoms.map(s => (
                  <button key={s} type="button"
                    onClick={() => setForm(f => ({
                      ...f,
                      symptoms: f.symptoms ? `${f.symptoms}, ${s}` : s
                    }))}
                    className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-xl text-xs font-medium hover:bg-purple-100 transition-colors border border-purple-100">
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Your Symptoms <span className="text-red-500">*</span>
              </label>
              <textarea
                className="input-field resize-none"
                rows={4}
                placeholder="Describe all your symptoms in detail (e.g., I have been experiencing a persistent headache for 3 days, along with mild fever and nausea...)"
                value={form.symptoms}
                onChange={e => setForm({ ...form, symptoms: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Age</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="e.g. 35"
                  min="1" max="120"
                  value={form.age}
                  onChange={e => setForm({ ...form, age: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Gender</label>
                <select className="input-field" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Medical History</label>
                <input
                  className="input-field"
                  placeholder="e.g. Diabetes, Hypertension"
                  value={form.medicalHistory}
                  onChange={e => setForm({ ...form, medicalHistory: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#0d9488)' }}
            >
              {loading ? (
                <>
                  <FiLoader size={16} className="animate-spin" />
                  <span>Analyzing symptoms...</span>
                </>
              ) : (
                <>
                  <FiActivity size={16} />
                  <span>Analyze Symptoms</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Result */}
        {result && (
          <div className="card animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                <FiCheckCircle className="text-emerald-600" size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 font-display">AI Analysis Result</h3>
                <p className="text-slate-400 text-xs">Generated by Groq AI</p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border border-slate-100">
              <div className="prose prose-sm max-w-none">
                {result.split('\n').map((line, i) => {
                  if (!line.trim()) return <br key={i} />;
                  // Bold headers (lines starting with numbers or **)
                  if (/^(\d+\.|##|\*\*)/.test(line.trim())) {
                    return (
                      <p key={i} className="font-semibold text-slate-800 mt-3 mb-1">
                        {line.replace(/\*\*/g, '')}
                      </p>
                    );
                  }
                  return (
                    <p key={i} className="text-slate-700 text-sm leading-relaxed">
                      {line}
                    </p>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-xl flex items-start gap-2">
              <FiAlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={14} />
              <p className="text-blue-700 text-xs">
                This analysis is AI-generated and should not replace professional medical advice.
                Book an appointment with a specialist for an accurate diagnosis.
              </p>
            </div>

            <div className="mt-3 flex gap-2">
              <a href="/patient/book" className="btn-primary flex-1 text-center text-sm py-2.5">
                Book Doctor Appointment
              </a>
              <button
                onClick={() => { setResult(''); setForm({ symptoms: '', age: '', gender: '', medicalHistory: '' }); }}
                className="btn-secondary flex-1 text-sm py-2.5"
              >
                Check Again
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
