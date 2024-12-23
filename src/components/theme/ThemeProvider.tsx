import { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

type Theme = 'light' | 'dark' | 'corporate' | 'high-contrast';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider = ({
  children,
  defaultTheme = 'light',
}: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const { toast } = useToast();

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    document.documentElement.classList.remove('light', 'dark', 'corporate', 'high-contrast');
    document.documentElement.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
    
    toast({
      title: "Theme updated",
      description: `Theme has been changed to ${newTheme}.`,
    });
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      updateTheme(savedTheme);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};