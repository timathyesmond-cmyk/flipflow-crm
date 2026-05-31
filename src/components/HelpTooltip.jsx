import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function HelpTooltip({ text, className = '' }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center cursor-help text-muted-foreground hover:text-foreground transition-colors ${className}`}>
            <HelpCircle className="w-3.5 h-3.5" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[220px] text-xs">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}