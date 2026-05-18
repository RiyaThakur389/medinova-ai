import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function PatientProfile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', dateOfBirth: '', gender: '', bloodGroup: '',
    height: '', weight: '', address: { city: '', state: '', country: 'India' },
    emergencyContact: { name: '', relationship: '', phone: '' }, allergies: []
  });
  const [newAllergy, setNewAllergy] = useState('');

  useEffect(() => {
    api.get('/patients/me').then(res => {
      const p = res.data.patient;
      setProfile(p);
      setForm({
        name: p.user?.name || '', phone: p.user?.phone || '',
        dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
        gender: p.gender || '', bloodGroup: p.bloodGroup || '',
        height: p.height || '', weight: p.weight || '',
        address: p.address || { city: '', state: '', country: 'India' },
        emergencyContact: p.emergencyContact || { name: '', relationship: '', phone: '' },
        allergies: p.allergies || []
      });
    }).catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/patients/me', form);
      updateUser({ name: form.name, phone: form.phone });
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const addAllergy = () => {
    if (!newAllergy.trim()) return;
    setForm({ ...form, allergies: [...form.allergies, newAllergy.trim()] });
    setNewAllergy('');
  };

  const removeAllergy = (i) => setForm({ ...form, allergies: form.allergies.filter((_, idx) => idx !== i) });

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });
  const setAddr = (f) => (e) => setForm({ ...form, address: { ...form.address, [f]: e.target.value } });
  const setEmerg = (f) => (e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, [f]: e.target.value } });

  if (loading) return <DashboardLayout title="My Profile"><div className="skeleton h-96 rounded-2xl" /></DashboardLayout>;

  return (
    <DashboardLayout title="My Profile">
      <form onSubmit={handleSave} className="max-w-3xl space-y-6">
        {/* Avatar section */}
        <div className="card flex items-center gap-5">
          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'U')}&background=1d4ed8&color=fff&bold=true&size=128`}
            className="w-20 h-20 rounded-2xl" alt="" />
          <div>
            <h3 className="font-bold text-slate-800 text-xl">{form.name || user?.name}</h3>
            <p className="text-slate-500">{user?.email}</p>
            {profile && (
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
                {profile.age && <span>{profile.age} yrs</span>}
                {form.bloodGroup && <><span>·</span><span className="text-red-600 font-bold">{form.bloodGroup}</span></>}
                {form.gender && <><span>·</span><span>{form.gender}</span></>}
              </div>
            )}
          </div>
        </div>

        {/* Basic info */}
        <div className="card">
          <h3 className="font-bold text-slate-800 font-display mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Full Name</label>
              <input className="input-field" value={form.name} onChange={set('name')} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <input className="input-field" value={form.phone} onChange={set('phone')} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Date of Birth</label>
              <input type="date" className="input-field" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Gender</label>
              <select className="input-field" value={form.gender} onChange={set('gender')}>
                <option value="">Select</option>
                {['Male','Female','Other'].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Blood Group</label>
              <select className="input-field" value={form.bloodGroup} onChange={set('bloodGroup')}>
                <option value="">Select</option>
                {BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Height (cm)</label>
              <input type="number" className="input-field" value={form.height} onChange={set('height')} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Weight (kg)</label>
              <input type="number" className="input-field" value={form.weight} onChange={set('weight')} />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="card">
          <h3 className="font-bold text-slate-800 font-display mb-4">Address</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {['city','state','country'].map(f => (
              <div key={f} className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 capitalize">{f}</label>
                <input className="input-field" value={form.address[f] || ''} onChange={setAddr(f)} />
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="card">
          <h3 className="font-bold text-slate-800 font-display mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[['name','Name'],['relationship','Relationship'],['phone','Phone']].map(([f,l]) => (
              <div key={f} className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">{l}</label>
                <input className="input-field" value={form.emergencyContact[f] || ''} onChange={setEmerg(f)} />
              </div>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div className="card">
          <h3 className="font-bold text-slate-800 font-display mb-4">Allergies</h3>
          <div className="flex gap-2 mb-3">
            <input className="input-field flex-1" placeholder="Add allergy..." value={newAllergy}
              onChange={e => setNewAllergy(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAllergy())} />
            <button type="button" onClick={addAllergy} className="btn-primary px-4 py-2">
              <FiPlus size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.allergies.map((a, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                {a}
                <button type="button" onClick={() => removeAllergy(i)} className="hover:text-red-800"><FiTrash2 size={12} /></button>
              </span>
            ))}
            {form.allergies.length === 0 && <p className="text-slate-400 text-sm">No allergies listed</p>}
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
          <FiSave size={16} />
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </DashboardLayout>
  );
}
