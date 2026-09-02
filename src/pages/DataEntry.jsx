// src/pages/DataEntry.jsx
import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Save, X, Zap, Fuel, Plane, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { emissionsApi } from '../services/api';
import { useCompany }   from '../context/CompanyContext';
import { useToast }     from '../context/ToastContext';
import { useNavigate }  from 'react-router-dom';
import {
  LoadingState, PageHeader, Card, FieldLabel,
  Input, Select, Textarea, Btn, ScoreBadge, EmptyState,
} from '../components/ui';

const MONTH_NAMES = ['','January','February','March','April','May','June',
                     'July','August','September','October','November','December'];
const FUEL_TYPES  = ['DIESEL','PETROL','KEROSENE','LPG','LNG','CNG','WOOD','COAL'];
const WASTE_TYPES = ['LANDFILL','RECYCLED','COMPOSTED','INCINERATED','HAZARDOUS'];

const EMPTY_FORM = {
  month: '', year: new Date().getFullYear(),
  electricityKwh: '', fuelType: 'DIESEL', fuelQuantity: '',
  wasteKg: '', wasteType: 'LANDFILL', flightKm: '', notes: '',
};



function ScopeBlock({ title, color, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
          <Icon className="w-4 h-4" style={{ color }} />
          <span className="font-bold text-sm text-slate-800">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
}

export default function DataEntry() {
  const { activeCompany } = useCompany();
  const toast    = useToast();
  const navigate = useNavigate();
  const [entries,   setEntries]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);

  const load = useCallback(async () => {
    if (!activeCompany) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await emissionsApi.getAllEntries(activeCompany.id);
      setEntries(data);
    } catch (err) {
      toast.error('Failed to load entries: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [activeCompany?.id]);

  useEffect(() => { load(); }, [load]);

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const openAdd = () => {
    setForm(EMPTY_FORM); setEditingId(null); setShowForm(true);
    setTimeout(() => document.getElementById('entry-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const openEdit = (entry) => {
    setForm({
      month: String(entry.month), year: entry.year,
      electricityKwh: entry.electricityKwh ?? '', fuelType: entry.fuelType ?? 'DIESEL',
      fuelQuantity: entry.fuelQuantity ?? '', wasteKg: entry.wasteKg ?? '',
      wasteType: entry.wasteType ?? 'LANDFILL', flightKm: entry.flightKm ?? '',
      notes: entry.notes ?? '',
    });
    setEditingId(entry.id); setShowForm(true);
    setTimeout(() => document.getElementById('entry-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const cancelForm = () => { setShowForm(false); setEditingId(null); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.month) return toast.error('Please select a month.');
    setSaving(true);
    const payload = {
      month: parseInt(form.month), year: parseInt(form.year),
      electricityKwh: form.electricityKwh ? parseFloat(form.electricityKwh) : undefined,
      fuelType:       form.fuelQuantity    ? form.fuelType                   : undefined,
      fuelQuantity:   form.fuelQuantity    ? parseFloat(form.fuelQuantity)   : undefined,
      wasteKg:        form.wasteKg         ? parseFloat(form.wasteKg)        : undefined,
      wasteType:      form.wasteType,
      flightKm:       form.flightKm        ? parseFloat(form.flightKm)       : undefined,
      notes:          form.notes || undefined,
    };
    try {
      if (editingId) {
        await emissionsApi.updateEntry(activeCompany.id, editingId, payload);
        toast.success('Entry updated! ✅');
      } else {
        await emissionsApi.createEntry(activeCompany.id, payload);
        toast.success('Entry saved! ✅');
      }
      cancelForm(); load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this entry? This cannot be undone.')) return;
    try {
      await emissionsApi.deleteEntry(activeCompany.id, id);
      toast.success('Entry deleted.');
      load();
    } catch (err) { toast.error(err.message); }
  };

  // No company selected
  if (!activeCompany) {
    return (
      <div>
        <PageHeader title="Data Entry" subtitle="Log monthly emissions data" />
        <Card>
          <EmptyState
            icon="🏢"
            title="No Company Selected"
            description="Please select or create a company profile first to log emission data."
            action={<Btn variant="primary" onClick={() => navigate('/dashboard/companies/new')}><Plus className="w-4 h-4" /> Create Company</Btn>}
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Data Entry"
        subtitle={<>Log monthly emissions for <strong className="text-leaf-700">{activeCompany.businessName}</strong></>}
        action={!showForm && <Btn variant="primary" onClick={openAdd}><Plus className="w-4 h-4" /> Add Entry</Btn>}
      />

      {/* Form */}
      {showForm && (
        <Card className="mb-6" id="entry-form">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-lg text-slate-900">
              {editingId ? 'Edit Entry' : 'Add Monthly Data'}
            </h3>
            <button onClick={cancelForm} className="text-slate-400 hover:text-slate-700 p-1"><X className="w-5 h-5" /></button>
          </div>
          <p className="text-slate-500 text-sm mb-5">
            Enter figures from your monthly records — electricity bills, fuel receipts, waste logs.
          </p>

          <form onSubmit={submit} className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <FieldLabel required>Month</FieldLabel>
                <Select value={form.month} onChange={set('month')} required>
                  <option value="">Select month…</option>
                  {MONTH_NAMES.slice(1).map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </Select>
              </div>
              <div>
                <FieldLabel required>Year</FieldLabel>
                <Input type="number" min="2000" max="2100" value={form.year} onChange={set('year')} required />
              </div>
            </div>

            <ScopeBlock title="Scope 2 — Electricity" color="#16a34a" icon={Zap}>
              <div>
                <FieldLabel>Electricity Used (kWh)</FieldLabel>
                <Input type="number" min="0" step="any" value={form.electricityKwh} onChange={set('electricityKwh')} placeholder="e.g. 500" />
                <p className="text-xs text-slate-400 mt-1">Check your electricity bill for the kWh figure.</p>
              </div>
            </ScopeBlock>

            <ScopeBlock title="Scope 1 — Fuel &amp; Direct Emissions" color="#ef4444" icon={Fuel}>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Fuel Quantity (litres)</FieldLabel>
                  <Input type="number" min="0" step="any" value={form.fuelQuantity} onChange={set('fuelQuantity')} placeholder="e.g. 200" />
                </div>
                <div>
                  <FieldLabel>Fuel Type</FieldLabel>
                  <Select value={form.fuelType} onChange={set('fuelType')}>
                    {FUEL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </div>
              </div>
            </ScopeBlock>

            <ScopeBlock title="Scope 3 — Waste &amp; Business Travel" color="#0ea5e9" icon={Plane} defaultOpen={false}>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Waste Generated (kg)</FieldLabel>
                  <Input type="number" min="0" step="any" value={form.wasteKg} onChange={set('wasteKg')} placeholder="e.g. 100" />
                </div>
                <div>
                  <FieldLabel>Waste Disposal Method</FieldLabel>
                  <Select value={form.wasteType} onChange={set('wasteType')}>
                    {WASTE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
                  </Select>
                </div>
                <div>
                  <FieldLabel>Business Flights (km)</FieldLabel>
                  <Input type="number" min="0" step="any" value={form.flightKm} onChange={set('flightKm')} placeholder="e.g. 0" />
                  <p className="text-xs text-slate-400 mt-1">Total flight kilometres for all staff this month.</p>
                </div>
              </div>
            </ScopeBlock>

            <div>
              <FieldLabel>Notes (optional)</FieldLabel>
              <Textarea rows={2} value={form.notes} onChange={set('notes')} placeholder="Any context for this month's data…" />
            </div>

            <div className="flex gap-3 pt-1">
              <Btn type="submit" variant="primary" disabled={saving}>
                <Save className="w-4 h-4" /> {saving ? 'Saving…' : editingId ? 'Update Entry' : 'Save Entry'}
              </Btn>
              <Btn type="button" variant="secondary" onClick={cancelForm} disabled={saving}>Cancel</Btn>
            </div>
          </form>
        </Card>
      )}

      {/* Table */}
      {loading ? (
        <LoadingState message="Loading entries…" />
      ) : (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Period','Scope 1 (Fuel)','Scope 2 (Electricity)','Scope 3 (Waste/Travel)','Total CO₂e','Score','Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr><td colSpan={7}>
                    <EmptyState
                      icon="📊"
                      title="No entries yet"
                      description="Click 'Add Entry' to start logging monthly carbon emissions for this company."
                      action={<Btn variant="primary" onClick={openAdd}><Plus className="w-4 h-4" /> Add First Entry</Btn>}
                    />
                  </td></tr>
                ) : entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-sm text-slate-900">{MONTH_NAMES[entry.month]} {entry.year}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{(entry.scope1Emissions ?? 0).toFixed(1)} kg</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{(entry.scope2Emissions ?? 0).toFixed(1)} kg</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{(entry.scope3Emissions ?? 0).toFixed(1)} kg</td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-sm text-slate-900">{(entry.totalEmissions ?? 0).toFixed(1)} kg CO₂e</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <ScoreBadge score={entry.score ?? '—'} />

                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(entry)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-leaf-700 transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => remove(entry.id)} className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {entries.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'} for {activeCompany.businessName}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
