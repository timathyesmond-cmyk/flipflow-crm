import React, { useEffect, useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, HandCoins, Users, Map, X, LogOut, Calculator as CalculatorIcon, Settings, Lightbulb, Shield, Building2, HelpCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import GlobalSearch from './GlobalSearch';
import StaleDealsNotification from '@/components/notifications/StaleDealsNotification';

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Deals', path: '/deals', icon: HandCoins },
  { label: 'Contacts', path: '/contacts', icon: Users },
  { label: 'Map', path: '/map', icon: Map },
  { label: 'Calculator', path: '/calculator', icon: CalculatorIcon },
  { label: 'Portfolio', path: '/portfolio', icon: Building2 },
  { label: 'Suggestions', path: '/suggestions', icon: Lightbulb },
  { label: 'Help', path: '/help', icon: HelpCircle },
  { label: 'Settings', path: '/settings', icon: Settings },
];

const ADMIN_EMAIL = 'timathyesmond@gmail.com';

const TIER_LABELS = { basic: 'Basic', wholesale: 'Wholesale', pro: 'Pro', trial: 'Trial' };
const TIER_COLORS = { basic: 'text-blue-400', wholesale: 'text-amber-400', pro: 'text-purple-400', trial: 'text-emerald-400' };

export default function Sidebar({ isOpen, setIsOpen, effectiveTier }) {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    base44.auth.me().then(user => {
      if (user?.email === ADMIN_EMAIL) setIsAdmin(true);
    }).catch(() => {});
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed top-0 left-0 h-full z-50 w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300 ease-out",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="p-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <HandCoins className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white">FlipFlow</h1>
              <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50">Wholesale CRM</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-sidebar-foreground/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pb-2 flex items-center gap-2">
          <div className="flex-1">
            <GlobalSearch />
          </div>
          <StaleDealsNotification />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1 mt-2">
          {navItems.map(item => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-white"
                    : "text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary" />}
              </Link>
            );
          })}
        </nav>

        {/* Admin link — only visible to admin */}
        {isAdmin && (
          <div className="px-3 pb-2">
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                location.pathname === '/admin'
                  ? "bg-sidebar-accent text-white"
                  : "text-sidebar-primary/70 hover:text-sidebar-primary hover:bg-sidebar-accent/50"
              )}
            >
              <Shield className="w-[18px] h-[18px]" />
              Admin
              {location.pathname === '/admin' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary" />}
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border space-y-1">
          <ThemeToggle />
          {effectiveTier && (
            <div className="px-3 py-1.5 flex items-center justify-between">
              <span className="text-xs text-sidebar-foreground/40">Plan</span>
              <span className={`text-xs font-semibold ${TIER_COLORS[effectiveTier] || 'text-sidebar-foreground/60'}`}>
                {TIER_LABELS[effectiveTier] || effectiveTier}
              </span>
            </div>
          )}
          <button
            onClick={() => base44.auth.logout()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/50 hover:text-white hover:bg-sidebar-accent/50 transition-colors w-full"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}