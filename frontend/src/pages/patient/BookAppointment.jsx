import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { FiSearch, FiStar, FiCalendar, FiClock } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '../../utils/helpers';

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [type, setType] = useState('Consultation');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    api.get('/doctors', { params: { search, limit: 20 } })
      .then(res => setDoctors(res.data.doctors))
      .catch(() => toast.error('Failed to load doctors'))
      .finally(() => setLoading(false));
  }, [search]);

  const loadSlots = async (doctorId, date) => {
    if (!doctorId || !date) return;
    setSlotsLoading(true);
    try {
      const { data } = await api.get(`/appointments/slots/${doctorId}`, { params: { date } });
      setSlots(data.available);
    } catch { toast.error('Failed to load slots'); }
    finally { setSlotsLoading(false); }
  };

  const handleDoctorSelect = (doc) => {
    setSelectedDoctor(doc);
    setSelectedDate('');
    setSelectedSlot('');
    setSlots([]);
    setStep(2);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot('');
    if (selectedDoctor) loadSlots(selectedDoctor._id, date);
  };

  const handleBook = async () => {
    if (!selectedSlot) return toast.error('Please select a time slot');
    setBookingLoading(true);
    try {
      await api.post('/appointments', {
        doctorId: selectedDoctor._id,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot,
        type, symptoms
      });
      toast.success('Appointment booked successfully! 🎉');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setBookingLoading(false); }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <DashboardLayout title="Book Appointment">
      <div className="max-w-4xl space-y-6">
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= s ? 'text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}
                style={step >= s ? { background: 'linear-gradient(135deg,#1d4ed8,#0d9488)' } : {}}>
                {s}
              </div>
              {s < 3 && <div className={`h-0.5 w-12 transition-all ${step > s ? 'bg-blue-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
          <span className="text-sm text-slate-500 ml-2">
            {step === 1 ? 'Select Doctor' : step === 2 ? 'Choose Date & Time' : 'Confirmed!'}
          </span>
        </div>

        {/* Step 1: Select doctor */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="relative max-w-sm">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input className="input-field pl-10" placeholder="Search by name or specialization..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => <div key={i} className="skeleton rounded-2xl h-36" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {doctors.map(doc => (
                  <button key={doc._id} onClick={() => handleDoctorSelect(doc)}
                    className="card text-left hover:shadow-xl hover:scale-[1.01] transition-all border-2 border-transparent hover:border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                      <img src={getAvatarUrl(doc.user?.avatar, doc.user?.name)} className="w-12 h-12 rounded-xl" alt="" />
                      <div>
                        <p className="font-bold text-slate-800">{doc.user?.name}</p>
                        <p className="text-blue-600 text-xs font-semibold">{doc.specialization}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-amber-500">
                        <FiStar size={12} fill="currentColor" />
                        <span className="text-slate-600 text-xs font-medium">{doc.rating?.average?.toFixed(1) || '0.0'} ({doc.experience} yrs exp)</span>
                      </div>
                      <span className="font-bold text-slate-700">₹{doc.consultationFee}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Date & Slot */}
        {step === 2 && selectedDoctor && (
          <div className="space-y-5">
            <div className="card flex items-center gap-4">
              <img src={getAvatarUrl(selectedDoctor.user?.avatar, selectedDoctor.user?.name)} className="w-12 h-12 rounded-xl" alt="" />
              <div>
                <p className="font-bold text-slate-800">{selectedDoctor.user?.name}</p>
                <p className="text-blue-600 text-sm">{selectedDoctor.specialization}</p>
              </div>
              <button onClick={() => setStep(1)} className="ml-auto text-slate-400 hover:text-slate-600 text-sm">Change</button>
            </div>

            <div className="card">
              <h3 className="font-bold text-slate-800 font-display mb-4 flex items-center gap-2">
                <FiCalendar className="text-blue-600" /> Select Date
              </h3>
              <input type="date" className="input-field max-w-xs" min={minDate} value={selectedDate}
                onChange={e => handleDateChange(e.target.value)} />
            </div>

            {selectedDate && (
              <div className="card">
                <h3 className="font-bold text-slate-800 font-display mb-4 flex items-center gap-2">
                  <FiClock className="text-blue-600" /> Available Slots
                </h3>
                {slotsLoading ? (
                  <div className="flex gap-2 flex-wrap">{[...Array(8)].map((_, i) => <div key={i} className="skeleton h-10 w-24 rounded-xl" />)}</div>
                ) : slots.length === 0 ? (
                  <p className="text-slate-400">No slots available for this date</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {slots.map(slot => (
                      <button key={slot} onClick={() => setSelectedSlot(slot)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          selectedSlot === slot
                            ? 'text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                        style={selectedSlot === slot ? { background: 'linear-gradient(135deg,#1d4ed8,#0d9488)' } : {}}>
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="card">
              <h3 className="font-bold text-slate-800 font-display mb-4">Appointment Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Type</label>
                  <select className="input-field" value={type} onChange={e => setType(e.target.value)}>
                    {['Consultation','Follow-up','Check-up','Emergency'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Symptoms (optional)</label>
                  <textarea className="input-field resize-none" rows={3} value={symptoms}
                    onChange={e => setSymptoms(e.target.value)} placeholder="Describe your symptoms..." />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
              <button onClick={handleBook} disabled={bookingLoading || !selectedSlot}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
                {bookingLoading ? 'Booking...' : `Confirm Booking — ₹${selectedDoctor.consultationFee}`}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="card text-center py-16">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>
              <span className="text-white text-4xl">✓</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 font-display mb-2">Appointment Booked!</h3>
            <p className="text-slate-500 mb-1">Your appointment with <strong>{selectedDoctor?.user?.name}</strong></p>
            <p className="text-slate-500 mb-6">on <strong>{selectedDate}</strong> at <strong>{selectedSlot}</strong></p>
            <p className="text-sm text-slate-400 mb-6">Status: <span className="text-amber-600 font-semibold">Pending Doctor Approval</span></p>
            <div className="flex gap-3 max-w-xs mx-auto">
              <button onClick={() => { setStep(1); setSelectedDoctor(null); setSelectedDate(''); setSelectedSlot(''); }}
                className="btn-secondary flex-1">Book Another</button>
              <a href="/patient/appointments" className="btn-primary flex-1 text-center">My Appointments</a>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
