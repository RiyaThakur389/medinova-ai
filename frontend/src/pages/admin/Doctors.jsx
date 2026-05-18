import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { StatusBadge, Modal, InputField, SelectField, Pagination } from '../../components/common/UI';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiStar } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '../../utils/helpers';

const SPECIALIZATIONS = ['Cardiologist','Neurologist','Dentist','Dermatologist','Orthopedist',
  'Pediatrician','Gynecologist','Ophthalmologist','Psychiatrist','General Physician','ENT Specialist'];

const emptyForm = { name:'', email:'', password:'', phone:'', specialization:'Cardiologist',
  licenseNumber:'', experience:'', department:'', bio:'', consultationFee:'' };

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editDoctor, setEditDoctor] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/doctors', { params: { search, page, limit: 8 } });
      setDoctors(data.doctors);
      setTotalPages(data.pages);
    } catch { toast.error('Failed to load doctors'); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const openCreate = () => { setEditDoctor(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (doc) => {
    setEditDoctor(doc);
    setForm({
      name: doc.user?.name || '', email: doc.user?.email || '',
      phone: doc.user?.phone || '', password: '',
      specialization: doc.specialization, licenseNumber: doc.licenseNumber,
      experience: doc.experience, department: doc.department || '',
      bio: doc.bio || '', consultationFee: doc.consultationFee
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editDoctor) {
        await api.put(`/doctors/${editDoctor._id}`, form);
        toast.success('Doctor updated');
      } else {
        await api.post('/doctors', form);
        toast.success('Doctor created');
      }
      setModalOpen(false);
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving doctor');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this doctor?')) return;
    try {
      await api.delete(`/doctors/${id}`);
      toast.success('Doctor removed');
      fetchDoctors();
    } catch { toast.error('Delete failed'); }
  };

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  return (
    <DashboardLayout title="Manage Doctors">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-xs">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input className="input-field pl-10" placeholder="Search doctors..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <FiPlus size={16} /><span>Add Doctor</span>
          </button>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-left">
                  <th className="px-5 py-3.5 font-medium">Doctor</th>
                  <th className="px-5 py-3.5 font-medium hidden md:table-cell">Specialization</th>
                  <th className="px-5 py-3.5 font-medium hidden lg:table-cell">Experience</th>
                  <th className="px-5 py-3.5 font-medium hidden lg:table-cell">Fee</th>
                  <th className="px-5 py-3.5 font-medium hidden sm:table-cell">Rating</th>
                  <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-5 py-3"><div className="skeleton h-12 rounded-lg" /></td></tr>
                  ))
                ) : doctors.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-16 text-slate-400">No doctors found</td></tr>
                ) : doctors.map(doc => (
                  <tr key={doc._id} className="table-row">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img src={getAvatarUrl(doc.user?.avatar, doc.user?.name)} className="w-9 h-9 rounded-full" alt="" />
                        <div>
                          <p className="font-semibold text-slate-800">{doc.user?.name}</p>
                          <p className="text-slate-400 text-xs">{doc.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">{doc.specialization}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 hidden lg:table-cell">{doc.experience} yrs</td>
                    <td className="px-5 py-3.5 text-slate-600 font-medium hidden lg:table-cell">₹{doc.consultationFee}</td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <div className="flex items-center gap-1 text-amber-500">
                        <FiStar size={13} fill="currentColor" />
                        <span className="text-xs font-medium text-slate-600">{doc.rating?.average?.toFixed(1) || '0.0'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(doc)} className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors">
                          <FiEdit2 size={15} />
                        </button>
                        <button onClick={() => handleDelete(doc._id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Create / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editDoctor ? 'Edit Doctor' : 'Add New Doctor'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Full Name" value={form.name} onChange={set('name')} placeholder="Dr. John Smith" required />
            <InputField label="Email" type="email" value={form.email} onChange={set('email')} placeholder="doctor@hospital.com" required={!editDoctor} disabled={!!editDoctor} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Phone" value={form.phone} onChange={set('phone')} placeholder="+91 9876543210" />
            {!editDoctor && <InputField label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" required />}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Specialization" value={form.specialization} onChange={set('specialization')}>
              {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </SelectField>
            <InputField label="License Number" value={form.licenseNumber} onChange={set('licenseNumber')} placeholder="MCI-XXXX-001" required={!editDoctor} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <InputField label="Experience (years)" type="number" value={form.experience} onChange={set('experience')} placeholder="5" />
            <InputField label="Department" value={form.department} onChange={set('department')} placeholder="Cardiology" />
            <InputField label="Consultation Fee (₹)" type="number" value={form.consultationFee} onChange={set('consultationFee')} placeholder="500" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Bio</label>
            <textarea className="input-field resize-none" rows={3} value={form.bio} onChange={set('bio')} placeholder="Brief bio about the doctor..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : editDoctor ? 'Update Doctor' : 'Create Doctor'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
