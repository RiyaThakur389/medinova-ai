import { useState } from 'react';
import { FiMenu, FiBell, FiSearch } from 'react-icons/fi';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-mesh overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top bar */}
        <header className="glass border-b border-white/30 px-4 lg:px-6 py-4 flex items-center gap-4 flex-shrink-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <FiMenu size={20} />
          </button>

          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white font-display">{title}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex items-center gap-2 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl px-3 py-2 w-48">
            <FiSearch className="text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm outline-none text-slate-600 dark:text-slate-300 w-full placeholder:text-slate-400"
            />
          </div>

          {/* Notification bell */}
          <button className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <FiBell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Avatar */}
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=1d4ed8&color=fff&bold=true&size=64`}
            alt={user?.name}
            className="w-9 h-9 rounded-full ring-2 ring-blue-600/30 cursor-pointer"
          />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
