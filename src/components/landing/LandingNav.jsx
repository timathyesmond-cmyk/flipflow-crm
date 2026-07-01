import { useState } from 'react';
import { HandCoins, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import LandingThemeToggle from './LandingThemeToggle';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact', href: '#contact' },
];

export default function LandingNav({ onAuth }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (href) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0d1b2e]/80 backdrop-blur-lg border-b border-slate-200/60 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
            <HandCoins className="w-4 h-4 text-slate-900" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">FlipFlow</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest hidden sm:block ml-1">Wholesale CRM</span>
        </a>

        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ label, href }) => (
            <button
              key={href}
              onClick={() => scrollTo(href)}
              className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LandingThemeToggle />
          <button
            onClick={onAuth}
            className="hidden sm:block text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-3 py-1.5"
          >
            Log In
          </button>
          <button
            onClick={onAuth}
            className="hidden sm:block text-sm bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-4 py-1.5 rounded-lg transition-colors"
          >
            Start Free Trial
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-slate-200/60 dark:border-white/5 bg-white/95 dark:bg-[#0d1b2e]/95 overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                <button
                  key={href}
                  onClick={() => scrollTo(href)}
                  className="text-left text-sm text-slate-700 dark:text-slate-300 hover:text-amber-500 py-2.5 px-2 rounded-lg transition-colors"
                >
                  {label}
                </button>
              ))}
              <div className="border-t border-slate-200/60 dark:border-white/5 mt-2 pt-3 flex flex-col gap-2">
                <button onClick={onAuth} className="text-sm text-slate-600 dark:text-slate-300 py-2 px-2 text-left">
                  Log In
                </button>
                <button
                  onClick={onAuth}
                  className="text-sm bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-4 py-2.5 rounded-lg transition-colors"
                >
                  Start Free Trial
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}