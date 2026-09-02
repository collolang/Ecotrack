// src/pages/Reports.jsx
import { useState, useEffect } from 'react';
import {
  FileText, Download, Building2, Calendar, Users,
  TrendingDown, AlertCircle, Clock, Plus, Printer,
} from 'lucide-react';
import { reportsApi } from '../services/api';
import { useCompany }  from '../context/CompanyContext';
import { useToast }    from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { openPDFPreview } from '../utils/pdfGenerator';
import { LoadingState, PageHeader, Card, Badge, SectionTitle, EmptyState, Btn } from '../components/ui';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const SCORE_STYLES = {
  A: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', label: 'Excellent' },
  B: { bg: 'bg-sky-100',     text: 'text-sky-800',     border: 'border-sky-300',     label: 'Good' },
  C: { bg: 'bg-amber-100',   text: 'text-amber-800',   border: 'border-amber-300',   label: 'Average' },
  D: { bg: 'bg-red-100',     text: 'text-red-800',     border: 'border-red-300',     label: 'Needs Work' },
};

const PRI_STYLES = {
  high:   'border-l-red-500   bg-red-50',
  medium: 'border-l-amber-500 bg-amber-50',
  low:    'border-l-leaf-500  bg-leaf-50',
};
const PRI_BADGE = { high: 'red', medium: 'amber', low: 'green' };
const DOT_COLORS = { electricity: '#10b981', transport: '#3b82f6', waste: '#f59e0b' };

