// src/pages/Landing.jsx
import { useNavigate } from 'react-router-dom';
import { Leaf, BarChart3, TrendingDown, Users, ArrowRight, CheckCircle } from 'lucide-react';
import SEO from '../components/SEO';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-hero-gradient font-body">
      <SEO
        path="/"
        title="Carbon Footprint Tracker for SMEs"
        description="EcoTrack helps small and medium businesses monitor, measure, and reduce their environmental impact with real-time Scope 1, 2 & 3 emissions tracking — GHG Protocol compliant."
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'EcoTrack',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          description:
            'EcoTrack helps small and medium businesses monitor, measure, and reduce their environmental impact with real-time Scope 1, 2 & 3 emissions tracking.',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        }}
      />
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-leaf-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-slate-900">EcoTrack</span>
          </div>
          <button
            onClick={() => navigate('/auth')}
            className="bg-leaf-600 hover:bg-leaf-700 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="page-enter">
            <div className="inline-flex items-center gap-2 bg-leaf-100 text-leaf-800 border border-leaf-200 rounded-full px-3.5 py-1.5 text-xs font-bold mb-6 tracking-wide uppercase">
              <CheckCircle className="w-3.5 h-3.5" />
              GHG Protocol Compliant
            </div>
            <h1 className="font-display text-5xl font-extrabold text-slate-900 leading-tight mb-5">
              Track Your{' '}
              <span className="text-leaf-600">Carbon Footprint</span>{' '}
              with Clarity
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed mb-8 max-w-lg">
              EcoTrack helps SMEs monitor, measure, and reduce their environmental impact.
              Get real-time insights on Scope 1, 2 &amp; 3 emissions — all in one platform.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/auth')}
                className="flex items-center gap-2 bg-leaf-600 hover:bg-leaf-700 text-white px-7 py-3.5 rounded-xl font-bold text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
              >
                Start Tracking Free
                <ArrowRight className="w-4 h-4" />
              </button>
              {/* <button
                onClick={() => navigate('/auth?mode=login')}
                className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-7 py-3.5 rounded-xl font-bold text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                View Demo
              </button> */}
            </div>
          </div>

          {/* Dashboard preview card */}
          <div className="page-enter bg-white rounded-2xl shadow-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <span className="font-display font-bold text-slate-800">Monthly Emissions</span>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <p className="text-xs text-slate-500 mb-1">Total CO₂ this month</p>
              <p className="font-display text-3xl font-extrabold text-leaf-600">847 kg</p>
            </div>
            {[
              { label: 'Electricity (Scope 2)', pct: 42, color: 'bg-leaf-500' },
              { label: 'Fuel (Scope 1)',        pct: 35, color: 'bg-sky-500' },
              { label: 'Waste (Scope 3)',        pct: 23, color: 'bg-amber-500' },
            ].map(item => (
              <div key={item.label} className="mb-3">
                <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                  <span>{item.label}</span><span className="font-semibold">{item.pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
            <div className="mt-4 flex items-center gap-2 bg-leaf-50 border border-leaf-200 rounded-xl p-3">
              <span className="text-lg">🏆</span>
              <span className="text-sm font-bold text-leaf-800">Green Score: B — Good progress!</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold text-slate-900 mb-3">Everything you need to go green</h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">Comprehensive tools built for small and medium enterprises across Africa and beyond.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: BarChart3,   color: 'bg-leaf-100 text-leaf-600',  title: 'GHG Protocol Tracking',   desc: 'Log Scope 1, 2 & 3 emissions from electricity, fuel, waste, and business travel. Country-specific grid factors included.' },
            { icon: TrendingDown, color: 'bg-sky-100 text-sky-600',    title: 'Analytics Dashboard',     desc: 'Interactive charts showing monthly trends, year-over-year comparisons, and your green score with AI-powered forecasts.' },
            { icon: Users,       color: 'bg-purple-100 text-purple-600', title: 'Sustainability Reports', desc: 'Generate professional carbon footprint reports with actionable recommendations. Download and share with stakeholders.' },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="card-hover bg-white rounded-2xl p-7 border border-slate-100 shadow-sm">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} mb-5`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      {/* <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-leaf-600 rounded-2xl p-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '10,000+', label: 'Active Users' },
            { value: '50,000+', label: 'Tons CO₂ Reduced' },
            { value: '100+',    label: 'Cities Covered' },
            { value: '4.8★',   label: 'User Rating' },
          ].map(s => (
            <div key={s.label}>
              <p className="font-display text-3xl font-extrabold text-white mb-1">{s.value}</p>
              <p className="text-leaf-100 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section> */}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-14 text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-3">Ready to Make a Difference?</h2>
          <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of businesses already tracking and reducing their carbon footprint with EcoTrack.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="flex items-center gap-2 bg-white hover:bg-slate-100 text-leaf-700 font-bold px-8 py-4 rounded-xl text-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl mx-auto"
          >
            Get Started Now <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-500 text-center py-6 text-sm">
        © 2026 EcoTrack | Carbon Footprint Monitoring System
      </footer>
    </div>
  );
}
