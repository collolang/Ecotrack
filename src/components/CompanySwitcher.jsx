// src/components/CompanySwitcher.jsx
import { useState, useRef, useEffect } from 'react';
import { Building2, ChevronDown, Plus, Check } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { useNavigate } from 'react-router-dom';

export default function CompanySwitcher({ onClose }) {
  const { companies, activeCompany, switchCompany } = useCompany();
  const [open, setOpen] = useState(false);
  const ref  = useRef(null);
  const nav  = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  const colors = [
    'bg-emerald-500', 'bg-sky-500', 'bg-violet-500', 'bg-amber-500',
    'bg-rose-500', 'bg-teal-500', 'bg-orange-500', 'bg-indigo-500',
  ];
  const colorFor = (id) => colors[(id?.charCodeAt(0) || 0) % colors.length];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
              className="w-full flex items-center gap-3 px-4 py-3.5 sm:px-3 sm:py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-left"
      >
        {activeCompany ? (
          <>
            <div className={`w-7 h-7 rounded-lg ${colorFor(activeCompany.id)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
              {initials(activeCompany.businessName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-xs font-bold text-slate-800 truncate">{activeCompany.businessName}</p>
              <p className="text-xs sm:text-[10px] text-slate-400 truncate">{activeCompany.industryType?.replace(/_/g, ' ')}</p>
            </div>
          </>
        ) : (
          <>
            <Building2 className="w-5 h-5 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500 flex-1">No company selected</span>
          </>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
          {companies.length > 0 && (
            <div className="py-1 max-h-48 overflow-y-auto">
              {companies.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { switchCompany(c); setOpen(false); onClose?.(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className={`w-7 h-7 rounded-lg ${colorFor(c.id)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {initials(c.businessName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{c.businessName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{c.location || c.industryType?.replace(/_/g, ' ')}</p>
                  </div>
                  {activeCompany?.id === c.id && <Check className="w-3.5 h-3.5 text-leaf-600 shrink-0" />}
                </button>
              ))}
            </div>
          )}
          <div className="border-t border-slate-100 p-1.5">
            <button
              onClick={() => {
                setOpen(false);
                onClose?.();
                nav('/dashboard/companies/new');
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-leaf-50 text-leaf-700 transition-colors text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Company
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
