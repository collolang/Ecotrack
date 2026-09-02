// src/components/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { Leaf, LayoutDashboard, Building2, Database, FileText, LogOut, X, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import { useToast } from '../context/ToastContext';
import CompanySwitcher from './CompanySwitcher';

const navItems = [
  { to: '/dashboard',           label: 'Dashboard',     icon: LayoutDashboard, end: true },
  { to: '/dashboard/companies', label: 'My Companies',  icon: Briefcase },
  { to: '/dashboard/data',      label: 'Data Entry',    icon: Database },
  { to: '/dashboard/reports',   label: 'Reports',       icon: FileText },
];

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const { activeCompany } = useCompany();
  const toast    = useToast();
  const navigate = useNavigate();

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'U'
    : 'U';
  const fullName = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'User' : 'User';

  async function handleLogout() {
    await logout();
    toast.success('Logged out successfully.');
    navigate('/');
  }

  return (
    <aside className="flex flex-col h-full bg-white border-r border-slate-200 w-64 shrink-0">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-leaf-600 rounded-lg flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-slate-900">EcoTrack</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Company switcher */}
      <div className="px-3 pt-4 pb-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Active Company</p>
        <CompanySwitcher onClose={onClose} />
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto scrollbar-thin">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-4 sm:px-5 sm:py-3 text-base sm:text-sm font-semibold transition-all duration-150 border-r-4 ${
                isActive
                  ? 'bg-leaf-50 text-leaf-700 border-leaf-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border-transparent'
              }`
            }
          >
            <Icon className="w-[18px] h-[18px] shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Active company badge */}
      {activeCompany && (
        <div className="mx-3 mb-2 px-3 py-2 bg-leaf-50 border border-leaf-200 rounded-xl">
          <p className="text-[10px] font-bold text-leaf-700 uppercase tracking-wider">Viewing data for</p>
          <p className="text-xs font-bold text-leaf-900 truncate mt-0.5">{activeCompany.businessName}</p>
        </div>
      )}

      {/* User chip */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-leaf-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{fullName}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  );
}
