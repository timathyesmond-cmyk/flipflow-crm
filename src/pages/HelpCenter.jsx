import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Square, PlayCircle, BookOpen, ExternalLink, CheckCircle2 } from 'lucide-react';

const VIDEO_GUIDES = [
  {
    id: 1,
    title: 'How to Find Your First Wholesale Deal',
    duration: '~10 min',
    topic: 'Getting Started',
    color: 'emerald',
    description: 'Learn the basics of finding motivated sellers and off-market properties.',
    searchQuery: 'how to find first wholesale real estate deal beginners',
  },
  {
    id: 2,
    title: 'Running the Numbers: MAO Formula',
    duration: '~8 min',
    topic: 'Calculators',
    color: 'blue',
    description: 'Understand how to calculate your Maximum Allowable Offer so you never overpay.',
    searchQuery: 'maximum allowable offer formula real estate wholesaling',
  },
  {
    id: 3,
    title: 'How to Talk to Motivated Sellers',
    duration: '~12 min',
    topic: 'Deals',
    color: 'purple',
    description: 'Scripts and strategies for your first seller conversation.',
    searchQuery: 'how to talk to motivated sellers wholesale real estate scripts',
  },
  {
    id: 4,
    title: 'Building Your Cash Buyer List',
    duration: '~9 min',
    topic: 'Contacts',
    color: 'amber',
    description: 'Where to find cash buyers and how to add them to your pipeline.',
    searchQuery: 'how to find cash buyers wholesale real estate',
  },
  {
    id: 5,
    title: 'Assignment Contract Walkthrough',
    duration: '~7 min',
    topic: 'Contracts',
    color: 'rose',
    description: 'Step-by-step walkthrough of filling out an assignment of contract.',
    searchQuery: 'assignment of contract wholesale real estate walkthrough',
  },
  {
    id: 6,
    title: 'Closing Your First Deal',
    duration: '~11 min',
    topic: 'Closing',
    color: 'teal',
    description: 'What happens at closing and how to get paid your assignment fee.',
    searchQuery: 'how to close wholesale real estate deal assignment fee',
  },
];

const TOPIC_COLORS = {
  emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
  teal: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
};

const ICON_COLORS = {
  emerald: 'text-emerald-500',
  blue: 'text-blue-500',
  purple: 'text-purple-500',
  amber: 'text-amber-500',
  rose: 'text-rose-500',
  teal: 'text-teal-500',
};

const CHECKLIST_ITEMS = [
  { id: 'education', label: 'Study the MAO formula and run practice numbers', category: 'Prep' },
  { id: 'market', label: 'Pick your target market (city/zip codes)', category: 'Prep' },
  { id: 'buyers', label: 'Build a list of at least 5 cash buyers', category: 'Prep' },
  { id: 'bandit', label: 'Drive for dollars or set up a direct mail campaign', category: 'Marketing' },
  { id: 'leads', label: 'Generate your first motivated seller lead', category: 'Marketing' },
  { id: 'call', label: 'Make your first seller phone call', category: 'Outreach' },
  { id: 'appointment', label: 'Schedule a property walkthrough appointment', category: 'Outreach' },
  { id: 'inspect', label: 'Walk the property and estimate repairs', category: 'Due Diligence' },
  { id: 'comps', label: 'Pull comps and calculate ARV', category: 'Due Diligence' },
  { id: 'offer', label: 'Submit your first written offer', category: 'Offer' },
  { id: 'contract', label: 'Get the purchase agreement signed', category: 'Offer' },
  { id: 'market-deal', label: 'Send the deal to your cash buyer list', category: 'Closing' },
  { id: 'assign', label: 'Negotiate and sign an assignment contract', category: 'Closing' },
  { id: 'title', label: 'Open escrow / work with a title company', category: 'Closing' },
  { id: 'paid', label: 'Collect your assignment fee at closing 🎉', category: 'Closing' },
];

const CATEGORY_ORDER = ['Prep', 'Marketing', 'Outreach', 'Due Diligence', 'Offer', 'Closing'];
const CATEGORY_COLORS_MAP = {
  Prep: 'text-blue-600 dark:text-blue-400',
  Marketing: 'text-purple-600 dark:text-purple-400',
  Outreach: 'text-amber-600 dark:text-amber-400',
  'Due Diligence': 'text-rose-600 dark:text-rose-400',
  Offer: 'text-emerald-600 dark:text-emerald-400',
  Closing: 'text-teal-600 dark:text-teal-400',
};

export default function HelpCenter() {
  const [checked, setChecked] = useState(() => {
    const saved = localStorage.getItem('firstDealChecklist');
    return saved ? JSON.parse(saved) : {};
  });

  const toggle = (id) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    localStorage.setItem('firstDealChecklist', JSON.stringify(next));
  };

  const completedCount = Object.values(checked).filter(Boolean).length;
  const totalCount = CHECKLIST_ITEMS.length;
  const pct = Math.round((completedCount / totalCount) * 100);

  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = CHECKLIST_ITEMS.filter(i => i.category === cat);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background max-w-5xl mx-auto space-y-10 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Help Center</h1>
        <p className="text-muted-foreground text-sm mt-1">Video guides, tips, and your first deal checklist.</p>
      </div>

      {/* Video Walkthroughs */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <PlayCircle className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Video Walkthroughs</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {VIDEO_GUIDES.map(v => (
            <Card
              key={v.id}
              className="hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(v.searchQuery)}`, '_blank')}
            >
              <CardContent className="pt-4 pb-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className={`w-10 h-10 rounded-xl ${TOPIC_COLORS[v.color]} flex items-center justify-center flex-shrink-0`}>
                    <PlayCircle className={`w-5 h-5 ${ICON_COLORS[v.color]}`} />
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                </div>
                <div>
                  <p className="font-semibold text-sm leading-snug">{v.title}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge className={`text-[10px] ${TOPIC_COLORS[v.color]}`}>{v.topic}</Badge>
                    <span className="text-[10px] text-muted-foreground">{v.duration}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{v.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" />
          Clicking a card searches YouTube for the best matching tutorial.
        </p>
      </section>

      {/* First Deal Checklist */}
      <section>
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">First Deal Checklist</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Track your progress from zero to your first assignment fee. Your progress is saved automatically.</p>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>{completedCount} of {totalCount} steps complete</span>
            <span className="font-semibold text-foreground">{pct}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="space-y-6">
          {CATEGORY_ORDER.map(cat => (
            <div key={cat}>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${CATEGORY_COLORS_MAP[cat]}`}>{cat}</h3>
              <div className="space-y-1.5">
                {grouped[cat].map(item => (
                  <button
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/60 transition-colors text-left group"
                  >
                    {checked[item.id]
                      ? <CheckSquare className="w-4 h-4 text-primary flex-shrink-0" />
                      : <Square className="w-4 h-4 text-muted-foreground group-hover:text-foreground flex-shrink-0 transition-colors" />
                    }
                    <span className={`text-sm ${checked[item.id] ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {pct === 100 && (
          <div className="mt-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 text-center">
            <p className="text-emerald-700 dark:text-emerald-300 font-semibold text-sm">🎉 You closed your first deal! Time to scale up.</p>
          </div>
        )}
      </section>
    </div>
  );
}