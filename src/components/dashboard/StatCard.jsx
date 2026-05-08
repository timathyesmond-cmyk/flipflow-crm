import React from 'react';
import { cn } from '@/lib/utils';

export default function StatCard({ label, value, icon: Icon, trend, className }) {
  return (
    <div className={cn(
      "bg-card rounded-2xl p-5 border border-border/60 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300",
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold mt-2 tracking-tight">{value}</p>
          {trend && (
            <p className={cn(
              "text-xs font-medium mt-1",
              trend > 0 ? "text-emerald-600" : "text-red-500"
            )}>
              {trend > 0 ? '+' : ''}{trend}% this month
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-secondary" />
        </div>
      </div>
    </div>
  );
}