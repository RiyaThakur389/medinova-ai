import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiUsers, FiCalendar, FiFileText, FiActivity,
  FiLogOut, FiMenu, FiX, FiCpu, FiHeart, FiBarChart2,
  FiUserPlus, FiClipboard, FiMoon, FiSun
} from 'react-icons/fi';
import { useState } from 'react';

const navItems = {
  admin: [
    { path: '/admin', icon: FiHome, label: 'Dashboard', end: true },
    { path: '/admin/doctors', icon: FiUsers, label: 'Doctors' },
    { path: '/admin/patients', icon: FiHeart, label: 'Patients' },
    { path: '/admin/appointments', icon: FiCalendar, label: 'Appointments' },
    { path: '/admin/reports', icon: FiBarChart2, label: 'Reports' },
  ],
  doctor: [
    { path: '/doctor', icon: FiHome, label: 'Dashboard', end: true },
    { path: '/doctor/appointments', icon: FiCalendar, label: 'Appointments' },
    { path: '/doctor/patients', icon: FiUsers, label: 'My Patients' },
    { path: '/doctor/prescriptions', icon: FiFileText, label: 'Prescriptions' },
    { path: '/doctor/ai-assist', icon: FiCpu, label: 'AI Assistant' },
  ],
  patient: [
    { path: '/patient', icon: FiHome, label: 'Dashboard', end: true },
    { path: '/patient/book', icon: FiUserPlus, label: 'Book Appointment' },
    { path: '/patient/appointments', icon: FiCalendar, label: 'My Appointments' },
    { path: '/patient/prescriptions', icon: FiClipboard, label: 'Prescriptions' },
    { path: '/patient/symptoms', icon: FiActivity, label: 'Symptom Checker' },
    { path: '/patient/chat', icon: FiCpu, label: 'AI Health Chat' },
    { path: '/patient/profile', icon: FiUsers, label: 'My Profile' },
  ]
};

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();
  const items = navItems[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 sidebar z-30 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative lg:z-auto
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #0d9488)' }}>
              <FiHeart className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg font-display">MediNova</h1>
              <p className="text-slate-400 text-xs font-medium">AI Hospital System</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/5">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=1d4ed8&color=fff&bold=true`}
              alt={user?.name}
              className="w-9 h-9 rounded-full"
            />
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-slate-400 text-xs capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {items.map(({ path, icon: Icon, label, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <button
            onClick={toggleDarkMode}
            className="sidebar-item w-full"
          >
            {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="sidebar-item w-full text-red-400 hover:text-red-300"
          >
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
