// src/pages/Companies.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Building2, MapPin, Users, Calendar, Globe } from 'lucide-react';
import { companyApi } from '../services/api';
import { useCompany } from '../context/CompanyContext';
import { useToast } from '../context/ToastContext';
import { LoadingState, PageHeader, Card, Btn } from '../components/ui';

const colorFor = (id) => {
  const colors = ['bg-emerald-500','bg-sky-500','bg-violet-500','bg-amber-500','bg-rose-500','bg-teal-500','bg-orange-500','bg-indigo-500'];
  return colors[(id?.charCodeAt(0) || 0) % colors.length];
};
const initials = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

export default function Companies() {
  const { companies, activeCompany, switchCompany, removeCompany, loading } = useCompany();
  const toast    = useToast();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (company) => {
    if (!confirm(`Delete "${company.businessName}"? All emission data for this company will be removed.`)) return;
    setDeleting(company.id);
    try {
      await companyApi.remove(company.id);
      removeCompany(company.id);
      toast.success(`"${company.businessName}" deleted.`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <LoadingState message="Loading companies…" />;

  return (
    <div>
      <PageHeader
        title="My Companies"
        subtitle="Manage all your company profiles. Switch between them to view separate data."
        action={
          <Btn variant="primary" onClick={() => navigate('/dashboard/companies/new')}>
            <Plus className="w-4 h-4" /> Add Company
          </Btn>
        }
      />

      {companies.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center py-16 gap-4 text-center">
            <div className="w-16 h-16 bg-leaf-100 rounded-2xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-leaf-600" />
            </div>
            <h3 className="font-display font-bold text-slate-800 text-lg">No Companies Yet</h3>
            <p className="text-slate-500 text-sm max-w-sm">Create your first company profile to start tracking carbon emissions.</p>
            <Btn variant="primary" onClick={() => navigate('/dashboard/companies/new')}>
              <Plus className="w-4 h-4" /> Create First Company
            </Btn>
          </div>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {companies.map((company) => (
            <div
              key={company.id}
              className={`bg-white rounded-2xl border-2 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                activeCompany?.id === company.id
                  ? 'border-leaf-400 shadow-leaf-100'
                  : 'border-slate-100'
              }`}
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-xl ${colorFor(company.id)} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                    {initials(company.businessName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-slate-900 truncate">{company.businessName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{company.industryType?.replace(/_/g, ' ')}</p>
                  </div>
                  {activeCompany?.id === company.id && (
                    <span className="shrink-0 text-[10px] font-bold text-leaf-700 bg-leaf-50 border border-leaf-200 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1.5 mb-4">
                  {company.location && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{company.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    <span>{company.numberOfEmployees || 1} employees</span>
                  </div>
                  {company.yearEstablished && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>Est. {company.yearEstablished}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Globe className="w-3.5 h-3.5 shrink-0" />
                    <span className="capitalize">{company.country?.replace(/([A-Z])/g, ' $1')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  {activeCompany?.id !== company.id && (
                    <button
                      onClick={() => switchCompany(company)}
                      className="flex-1 text-xs font-bold text-leaf-700 bg-leaf-50 hover:bg-leaf-100 border border-leaf-200 py-2 rounded-lg transition-colors"
                    >
                      Switch to this
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/dashboard/companies/${company.id}`)}
                    className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(company)}
                    disabled={deleting === company.id}
                    className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
