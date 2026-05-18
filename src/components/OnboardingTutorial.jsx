import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, LayoutDashboard, Handshake, Users, FileDown, UserCheck, GripVertical, Map, Calculator, Lightbulb, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  {
    icon: LayoutDashboard,
    color: 'from-blue-500 to-indigo-600',
    badge: 'Start Here',
    title: 'Welcome to DealFlow CRM 👋',
    description: 'Your command center for wholesale real estate. Everything you need to find, track, and close deals — all in one place.',
    features: [
      'Live pipeline overview with deal counts & profit stats',
      'Charts showing monthly growth and deal distribution',
      'Follow-up reminders so nothing slips through the cracks',
    ],
  },
  {
    icon: Handshake,
    color: 'from-emerald-500 to-teal-600',
    badge: 'Core Feature',
    title: 'Add & Track Deals',
    description: 'Every property you\'re working gets its own deal record. Store all the details — address, financials, seller info, photos, and notes.',
    features: [
      'Click "New Deal" on the Deals page to get started',
      'Enter asking price, offer price, ARV, and repair estimate',
      'Attach property photos and download a PDF summary for buyers',
    ],
  },
  {
    icon: GripVertical,
    color: 'from-violet-500 to-purple-600',
    badge: 'Pipeline',
    title: 'Visual Kanban Board',
    description: 'See all your deals in a drag-and-drop board organized by stage. Move deals forward with a simple drag.',
    features: [
      'Stages: Lead → Contacted → Under Contract → Assigned → Closed',
      'Drag a deal card to any column to update its stage instantly',
      'Switch to List View for a compact spreadsheet-style layout',
    ],
  },
  {
    icon: Users,
    color: 'from-orange-500 to-amber-600',
    badge: 'Contacts',
    title: 'Manage Your Network',
    description: 'Store sellers, buyers, agents, and contractors in one organized contact list. Import in bulk via CSV or add one by one.',
    features: [
      'Filter contacts by type (seller, buyer, agent, contractor)',
      'Click "Email" on any contact to send a pre-written template',
      'See a buyer\'s preferred locations and property types at a glance',
    ],
  },
  {
    icon: UserCheck,
    color: 'from-pink-500 to-rose-600',
    badge: 'Buyers',
    title: 'Buyer Profiles & Matching',
    description: 'Set up detailed preference profiles for each buyer — then instantly find which deals match their criteria.',
    features: [
      'Set preferred property types, locations, price range, and deal types',
      'Click the ✨ Sparkles icon on a buyer card to see matching deals',
      'Color-coded preference tags make scanning your buyer list fast',
    ],
  },
  {
    icon: Map,
    color: 'from-cyan-500 to-sky-600',
    badge: 'Map',
    title: 'Interactive Deals Map',
    description: 'Visualize all your deals on a live map. Color-coded markers show each deal\'s stage at a glance.',
    features: [
      'Every deal is geocoded and plotted by property address',
      'Click any marker to see deal details and a quick link',
      'Great for spotting clusters of activity in target neighborhoods',
    ],
  },
  {
    icon: Calculator,
    color: 'from-slate-500 to-zinc-600',
    badge: 'Tools',
    title: 'Deal Calculators',
    description: 'Run the numbers on any deal before you make an offer. Four specialized calculators cover every acquisition strategy.',
    features: [
      'MAO / Wholesale: find your Maximum Allowable Offer and assignment fee instantly',
      'Subject-To & Seller Finance: model mortgage takeovers and carryback financing',
      'Hybrid: combine Sub-2 + seller carryback into one deal structure',
    ],
  },
  {
    icon: FileDown,
    color: 'from-indigo-500 to-violet-600',
    badge: 'Contracts',
    title: 'Contract Templates',
    description: 'Generate ready-to-sign contracts right inside the app. Fill in the details and download a professional PDF in seconds.',
    features: [
      'Purchase Agreement: assignable contract with all key terms and signature lines',
      'Assignment Contract: transfer your equitable interest to an end buyer with a built-in assignment fee',
      'Both templates include a legal disclaimer — always review with your attorney',
    ],
  },
  {
    icon: Lightbulb,
    color: 'from-yellow-500 to-amber-500',
    badge: 'Community',
    title: 'Share Your Ideas',
    description: 'Have a suggestion to make DealFlow better? Submit it on the Suggestions page and vote on ideas from other users.',
    features: [
      'Submit feature requests, improvements, or bug reports',
      'Upvote ideas you want to see built',
      'Track the status of suggestions (Pending → Planned → Completed)',
    ],
  },
];

const STORAGE_KEY = 'wholesale_crm_tutorial_v3_dismissed';

export default function OnboardingTutorial() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  const goTo = (i) => {
    setDirection(i > step ? 1 : -1);
    setStep(i);
  };

  const next = () => { if (step < STEPS.length - 1) goTo(step + 1); else dismiss(); };
  const prev = () => { if (step > 0) goTo(step - 1); };

  if (!visible) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Gradient header */}
        <div className={cn('bg-gradient-to-br p-6 pb-8 relative', current.color)}>
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-white/20 text-white px-2.5 py-1 rounded-full mb-3">
            {current.badge}
          </span>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white leading-tight">{current.title}</h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 -mt-4">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ x: direction * 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction * -40, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{current.description}</p>
              <ul className="space-y-2.5">
                {current.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex flex-col gap-4">
          {/* Step dots */}
          <div className="flex items-center justify-center gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === step ? 'w-6 bg-primary' : 'w-1.5 bg-muted hover:bg-primary/40'
                )}
              />
            ))}
          </div>

          {/* Nav buttons */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={prev} disabled={step === 0} className="gap-1 text-xs">
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </Button>
            <span className="text-xs text-muted-foreground">{step + 1} of {STEPS.length}</span>
            <Button size="sm" onClick={next} className="gap-1 text-xs">
              {isLast ? (
                <><Sparkles className="w-3.5 h-3.5" /> Get Started</>
              ) : (
                <>Next <ChevronRight className="w-3.5 h-3.5" /></>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}