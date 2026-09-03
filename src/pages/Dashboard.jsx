// src/pages/Dashboard.jsx
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar         from '../components/Sidebar';
import DashboardPanel  from './DashboardPanel';
import Companies       from './Companies';
import CompanyForm     from './CompanyForm';
import DataEntry       from './DataEntry';
import Reports         from './Reports';
import AccountSettings from './AccountSettings';
import { useCompany }  from '../context/CompanyContext';
import SEO             from '../components/SEO';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { activeCompany } = useCompany();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Authenticated app area — never indexed */}
      <SEO path="/dashboard" title="Dashboard" noindex />
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50 h-full w-64">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 bg-white border-b border-slate-200 px-4 py-3 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-500 hover:text-slate-800 p-1">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display font-bold text-slate-900">EcoTrack</span>
          {activeCompany && (
            <span className="ml-auto text-xs font-bold text-leaf-700 bg-leaf-50 px-2 py-1 rounded-lg truncate max-w-[140px]">
              {activeCompany.businessName}
            </span>
          )}
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto page-enter">
            <Routes>
              <Route index                   element={<DashboardPanel />} />
              <Route path="companies"        element={<Companies />} />
              <Route path="companies/new"    element={<CompanyForm />} />
              <Route path="companies/:id"    element={<CompanyForm />} />
              <Route path="data"             element={<DataEntry />} />
              <Route path="reports"          element={<Reports />} />
              <Route path="settings"         element={<AccountSettings />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
