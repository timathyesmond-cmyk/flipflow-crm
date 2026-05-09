import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, LayoutDashboard, Handshake, Users, FileDown, UserCheck, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    icon: LayoutDashboard,
    title: 'Welcome to your Wholesale CRM',
    description: 'This is your Dashboard — a real-time overview of your deal pipeline. You\'ll see total deals, active deals, profit stats, and charts at a glance.',
    tip: 'Check this page daily to stay on top of your pipeline.',
  },
  {
    icon: Handshake,
    title: 'Manage Deals',
    description: 'Head to Deals to add and track every property. Use the Kanban board to drag deals between stages (Lead → Contacted → Under Contract → Closed) or switch to list view.',
    tip: 'Click "New Deal" to add your first property with address, financials, seller info, and more.',
  },
  {
    icon: GripVertical,
    title: 'Drag & Drop Pipeline',
    description: 'On the Deals board, simply drag a deal card and drop it into a new stage column. The stage updates instantly — no clicking required.',
    tip: 'Use filters at the top to focus on specific stages, deal types, or cities.',
  },
  {
    icon: Users,
    title: 'Manage Contacts',
    description: 'Use the Contacts page to store sellers, buyers, agents, and contractors. You can import contacts in bulk via CSV, or add them one by one.',
    tip: 'From a deal\'s detail page, click Email next to any contact to send a pre-written follow-up email.',
  },
  {
    icon: UserCheck,
    title: 'Buyer Profiles',
    description: 'For investor/buyer contacts, click the blue profile icon (✓) on their card to set their preferred property types, locations, deal types, price range, and more.',
    tip: 'Saved preferences appear as color-coded tags on each buyer card so you can match deals instantly.',
  },
  {
    icon: FileDown,
    title: 'Generate PDF Summaries',
    description: 'On any deal\'s detail page, click the PDF button in the header to download a clean property summary — perfect for sending to potential buyers.',
    tip: 'The PDF includes property details, financials, estimated profit, and your notes.',
  },
];

const STORAGE_KEY = 'wholesale_crm_tutorial_dismissed';

export default function OnboardingTutorial() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="bg-gradient-to-br from-primary/5 to-secondary/10 border border-primary/20 rounded-2xl p-5 relative">
      {/* Dismiss */}
      <button
        onClick={dismiss}
        className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title="Dismiss tutorial"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Step dots */}
      <div className="flex items-center gap-1.5 mb-4">
        {STEPS.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={cn(
              'h-1.5 rounded-full transition-all',
              i === step ? 'w-6 bg-primary' : 'w-1.5 bg-primary/25 hover:bg-primary/40'
            )}
          />
        ))}
        <span className="ml-2 text-xs text-muted-foreground">{step + 1} / {STEPS.length}</span>
      </div>

      {/* Content */}
      <div className="flex gap-4 items-start">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground mb-1">{current.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{current.description}</p>
          <div className="mt-2.5 flex items-start gap-1.5 bg-secondary/20 rounded-lg px-3 py-2">
            <span className="text-xs">💡</span>
            <p className="text-xs text-muted-foreground">{current.tip}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setStep(s => s - 1)}
          disabled={isFirst}
          className="gap-1 text-xs"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back
        </Button>
        {isLast ? (
          <Button size="sm" onClick={dismiss} className="text-xs gap-1">
            Get Started <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        ) : (
          <Button size="sm" onClick={() => setStep(s => s + 1)} className="text-xs gap-1">
            Next <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}