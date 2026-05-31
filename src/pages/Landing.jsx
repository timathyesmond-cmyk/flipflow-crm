import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  HandCoins, LayoutDashboard, Users, Map, Calculator, FileText,
  CheckCircle2, ChevronRight, Play, Zap, Star, Crown, ArrowRight,
  BarChart3, Mail
} from 'lucide-react';

const DEMO_SLIDES = [
  {
    label: 'Pipeline Dashboard',
    icon: LayoutDashboard,
    description: 'Bird-eye view of every deal — stages, follow-ups, and revenue at a glance.',
    mockup: (
      <div className="w-full h-full bg-slate-900 rounded-xl p-4 flex flex-col gap-3 text-white">
        <div className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">Dashboard</div>
        <div className="grid grid-cols-3 gap-2">
          {[['$248K', 'Pipeline'], ['12', 'Active Deals'], ['3', 'Follow-ups']].map(([v, l]) => (
            <div key={l} className="bg-slate-800 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-amber-400">{v}</div>
              <div className="text-[10px] text-slate-400">{l}</div>
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          {[['Under Contract', 'bg-blue-500', '4'], ['Assigned', 'bg-amber-500', '3'], ['Closed', 'bg-emerald-500', '5']].map(([s, c, n]) => (
            <div key={s} className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-1.5">
              <div className={`w-2 h-2 rounded-full ${c}`} />
              <span className="text-xs flex-1">{s}</span>
              <span className="text-xs font-bold text-slate-300">{n}</span>
            </div>
          ))}
        </div>
        <div className="mt-auto flex gap-2 items-end">
          {[60, 80, 45, 90, 55, 70, 85].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end">
              <div className="bg-amber-500/70 rounded-sm" style={{ height: `${h * 0.4}px` }} />
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    label: 'Deal Kanban',
    icon: HandCoins,
    description: 'Drag-and-drop Kanban board to move deals through your pipeline instantly.',
    mockup: (
      <div className="w-full h-full bg-slate-900 rounded-xl p-4 flex gap-2 text-white overflow-hidden">
        {[
          { stage: 'Leads', color: 'border-slate-500', deals: ['123 Oak St', '456 Pine Ave', '789 Elm Dr'] },
          { stage: 'Contacted', color: 'border-blue-500', deals: ['321 Main St', '654 Birch Ln'] },
          { stage: 'Under Contract', color: 'border-amber-500', deals: ['11 Cedar Way', '22 Maple Ct'] },
        ].map(col => (
          <div key={col.stage} className={`flex-1 border-t-2 ${col.color} bg-slate-800 rounded-lg p-2`}>
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2">{col.stage}</div>
            {col.deals.map(d => (
              <div key={d} className="bg-slate-700 rounded-md p-2 mb-1.5 text-[10px]">
                <div className="font-semibold text-white">{d}</div>
                <div className="text-slate-400 mt-0.5">Assignment</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    ),
  },
  {
    label: 'Buyer & Seller CRM',
    icon: Users,
    description: 'Manage all your buyers and sellers, match deals to buyers automatically.',
    mockup: (
      <div className="w-full h-full bg-slate-900 rounded-xl p-4 text-white flex flex-col gap-2">
        <div className="text-xs font-bold uppercase tracking-widest text-amber-400">Contacts</div>
        {[
          { name: 'James Holloway', type: 'Buyer', badge: 'bg-emerald-700', note: 'Wants SFH · $150K max' },
          { name: 'Sandra Reyes', type: 'Seller', badge: 'bg-blue-700', note: 'Motivated · 3/2 SFH' },
          { name: 'Mike Torres', type: 'Buyer', badge: 'bg-emerald-700', note: 'Cash · $200K max' },
          { name: 'Linda Park', type: 'Seller', badge: 'bg-blue-700', note: 'Inherited property' },
        ].map(c => (
          <div key={c.name} className="bg-slate-800 rounded-lg p-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold">{c.name[0]}</div>
            <div className="flex-1">
              <div className="text-xs font-semibold">{c.name}</div>
              <div className="text-[10px] text-slate-400">{c.note}</div>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${c.badge}`}>{c.type}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    label: 'MAO Calculator',
    icon: Calculator,
    description: 'Instantly calculate your Maximum Allowable Offer with real-time deal insights.',
    mockup: (
      <div className="w-full h-full bg-slate-900 rounded-xl p-4 text-white flex flex-col gap-3">
        <div className="text-xs font-bold uppercase tracking-widest text-amber-400">MAO Calculator</div>
        <div className="grid grid-cols-2 gap-2">
          {[['ARV', '$185,000'], ['Repairs', '$32,000'], ['Margin 70%', '$129,500'], ['Your MAO', '$97,500']].map(([l, v]) => (
            <div key={l} className="bg-slate-800 rounded-lg p-2">
              <div className="text-[10px] text-slate-400">{l}</div>
              <div className="text-sm font-bold text-amber-400">{v}</div>
            </div>
          ))}
        </div>
        <div className="bg-emerald-900/50 border border-emerald-700 rounded-lg p-3 text-center">
          <div className="text-[10px] text-emerald-400 font-semibold uppercase">Deal Status</div>
          <div className="text-base font-bold text-emerald-300 mt-0.5">Strong Deal</div>
          <div className="text-[10px] text-slate-400">32% equity · $32K assignment potential</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-2">
          <div className="w-full h-2 bg-slate-700 rounded-full">
            <div className="h-2 bg-amber-500 rounded-full" style={{ width: '68%' }} />
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Offer: $97K of $185K ARV</div>
        </div>
      </div>
    ),
  },
  {
    label: 'Contract Generator',
    icon: FileText,
    description: 'Generate purchase agreements, assignment contracts, and JV agreements as PDF.',
    mockup: (
      <div className="w-full h-full bg-slate-900 rounded-xl p-4 text-white flex flex-col gap-2">
        <div className="text-xs font-bold uppercase tracking-widest text-amber-400">Contract Generator</div>
        <div className="bg-white rounded-lg p-3 flex-1 text-slate-900 text-[9px] leading-relaxed">
          <div className="font-bold text-center text-[11px] mb-1">REAL ESTATE PURCHASE AGREEMENT</div>
          <div className="text-slate-600">This agreement entered between <span className="font-semibold">Buyer: John Investor</span> and <span className="font-semibold">Seller: Sandra Reyes</span>...</div>
          <div className="mt-1 text-slate-600">Property: <span className="font-semibold">456 Pine Ave, Dallas TX</span></div>
          <div className="mt-1 text-slate-600">Purchase Price: <span className="font-semibold text-blue-700">$97,500</span></div>
          <div className="mt-1 text-slate-600">Closing: <span className="font-semibold">30 days from signing</span></div>
          <div className="mt-2 border-t pt-1 text-slate-500">Signature: _______________</div>
        </div>
        <button className="bg-amber-500 text-white rounded-lg py-1.5 text-xs font-semibold">Export as PDF</button>
      </div>
    ),
  },
  {
    label: 'Property Map',
    icon: Map,
    description: 'Visualize all your deals on an interactive map — spot clusters and opportunities.',
    mockup: (
      <div className="w-full h-full bg-slate-900 rounded-xl p-4 text-white flex flex-col gap-2">
        <div className="text-xs font-bold uppercase tracking-widest text-amber-400">Deal Map</div>
        <div className="flex-1 bg-slate-700 rounded-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 21px), repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 21px)',
          }} />
          {[[30, 40], [55, 25], [45, 60], [70, 35], [25, 70], [80, 55], [60, 75]].map(([x, y], i) => (
            <div key={i} className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shadow-lg ${
                i % 3 === 0 ? 'bg-amber-500' : i % 3 === 1 ? 'bg-blue-500' : 'bg-emerald-500'
              }`}>$</div>
            </div>
          ))}
        </div>
        <div className="flex gap-3 text-[10px]">
          {[['bg-amber-500', 'Lead'], ['bg-blue-500', 'Contract'], ['bg-emerald-500', 'Closed']].map(([c, l]) => (
            <div key={l} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${c}`} />{l}
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

const FEATURES = [
  { icon: LayoutDashboard, title: 'Live Dashboard',       desc: 'Real-time pipeline stats, revenue tracking, and follow-up alerts.' },
  { icon: HandCoins,       title: 'Deal Pipeline',        desc: 'Drag-and-drop Kanban board from lead to closed.' },
  { icon: Users,           title: 'Contact CRM',          desc: 'Buyer profiles, seller management, and auto-matching.' },
  { icon: Map,             title: 'Property Map',         desc: 'Visualize your entire portfolio on an interactive map.' },
  { icon: Calculator,      title: 'Deal Calculators',     desc: 'MAO, Sub-To, Seller Finance, Hybrid — all in one place.' },
  { icon: FileText,        title: 'Contract Generator',   desc: 'One-click PDF contracts — purchase, assignment, JV.' },
  { icon: Mail,            title: 'Email & SMS Tools',    desc: 'Templated outreach for buyers and sellers.' },
  { icon: BarChart3,       title: 'Analytics',            desc: 'Monthly profit charts, pipeline velocity, lead sources.' },
];

const PLANS = [
  { name: 'Basic',     price: '$14.99', icon: Zap,   colorClass: 'text-blue-400',   ringClass: '',                        features: ['Deals, Contacts & Map', 'Activity Timeline', 'Follow-up Reminders'] },
  { name: 'Wholesale', price: '$24.99', icon: Star,  colorClass: 'text-amber-400',  ringClass: 'ring-2 ring-amber-500/50', features: ['Everything in Basic', 'MAO Calculator', 'Deal Analysis'], popular: true },
  { name: 'Pro',       price: '$49.99', icon: Crown, colorClass: 'text-purple-400', ringClass: '',                        features: ['All Calculators', 'Contract Generators', 'Email & SMS Templates'] },
];

export default function Landing() {
  const [slide, setSlide] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    // Capture referral code from URL
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('flipflow_ref', ref);
    }
  }, []);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setSlide(s => (s + 1) % DEMO_SLIDES.length), 3500);
    return () => clearInterval(t);
  }, [playing]);

  const handleAuth = () => base44.auth.redirectToLogin('/');

  const current = DEMO_SLIDES[slide];

  return (
    <div className="min-h-screen bg-[#0d1b2e] text-white overflow-x-hidden">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d1b2e]/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <HandCoins className="w-4 h-4 text-slate-900" />
            </div>
            <span className="font-bold text-lg tracking-tight">FlipFlow</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest hidden sm:block ml-1">Wholesale CRM</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleAuth} className="text-sm text-slate-300 hover:text-white transition-colors px-3 py-1.5">
              Log In
            </button>
            <button
              onClick={handleAuth}
              className="text-sm bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-4 py-1.5 rounded-lg transition-colors"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-5">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 text-xs text-amber-400 font-medium">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
            7-Day Free Trial — No Credit Card Required
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            The CRM Built for<br />
            <span className="text-amber-400">Wholesale Real Estate</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-xl mx-auto">
            Track deals, manage contacts, analyze every offer, and generate contracts — all in one powerful platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleAuth}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-8 py-3.5 rounded-xl text-base transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              Start Free for 7 Days <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleAuth}
              className="w-full sm:w-auto border border-white/15 hover:border-white/30 text-slate-300 hover:text-white font-medium px-8 py-3.5 rounded-xl text-base transition-colors"
            >
              Already have an account? Log In
            </button>
          </div>
        </div>

        {/* Animated Feature Showcase */}
        <div className="relative max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-amber-500/5 rounded-3xl blur-3xl" />
          <div className="relative bg-[#0f2035] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">

            {/* Browser chrome */}
            <div className="bg-[#0a1628] px-4 py-3 flex items-center gap-2 border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-amber-500/60" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              <div className="flex-1 mx-4 bg-[#0d1b2e] rounded-md px-3 py-1 text-xs text-slate-500 text-center">
                flipflowcrm.base44.app
              </div>
            </div>

            <div className="flex flex-col md:flex-row">
              {/* Slide nav */}
              <div className="md:w-44 lg:w-52 bg-[#0a1628] border-r border-white/5 p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible flex-shrink-0">
                {DEMO_SLIDES.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => { setSlide(i); setPlaying(false); }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                        slide === i
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {s.label}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPlaying(p => !p)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-400 transition-colors md:mt-auto"
                >
                  <Play className="w-3.5 h-3.5" />
                  {playing ? 'Pause' : 'Play'}
                </button>
              </div>

              {/* Mockup area */}
              <div className="flex-1 p-4 md:p-6 flex flex-col gap-3" style={{ minHeight: '360px' }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={slide}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col md:flex-row gap-4 flex-1"
                  >
                    {/* Description */}
                    <div className="md:w-44 lg:w-52 flex flex-col justify-center space-y-3 flex-shrink-0">
                      <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                        {current.label}
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{current.description}</p>
                      <button
                        onClick={handleAuth}
                        className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium"
                      >
                        Try it free <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                    {/* Screen mockup */}
                    <div className="flex-1 min-h-[220px]">
                      {current.mockup}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Progress dots */}
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  {DEMO_SLIDES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setSlide(i); setPlaying(false); }}
                      className={`rounded-full transition-all ${i === slide ? 'bg-amber-400 w-5 h-1.5' : 'bg-slate-700 w-1.5 h-1.5 hover:bg-slate-500'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold">Everything you need to close more deals</h2>
          <p className="text-slate-400 text-sm">Built specifically for real estate wholesalers — not generic CRM bloatware.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(f => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="bg-[#0f2035] border border-white/8 rounded-xl p-4 space-y-2 hover:border-amber-500/30 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-amber-400" />
                </div>
                <div className="font-semibold text-sm">{f.title}</div>
                <div className="text-xs text-slate-400 leading-relaxed">{f.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold">Simple pricing, no surprises</h2>
          <p className="text-slate-400 text-sm">All plans start with a 7-day free trial. Cancel anytime.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
          {PLANS.map(plan => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`relative bg-[#0f2035] border border-white/10 rounded-2xl p-5 flex flex-col gap-4 ${plan.ringClass}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full bg-amber-500 text-slate-900 whitespace-nowrap">
                    MOST POPULAR
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${plan.colorClass}`} />
                  <span className="font-bold">{plan.name}</span>
                </div>
                <div>
                  <span className="text-3xl font-extrabold">{plan.price}</span>
                  <span className="text-slate-500 text-xs"> /mo</span>
                </div>
                <ul className="space-y-1.5 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleAuth}
                  className="w-full py-2 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/20 transition-colors"
                >
                  Start Free Trial
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-xl mx-auto space-y-5">
          <h2 className="text-3xl font-extrabold">Ready to flip more deals?</h2>
          <p className="text-slate-400">Join wholesalers using FlipFlow to track, analyze, and close faster.</p>
          <button
            onClick={handleAuth}
            className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-10 py-4 rounded-xl text-base transition-all hover:scale-105 inline-flex items-center gap-2"
          >
            Start Free for 7 Days <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-xs text-slate-600 mt-2">No credit card required · Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-4 text-center text-xs text-slate-600">
        2026 FlipFlow Wholesale CRM. All rights reserved.
      </footer>
    </div>
  );
}