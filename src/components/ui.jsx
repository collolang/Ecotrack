// src/components/ui.jsx
// Shared reusable UI primitives

export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-5 h-5 border-2', md: 'w-9 h-9 border-3', lg: 'w-12 h-12 border-4' };
  return <div className={`${sizes[size]} border-slate-200 border-t-leaf-600 rounded-full animate-spin ${className}`} />;
}

export function LoadingState({ message = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Spinner size="lg" />
      <p className="text-slate-500 text-sm font-medium">{message}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-2xl">⚠️</div>
      <p className="text-red-700 font-semibold text-center max-w-sm">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition-colors">
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="text-4xl mb-1">{icon}</div>
      <h3 className="font-display font-bold text-slate-800 text-lg">{title}</h3>
      {description && <p className="text-slate-500 text-sm max-w-sm">{description}</p>}
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">{title}</h1> 
        {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Card({ children, className = '', padding = true }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function Badge({ children, variant = 'gray' }) {
  const variants = {
    green:  'bg-emerald-100 text-emerald-800',
    blue:   'bg-sky-100 text-sky-800',
    amber:  'bg-amber-100 text-amber-800',
    red:    'bg-red-100 text-red-800',
    gray:   'bg-slate-100 text-slate-700',
    purple: 'bg-purple-100 text-purple-800',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm sm:text-xs sm:px-2.5 sm:py-0.5 font-bold ${variants[variant] || variants.gray}`}>
      {children}
    </span>
  );
}

export function ScoreBadge({ score }) {
  const styles = {
    A: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    B: 'bg-sky-100 text-sky-800 border-sky-300',
    C: 'bg-amber-100 text-amber-800 border-amber-300',
    D: 'bg-red-100 text-red-800 border-red-300',
  };
  return (
      <span className={`inline-flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 rounded-lg text-base sm:text-sm font-extrabold border ${styles[score] || styles.C}`}>
      {score}
    </span>
  );
}

export function SectionTitle({ children, icon: Icon }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      {Icon && <Icon className="w-5 h-5 sm:w-4 sm:h-4 text-leaf-600" />}
      <h3 className="font-display font-bold text-slate-800">{children}</h3>
    </div>
  );
}

export function FieldLabel({ children, required }) {
  return (
    <label className="block text-sm sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-4 py-3.5 border border-slate-200 rounded-xl text-base sm:px-3.5 sm:py-2.5 sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:border-transparent transition-all placeholder-slate-400 ${className}`}
      {...props}
    />
  );
}

export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`w-full px-4 py-3.5 border border-slate-200 rounded-xl text-base sm:px-3.5 sm:py-2.5 sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:border-transparent transition-all bg-white ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full px-4 py-3.5 border border-slate-200 rounded-xl text-base sm:px-3.5 sm:py-2.5 sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:border-transparent transition-all placeholder-slate-400 resize-none ${className}`}
      {...props}
    />
  );
}

export function Btn({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  const variants = {
    primary:   'bg-leaf-600 hover:bg-leaf-700 text-white shadow-sm hover:shadow-md',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200',
    danger:    'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200',
    ghost:     'bg-transparent hover:bg-slate-100 text-slate-600',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3 text-base' }; // Desktop unchanged, mobile via responsive
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-xl font-bold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
