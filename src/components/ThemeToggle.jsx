import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

const options = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'system', icon: Monitor, label: 'System' },
  { value: 'dark', icon: Moon, label: 'Dark' },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 px-3 py-1.5">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          title={label}
          onClick={() => setTheme(value)}
          className={cn(
            'flex-1 flex items-center justify-center py-1 rounded-md transition-colors text-xs gap-1',
            theme === value
              ? 'bg-sidebar-accent text-white'
              : 'text-sidebar-foreground/40 hover:text-sidebar-foreground/80'
          )}
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  );
}