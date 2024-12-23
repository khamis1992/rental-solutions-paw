import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Moon, Sun, Palette, Eye } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { name: 'light', icon: Sun, label: 'Light' },
    { name: 'dark', icon: Moon, label: 'Dark' },
    { name: 'corporate', icon: Palette, label: 'Corporate' },
    { name: 'high-contrast', icon: Eye, label: 'High Contrast' },
  ] as const;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          {theme === 'dark' && <Moon className="h-5 w-5" />}
          {theme === 'light' && <Sun className="h-5 w-5" />}
          {theme === 'corporate' && <Palette className="h-5 w-5" />}
          {theme === 'high-contrast' && <Eye className="h-5 w-5" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map(({ name, icon: Icon, label }) => (
          <DropdownMenuItem
            key={name}
            onClick={() => setTheme(name)}
            className="flex items-center gap-2"
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};