export default function Reports() {
  const { activeCompany } = useCompany();
  const toast    = useToast();
  const navigate = useNavigate();
  const now      = new Date();

  const [month,    setMonth]    = useState(MONTH_NAMES[now.getMonth()]);
  const [year,     setYear]     = useState(now.getFullYear());
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [history,  setHistory]  = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [generating, setGenerating] = useState(false);

  const loadReport = async (m, y, cId) => {
    setLoading(true); setError(null); setData(null);
    try {
      const result = await reportsApi.generateReport(cId, m, y);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (cId) => {
    setLoadingHistory(true);
    try {
      const h = await reportsApi.getHistory(cId);
      setHistory(h);
    } catch {}
    finally { setLoadingHistory(false); }
  };

  useEffect(() => {
    if (!activeCompany) return;
    loadReport(month, year, activeCompany.id);
    loadHistory(activeCompany.id);
  }, [activeCompany?.id]);

  const handleSelect = (m, y) => {
    setMonth(m); setYear(y);
    if (activeCompany) loadReport(m, y, activeCompany.id);
  };

  const handlePDF = () => {
    if (!data) return;
    setGenerating(true);
    try {
      openPDFPreview(data);
      toast.success('PDF preview opened! Use Ctrl+P or the Print button to save as PDF.');
    } catch (err) {
      toast.error('Could not open PDF: ' + err.message);
    } finally {
      setTimeout(() => setGenerating(false), 800);
    }
  };

  // No company
  if (!activeCompany) {
    return (
      <div>
        <PageHeader title="Reports" subtitle="Generate carbon footprint reports" />
        <Card>
          <EmptyState
            icon="📄"
            title="No Company Selected"
            description="Please select or create a company profile to generate reports."
            action={<Btn variant="primary" onClick={() => navigate('/dashboard/companies/new')}><Plus className="w-4 h-4" /> Create Company</Btn>}
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle={<>Generating for <strong className="text-leaf-700">{activeCompany.businessName}</strong></>}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={month}
              onChange={e => handleSelect(e.target.value, year)}
              className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 bg-white"
            >
              {MONTH_NAMES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <input
              type="number" min="2020" max="2100" value={year}
              onChange={e => handleSelect(month, parseInt(e.target.value))}
              className="w-24 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 text-center"
            />
            <button
              onClick={handlePDF}
              disabled={!data || generating}
              className="flex items-center gap-2 bg-leaf-600 hover:bg-leaf-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5"
            >
              {generating
                ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Generating…</>
                : <><Printer className="w-4 h-4" /> Download PDF</>
              }
            </button>
          </div>
        }
      />

      <div className="grid xl:grid-cols-4 gap-6">
        {/* Main report */}
        <div className="xl:col-span-3">
          {loading && <LoadingState message="Generating report…" />}
          {error && !loading && (
            <Card>
              <div className="flex flex-col items-center py-10 gap-3">
                <div className="text-4xl">📭</div>
                <h3 className="font-display font-bold text-slate-800">No Data for this Period</h3>
                <p className="text-slate-500 text-sm text-center max-w-sm">{error}</p>
                <p className="text-slate-400 text-xs">Add emission data in the Data Entry tab first.</p>
                <Btn variant="primary" onClick={() => navigate('/dashboard/data')}>
                  <Plus className="w-4 h-4" /> Add Emission Data
                </Btn>
              </div>
            </Card>
          )}
          {!loading && !error && data && (
            <Card padding={false} className="overflow-hidden">
              {/* Header band */}
              <div className="bg-gradient-to-r from-leaf-600 to-sky-600 p-8 text-white flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold mb-1">EcoTrack Environmental Report</h2>
                  <p className="text-white/80">Carbon Footprint Analysis — {data.period}</p>
                </div>
                <FileText className="w-14 h-14 text-white/30" />
              </div>

              {/* Company info */}
              {data.company && (
                <div className="p-6 border-b border-slate-100">
                  <SectionTitle icon={Building2}>Company Information</SectionTitle>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Company Name', value: data.company.name },
                      { label: 'Industry',     value: data.company.industry?.replace(/_/g, ' ') },
                      { label: 'Location',     value: data.company.location || '—' },
                      { label: 'Employees',    value: data.company.employees },
                    ].map(f => (
                      <div key={f.label}>
                        <p className="text-xs text-slate-500 mb-0.5">{f.label}</p>
                        <p className="font-bold text-slate-900 text-sm">{f.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Emissions summary */}
              <div className="p-6 border-b border-slate-100">
                <SectionTitle>Emissions Summary</SectionTitle>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Score */}
                  <div className="bg-slate-50 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-slate-800 text-sm">Total Carbon Footprint</h4>
                      {data.greenScore?.score && (() => {
                        const s = SCORE_STYLES[data.greenScore.score] || {};
                        return (
                          <span className={`px-3 py-1 rounded-full text-sm font-bold border ${s.bg} ${s.text} ${s.border}`}>
                            Grade {data.greenScore.score} — {s.label}
                          </span>
                        );
                      })()}
                    </div>
                    <p className="font-display text-3xl font-extrabold text-slate-900 mb-1">
                      {data.emissions?.total?.amount ?? 0}
                      <span className="text-base font-normal text-slate-500 ml-2">kg CO₂e</span>
                    </p>
                    <p className="text-sm text-slate-500 mb-3">{data.greenScore?.description}</p>
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Users className="w-4 h-4" />
                      <span>{data.greenScore?.emissionsPerEmployee} kg CO₂e per employee</span>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-3">Emission Breakdown</h4>
                    <div className="space-y-2.5">
                      {data.emissions && Object.entries(data.emissions)
                        .filter(([k]) => k !== 'total')
                        .map(([cat, d]) => (
                          <div key={cat} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-2.5">
                              <div className="w-3 h-3 rounded-full" style={{ background: DOT_COLORS[cat] || '#94a3b8' }} />
                              <span className="font-semibold text-slate-800 text-sm capitalize">{cat}</span>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-slate-900 text-sm">{d.amount} {d.unit}</p>
                              {d.kwh    && <p className="text-xs text-slate-400">{d.kwh} kWh</p>}
                              {d.litres && <p className="text-xs text-slate-400">{d.litres}L {d.fuelType ?? ''}</p>}
                              {d.kg     && <p className="text-xs text-slate-400">{d.kg} kg ({d.type ?? ''})</p>}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {data.recommendations?.length > 0 && (
                <div className="p-6 border-b border-slate-100">
                  <SectionTitle icon={AlertCircle}>Recommendations</SectionTitle>
                  <div className="space-y-3">
                    {data.recommendations.map((rec, i) => (
                      <div key={i} className={`border-l-4 rounded-xl p-4 ${PRI_STYLES[rec.priority] || 'bg-slate-50 border-l-slate-400'}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm capitalize">{rec.category}</span>
                            <Badge variant={PRI_BADGE[rec.priority] || 'gray'}>{rec.priority} priority</Badge>
                          </div>
                          <span className="text-xs font-bold text-leaf-700">↓ {rec.potentialReduction}</span>
                        </div>
                        <p className="text-slate-600 text-sm">{rec.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Export */}
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-display font-bold text-slate-800 mb-4">Export Options</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    onClick={handlePDF}
                    disabled={generating}
                    className="flex items-center justify-center gap-2.5 p-4 border-2 border-leaf-300 bg-leaf-50 rounded-xl hover:bg-leaf-100 transition-all text-sm font-bold text-leaf-800"
                  >
                    <Printer className="w-5 h-5 text-leaf-600" />
                    Download PDF
                  </button>
                  <button
                    onClick={() => {
                      const blob = new Blob([JSON.stringify({ ...data, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
                      const url  = URL.createObjectURL(blob);
                      const a    = document.createElement('a');
                      a.href = url; a.download = `EcoTrack-${data.period?.replace(' ', '-')}.json`;
                      document.body.appendChild(a); a.click(); document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      toast.success('JSON downloaded!');
                    }}
                    className="flex items-center justify-center gap-2.5 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-sm font-semibold text-slate-700"
                  >
                    <FileText className="w-5 h-5 text-slate-400" /> Download Raw JSON
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  💡 The PDF report uses simple language designed to be easy to read by anyone, including non-technical users. It opens in a new tab — use Ctrl+P (or ⌘+P on Mac) to print or save as PDF.
                </p>
              </div>

              <div className="px-6 py-4 bg-slate-50 text-center text-xs text-slate-400">
                Generated on {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} by EcoTrack Carbon Footprint Tracker
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar history */}
        <div className="xl:col-span-1">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-leaf-600" />
              <h3 className="font-display font-bold text-slate-800 text-sm">Report History</h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              {activeCompany.businessName}
            </p>
            {loadingHistory ? (
              <p className="text-slate-400 text-xs text-center py-4">Loading…</p>
            ) : history.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-4">No history yet. Add data first.</p>
            ) : (
              <div className="space-y-1">
                {history.slice(0, 14).map(h => (
                  <button
                    key={h.id}
                    onClick={() => {
                      const m = MONTH_NAMES[h.month - 1];
                      setMonth(m); setYear(h.year);
                      loadReport(m, h.year, activeCompany.id);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group ${
                      MONTH_NAMES[h.month - 1] === month && h.year === year ? 'bg-leaf-50 border border-leaf-200' : ''
                    }`}
                  >
                    <div>
                      <p className="font-bold text-sm text-slate-800 group-hover:text-leaf-700 transition-colors">{h.period}</p>
                      <p className="text-xs text-slate-400">{(h.totalEmissions ?? 0).toFixed(0)} kg CO₂e</p>
                    </div>
                    <TrendingDown className="w-3.5 h-3.5 text-slate-300 group-hover:text-leaf-500 transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
