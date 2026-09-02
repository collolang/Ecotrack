// src/pages/DashboardPanel.jsx
import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart,
} from 'recharts';
import { Leaf, TrendingDown, TrendingUp, Target, Brain, Download, Zap, Building2, Plus } from 'lucide-react';
import { emissionsApi } from '../services/api';
import { useCompany }   from '../context/CompanyContext';
import { useNavigate }  from 'react-router-dom';
import { LoadingState, ErrorState, Card, Badge, ScoreBadge } from '../components/ui';

const SCOPE_COLORS = ['#16a34a', '#0ea5e9', '#f59e0b'];

//  pred?.predicted ?? '—'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-slate-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value?.toFixed(1)} kg
        </p>
      ))}
    </div>
  );
};

function NoCompany({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <div className="w-20 h-20 bg-leaf-100 rounded-3xl flex items-center justify-center">
        <Building2 className="w-10 h-10 text-leaf-600" />
      </div>
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-slate-800 mb-2">No Company Selected</h2>
        <p className="text-slate-500 text-sm max-w-sm">Create a company profile to start tracking your carbon emissions and viewing insights.</p>
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 bg-leaf-600 hover:bg-leaf-700 text-white px-6 py-3 rounded-xl font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg"
      >
        <Plus className="w-4 h-4" /> Create Company Profile
      </button>
    </div>
  );
}

export default function DashboardPanel() {
  const { activeCompany } = useCompany();
  const navigate = useNavigate();
const [state, setState] = useState({ loading: true, error: null, monthly: [], breakdown: [], yearly: [], total: 0, score: {}, prediction: null });

  useEffect(() => {
    if (!activeCompany) { setState(s => ({ ...s, loading: false })); return; }
    setState(s => ({ ...s, loading: true, error: null }));
    (async () => {
      try {
        const results = await Promise.allSettled([
          emissionsApi.getMonthlyData(activeCompany.id),
          emissionsApi.getBreakdownData(activeCompany.id),
          emissionsApi.getYearlyComparison(activeCompany.id),
          emissionsApi.getTotalEmissions(activeCompany.id),
          emissionsApi.getScore(activeCompany.id),
          // emissionsApi.getPrediction(activeCompany.id),
          emissionsApi.getPrediction(activeCompany.id, new Date().getFullYear()),

        ]);

        const unwrap = (r, fallback) => (r.status === 'fulfilled' ? r.value : fallback);

        const monthly = unwrap(results[0], []);
        const breakdown = unwrap(results[1], []);
        const yearly = unwrap(results[2], []);
        const total = unwrap(results[3], 0) || 0;
        const score = unwrap(results[4], {}) || {};
        const prediction = unwrap(results[5], null);

        setState({ loading: false, error: null, monthly, breakdown, yearly, total, score, prediction });
      } catch (err) {
        setState(s => ({ ...s, loading: false, error: err.message }));
      }
    })();
  }, [activeCompany?.id]);

  if (!activeCompany) return <NoCompany onAdd={() => navigate('/dashboard/companies/new')} />;
  if (state.loading)  return <LoadingState message="Loading dashboard data…" />;
  if (state.error)    return <ErrorState message={state.error} onRetry={() => window.location.reload()} />;

  const gs = state.score || {};
  const pred = state.prediction || null;
  const scoreColors = { A: '#16a34a', B: '#0ea5e9', C: '#f59e0b', D: '#ef4444' };
  const scoreKey = gs.score;
  const bgColor = scoreKey ? (scoreColors[scoreKey] + '1a') : 'transparent';
  const textColor = scoreKey ? scoreColors[scoreKey] : '#64748b';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-slate-900">
            {activeCompany.businessName}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {activeCompany.industryType?.replace(/_/g, ' ')} · {activeCompany.location || activeCompany.country}
          </p>
        </div>
        <span className="hidden sm:block text-xs bg-leaf-50 border border-leaf-200 text-leaf-700 px-3 py-1.5 rounded-xl font-bold">
          {activeCompany.numberOfEmployees || 1} employees
        </span>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-leaf-600 to-leaf-700 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <p className="text-leaf-100 text-xs font-bold uppercase tracking-wider">This Month</p>
            <Leaf className="w-5 h-5 text-leaf-200" />
          </div>
          <p className="font-display text-3xl font-extrabold">{state.total}</p>
          <p className="text-leaf-100 text-xs mt-1">kg CO₂e total</p>
        </div>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Green Score</p>
            <Target className="w-4 h-4 text-slate-300" />
          </div>
          <div>
            <span
              className="inline-block px-3 py-1 rounded-full text-2xl font-extrabold font-display mb-1"
              style={{ background: bgColor, color: textColor }}
            >
              {gs.score || '—'}
            </span>
            <p className="text-slate-500 text-xs">{gs.description || ''}</p>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Per Employee</p>
            <TrendingDown className="w-4 h-4 text-slate-300" />
          </div>
          <div>
            <p className="font-display text-2xl font-extrabold text-slate-900">{gs.emissionsPerEmployee ?? '—'} kg</p>
            {pred && (
              <div className="flex items-center gap-1 mt-1">
                {pred.trend === 'decreasing'
                  ? <TrendingDown className="w-3.5 h-3.5 text-leaf-600" />
                  : <TrendingUp className="w-3.5 h-3.5 text-red-500" />}
                <span className="text-xs text-slate-500">{pred.trend}</span>
              </div>
            )}
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Forecast</p>
            <Brain className="w-4 h-4 text-slate-300" />
          </div>
          <div>
            <p className="font-display text-2xl font-extrabold text-slate-900">
              {pred?.predictedEmissions ?? '—'}
             
            </p>
            <p className="text-slate-500 text-xs mt-1">
              {pred ? `${pred.confidence} confidence` : 'Need more data'}
            </p>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3">
          <h3 className="font-display font-bold text-slate-800 mb-5">Monthly Emissions Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={state.monthly} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="emGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="emissions" name="Emissions" stroke="#16a34a" strokeWidth={2.5} fill="url(#emGrad)" dot={{ fill: '#16a34a', strokeWidth: 0, r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="font-display font-bold text-slate-800 mb-4">Emission Breakdown</h3>
          {state.breakdown.some(b => b.value > 0) ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={state.breakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={4} dataKey="value">
                    {state.breakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color || SCOPE_COLORS[i % SCOPE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v?.toFixed(1)} kg`, n]} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {state.breakdown.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color || SCOPE_COLORS[i] }} />
                      <span className="text-slate-600 text-xs">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-800 text-xs">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-slate-400 text-sm text-center py-8">No data for this month yet.</p>
          )}
        </Card>
      </div>

      {/* Yearly */}
      <Card>
        <h3 className="font-display font-bold text-slate-800 mb-5">Year-over-Year Comparison</h3>
        {state.yearly.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={state.yearly} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v) => [`${v} kg CO₂e`, 'Total Emissions']} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="emissions" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-400 text-sm text-center py-8">No multi-year data yet.</p>
        )}
      </Card>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => navigate('/dashboard/reports')}
          className="flex items-center gap-2 bg-leaf-600 hover:bg-leaf-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          <Download className="w-4 h-4" /> Generate Report
        </button>
        <button
          onClick={() => navigate('/dashboard/data')}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <Zap className="w-4 h-4" /> Enter Data
        </button>
      </div>
    </div>
  );
}
