import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff, FiHeart, FiArrowRight } from 'react-icons/fi';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.user.name}! 👋`);
      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'doctor') navigate('/doctor');
      else navigate('/patient');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role) => {
    const creds = {
      admin:   { email: 'admin@hospital.com',       password: 'password123' },
      doctor:  { email: 'arjun.sharma@hospital.com', password: 'password123' },
      patient: { email: 'amit.kumar@gmail.com',       password: 'password123' },
    };
    setForm(creds[role]);
    setLoading(true);
    try {
      const data = await login(creds[role].email, creds[role].password);
      toast.success(`Logged in as ${role}`);
      navigate(`/${data.user.role}`);
    } catch {
      toast.error('Demo login failed — run the seed script first');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0f4c75 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute top-20 -left-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/05 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1d4ed8, #0d9488)' }}>
            <FiHeart className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-white font-bold text-2xl font-display">MediNova AI</h1>
            <p className="text-slate-400 text-sm">Hospital Management System</p>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-white text-4xl font-bold font-display leading-tight">
            Healthcare<br />reimagined with<br />
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(90deg, #60a5fa, #2dd4bf)' }}>
              AI Intelligence
            </span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            Streamline patient care, manage appointments, and leverage AI for smarter healthcare decisions — all in one place.
          </p>

          <div className="grid grid-cols-3 gap-4">
            {[['500+', 'Doctors'], ['10K+', 'Patients'], ['99.9%', 'Uptime']].map(([val, lbl]) => (
              <div key={lbl} className="text-center p-4 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-white font-bold text-xl font-display">{val}</p>
                <p className="text-slate-400 text-xs">{lbl}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-slate-500 text-sm">© 2024 MediNova AI. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6 animate-slide-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #0d9488)' }}>
              <FiHeart className="text-white" />
            </div>
            <h1 className="font-bold text-xl text-slate-800 font-display">MediNova AI</h1>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white font-display">Welcome back</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Sign in to your account</p>
          </div>

          {/* Demo buttons */}
          <div className="flex gap-2">
            {['admin', 'doctor', 'patient'].map(role => (
              <button key={role} onClick={() => demoLogin(role)}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all hover:scale-105 capitalize"
                style={{ borderColor: '#e2e8f0', color: '#64748b', background: 'rgba(248,250,252,0.8)' }}>
                Demo {role}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-slate-400 text-xs font-medium">or sign in manually</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Email address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-10 pr-10"
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><span>Sign In</span><FiArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
