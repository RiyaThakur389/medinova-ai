// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon: Icon, gradient, change }) {
  return (
    <div className="stat-card text-white relative overflow-hidden" style={{ background: gradient }}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/70 text-sm font-medium">{label}</p>
          <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
            <Icon size={20} className="text-white" />
          </div>
        </div>
        <p className="text-3xl font-bold font-display">{value}</p>
        {change !== undefined && (
          <p className="text-white/70 text-xs mt-1">
            <span className={change >= 0 ? 'text-emerald-300' : 'text-red-300'}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
            </span>
            {' '}from last month
          </p>
        )}
      </div>
    </div>
  );
}

// ── Loading Skeleton ──────────────────────────────────────────────────────────
export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="card space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    Pending:   'bg-amber-100 text-amber-700',
    Approved:  'bg-emerald-100 text-emerald-700',
    Rejected:  'bg-red-100 text-red-700',
    Completed: 'bg-blue-100 text-blue-700',
    Cancelled: 'bg-gray-100 text-gray-600',
    'No-Show': 'bg-orange-100 text-orange-700',
    Active:    'bg-emerald-100 text-emerald-700',
    Resolved:  'bg-blue-100 text-blue-700',
    Chronic:   'bg-purple-100 text-purple-700',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ name, avatar, size = 'md' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base', xl: 'w-20 h-20 text-lg' };
  const src = avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=1d4ed8&color=fff&bold=true`;
  return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover`} />;
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
        <Icon size={28} className="text-blue-400" />
      </div>
      <h3 className="text-slate-700 font-semibold text-lg mb-1">{title}</h3>
      <p className="text-slate-400 text-sm mb-4 max-w-xs">{description}</p>
      {action}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative glass rounded-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 font-display">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ── Input Field ───────────────────────────────────────────────────────────────
export function InputField({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <input className={`input-field ${error ? 'border-red-400 focus:border-red-400' : ''} ${className}`} {...props} />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}

// ── Select Field ──────────────────────────────────────────────────────────────
export function SelectField({ label, error, children, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <select className={`input-field ${error ? 'border-red-400' : ''} ${className}`} {...props}>
        {children}
      </select>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ← Prev
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
            page === currentPage
              ? 'text-white shadow-lg'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          style={page === currentPage ? { background: 'linear-gradient(135deg, #1d4ed8, #0d9488)' } : {}}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next →
      </button>
    </div>
  );
}
