// src/pages/CompanyForm.jsx — Create or Edit a company profile
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Building2, MapPin } from 'lucide-react';
import { companyApi } from '../services/api';
import { useCompany } from '../context/CompanyContext';
import { useToast } from '../context/ToastContext';
import { LoadingState, PageHeader, Card, FieldLabel, Input, Select, Textarea, Btn, SectionTitle } from '../components/ui';

const INDUSTRY_TYPES = [
  'RETAIL','MANUFACTURING','TECHNOLOGY','HEALTHCARE','EDUCATION',
  'HOSPITALITY','TRANSPORTATION','CONSTRUCTION','AGRICULTURE','ENERGY',
  'FINANCIAL_SERVICES','CONSULTING','REAL_ESTATE','MEDIA','OTHER',
];

const COUNTRIES = [
  { value: 'kenya',       label: 'Kenya' },
  { value: 'uganda',      label: 'Uganda' },
  { value: 'tanzania',    label: 'Tanzania' },
  { value: 'nigeria',     label: 'Nigeria' },
  { value: 'southAfrica', label: 'South Africa' },
  { value: 'ethiopia',    label: 'Ethiopia' },
  { value: 'usa',         label: 'United States' },
  { value: 'uk',          label: 'United Kingdom' },
  { value: 'germany',     label: 'Germany' },
  { value: 'india',       label: 'India' },
  { value: 'china',       label: 'China' },
  { value: 'global',      label: 'Global Average' },
];

const EMPTY = {
  businessName: '', industryType: 'RETAIL', location: '', country: 'kenya',
  numberOfEmployees: 1, registrationNumber: '', contactEmail: '',
  contactPhone: '', businessDescription: '', yearEstablished: '',
};

export default function CompanyForm() {
  const { id }    = useParams();
  const isEdit    = Boolean(id);
  const navigate  = useNavigate();
  const toast     = useToast();
  const { addCompany, updateCompany } = useCompany();

  const [form,    setForm]    = useState(EMPTY);
  const [businessNameValid, setBusinessNameValid] = useState(true);
  const [loading, setLoading] = useState(isEdit);
  const [saving,  setSaving]  = useState(false);


  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const data = await companyApi.get(id);
        setForm({ ...EMPTY, ...data });
        setBusinessNameValid(validateBusinessName(data.businessName));
      } catch (err) {
        toast.error(err.message);
        navigate('/dashboard/companies');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const validateBusinessName = useCallback((name) => {
    const trimmed = name.trim();
    const isValidFormat = /^[a-zA-Z\s\-']+$/i.test(trimmed);
    return isValidFormat && trimmed.length >= 2;
  }, []);


  const set = (field) => (e) => {
    if (field === 'businessName') {
      const val = e.target.value;
      setForm(p => ({ ...p, [field]: val }));
      setBusinessNameValid(validateBusinessName(val));
    } else {
      setForm(p => ({ ...p, [field]: e.target.value }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.businessName.trim()) return toast.error('Business name is required.');
    if (!businessNameValid) return toast.error('Business name must only contain letters, spaces, hyphens, apostrophes and be at least 2 characters.');
    setSaving(true);
    try {
      const payload = { ...form, numberOfEmployees: parseInt(form.numberOfEmployees) || 1 };

      if (isEdit) {
        const updated = await companyApi.update(id, payload);
        updateCompany(updated);
        toast.success('Company updated! ✅');
      } else {
        const created = await companyApi.create(payload);
        addCompany(created);
        toast.success('Company created! ✅');
      }
      navigate('/dashboard/companies');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading company…" />;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Company' : 'New Company'}
        subtitle={isEdit ? 'Update your company profile' : 'Create a new company profile to track its emissions separately'}
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Business info */}
            <div>
              <SectionTitle icon={Building2}>Business Information</SectionTitle>
              <div className="space-y-4">
                <div>
                  <FieldLabel required>Business Name</FieldLabel>
                  <Input 
                    value={form.businessName} 
                    onChange={set('businessName')} 
                    placeholder="Ketepa Tea Ltd" 
                    required 
                    className={`${
                      !businessNameValid && form.businessName.trim() 
                        ? 'border-red-300 ring-red-200 bg-red-50 focus:ring-red-500' 
                        : ''
                    }`}
                  />
                </div>



                <div>
                  <FieldLabel>Industry Type</FieldLabel>
                  <Select value={form.industryType} onChange={set('industryType')}>
                    {INDUSTRY_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                  </Select>
                </div>
                <div>
                  <FieldLabel>Registration Number</FieldLabel>
                  <Input value={form.registrationNumber} onChange={set('registrationNumber')} placeholder="BN/2024/12345" />
                </div>
                <div>
                  <FieldLabel>Year Established</FieldLabel>
                  <Input value={form.yearEstablished} onChange={set('yearEstablished')} placeholder="2019" maxLength={4} />
                </div>
                <div>
                  <FieldLabel>Number of Employees</FieldLabel>
                  <Input type="number" min="1" value={form.numberOfEmployees} onChange={set('numberOfEmployees')} />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <SectionTitle icon={MapPin}>Location &amp; Contact</SectionTitle>
              <div className="space-y-4">
                <div>
                  <FieldLabel>Location</FieldLabel>
                  <Input value={form.location} onChange={set('location')} placeholder="Nairobi, Kenya" />
                </div>
                <div>
                  <FieldLabel>Country</FieldLabel>
                  <Select value={form.country} onChange={set('country')}>
                    {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </Select>
                </div>
                <div>
                  <FieldLabel>Contact Email</FieldLabel>
                  <Input type="email" value={form.contactEmail} onChange={set('contactEmail')} placeholder="hello@company.com" />
                </div>
                <div>
                  <FieldLabel>Contact Phone</FieldLabel>
                  <Input value={form.contactPhone} onChange={set('contactPhone')} placeholder="+254 700 000 000" />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div>
            <FieldLabel>Business Description</FieldLabel>
            <Textarea
              rows={3}
              value={form.businessDescription}
              onChange={set('businessDescription')}
              placeholder="Brief description of your business operations and sustainability goals…"
            />
          </div>

          <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 text-sm text-sky-800">
            <strong>💡 Why this matters:</strong> Your country determines the correct electricity emission factor for accurate carbon calculations.
          </div>

          <div className="flex gap-3">
            <Btn type="submit" variant="primary" disabled={saving}>
              <Save className="w-4 h-4" /> {saving ? 'Saving…' : isEdit ? 'Update Company' : 'Create Company'}
            </Btn>
            <Btn type="button" variant="secondary" onClick={() => navigate('/dashboard/companies')} disabled={saving}>
              <X className="w-4 h-4" /> Cancel
            </Btn>
          </div>
        </form>
      </Card>
    </div>
  );
}
