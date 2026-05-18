import { useNavigate } from 'react-router-dom';
import { FiHeart, FiShield, FiCpu, FiCalendar, FiUsers, FiFileText, FiArrowRight, FiStar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) navigate(`/${user.role}`);
    else navigate('/login');
  };

  const features = [
    { icon: FiCalendar, title: 'Smart Scheduling', desc: 'Book appointments with real-time slot availability and instant confirmations.', color: 'from-blue-500 to-blue-600' },
    { icon: FiCpu, title: 'AI Symptom Checker', desc: 'Describe your symptoms and get AI-powered health insights instantly.', color: 'from-purple-500 to-purple-600' },
    { icon: FiFileText, title: 'Digital Prescriptions', desc: 'Doctors create digital prescriptions downloadable as PDF anytime.', color: 'from-teal-500 to-teal-600' },
    { icon: FiShield, title: 'Secure & Private', desc: 'Enterprise-grade security with JWT auth and encrypted patient data.', color: 'from-emerald-500 to-emerald-600' },
    { icon: FiUsers, title: 'Role-Based Access', desc: 'Tailored dashboards for Admins, Doctors, and Patients.', color: 'from-orange-500 to-orange-600' },
    { icon: FiHeart, title: '24/7 AI Chat', desc: 'Get answers to health questions any time with our AI health assistant.', color: 'from-pink-500 to-pink-600' },
  ];

  const stats = [
    { value: '500+', label: 'Doctors' },
    { value: '10,000+', label: 'Patients' },
    { value: '50,000+', label: 'Appointments' },
    { value: '99.9%', label: 'Uptime' },
  ];

  const testimonials = [
    { name: 'Dr. Arjun Sharma', role: 'Cardiologist', text: 'MediNova AI has transformed how I manage appointments. The AI prescription assistant saves me 30 minutes daily.', rating: 5 },
    { name: 'Sunita Devi', role: 'Patient', text: 'Booking appointments is so easy now. I love being able to download my prescriptions as PDFs whenever I need them.', rating: 5 },
    { name: 'Dr. Priya Mehta', role: 'Neurologist', text: 'The analytics dashboard gives me clear insights into my patient load. The UI is beautiful and intuitive.', rating: 5 },
  ];

  return (
    <div className="min-h-screen bg-mesh font-sans">
      {/* Nav */}
      <nav className="glass sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#1d4ed8,#0d9488)' }}>
              <FiHeart className="text-white" size={18} />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-xl font-display">MediNova AI</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="btn-secondary text-sm py-2 px-5">Sign In</button>
            <button onClick={() => navigate('/register')} className="btn-primary text-sm py-2 px-5">Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-6 border border-blue-100">
          <FiCpu size={14} />
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 font-display leading-tight mb-6">
          Healthcare<br />
          <span className="text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(135deg,#1d4ed8,#0d9488)' }}>
            Reimagined
          </span>
          <br />with AI
        </h1>

        <p className="text-slate-500 text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
          The complete hospital management system with AI-powered symptom checking, smart scheduling, digital prescriptions, and a 24/7 health assistant.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={handleGetStarted}
            className="btn-primary flex items-center justify-center gap-2 text-base px-8 py-4">
            <span>Get Started Free</span>
            <FiArrowRight size={18} />
          </button>
          <button onClick={() => navigate('/login')}
            className="btn-secondary flex items-center justify-center gap-2 text-base px-8 py-4">
            View Demo
          </button>
        </div>

        {/* Demo credentials */}
       
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-slate-100" style={{ background: 'linear-gradient(135deg,rgba(29,78,216,0.03),rgba(13,148,136,0.03))' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-4xl font-bold text-slate-800 font-display"
                  style={{ backgroundImage: 'linear-gradient(135deg,#1d4ed8,#0d9488)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {value}
                </p>
                <p className="text-slate-500 mt-1 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-slate-900 font-display mb-4">Everything you need</h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">A complete healthcare management platform with AI at its core</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="card group hover:scale-[1.02] transition-all">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="text-white" size={22} />
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Role showcase */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg,#0f172a,#1e1b4b)' }}>
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white font-display mb-4">Built for everyone</h2>
          <p className="text-slate-400 mb-14">Three tailored experiences for every role in your hospital</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { role: 'Admin', emoji: '🏥', perks: ['Full dashboard analytics', 'Manage doctors & patients', 'Appointment oversight', 'Revenue reports'], color: 'from-blue-600 to-blue-800' },
              { role: 'Doctor', emoji: '👨‍⚕️', perks: ['View patient appointments', 'Write digital prescriptions', 'AI prescription assistant', 'Patient history access'], color: 'from-teal-600 to-teal-800' },
              { role: 'Patient', emoji: '❤️', perks: ['Book appointments online', 'AI symptom checker', '24/7 health chatbot', 'Download prescriptions'], color: 'from-purple-600 to-purple-800' },
            ].map(({ role, emoji, perks, color }) => (
              <div key={role} className={`p-6 rounded-2xl bg-gradient-to-br ${color} text-left`}>
                <div className="text-4xl mb-3">{emoji}</div>
                <h3 className="text-white font-bold text-xl font-display mb-4">{role} Panel</h3>
                <ul className="space-y-2">
                  {perks.map(perk => (
                    <li key={perk} className="flex items-center gap-2 text-white/80 text-sm">
                      <span className="text-emerald-300">✓</span> {perk}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-slate-900 font-display mb-4">Trusted by healthcare professionals</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(({ name, role, text, rating }) => (
            <div key={name} className="card">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(rating)].map((_, i) => (
                  <FiStar key={i} className="text-amber-400" size={16} fill="currentColor" />
                ))}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">"{text}"</p>
              <div className="flex items-center gap-3">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1d4ed8&color=fff&bold=true`}
                  className="w-10 h-10 rounded-full" alt={name} />
                <div>
                  <p className="font-bold text-slate-800 text-sm">{name}</p>
                  <p className="text-slate-400 text-xs">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center"
        style={{ background: 'linear-gradient(135deg,#1d4ed8,#0d9488)' }}>
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-white font-display mb-4">Ready to transform your hospital?</h2>
          <p className="text-white/80 mb-8">Join thousands of healthcare professionals using MediNova AI</p>
          <button onClick={() => navigate('/register')}
            className="bg-white text-blue-700 font-bold px-10 py-4 rounded-2xl hover:shadow-2xl hover:-translate-y-1 transition-all text-lg">
            Start for Free →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-slate-100">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#1d4ed8,#0d9488)' }}>
            <FiHeart className="text-white" size={13} />
          </div>
          <span className="font-bold text-slate-700 font-display">MediNova AI</span>
        </div>
        <p className="text-slate-400 text-sm">© 2024 MediNova AI. Built with MERN Stack + Groq AI</p>
      </footer>
    </div>
  );
}
