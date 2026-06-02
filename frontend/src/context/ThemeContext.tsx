import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'black-gold';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (isSuperAdmin?: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('rks_theme') as Theme | null;
    if (saved === 'light' || saved === 'dark' || saved === 'black-gold') return saved;
    return 'light'; // default theme
  });

  useEffect(() => {
    localStorage.setItem('rks_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = (isSuperAdmin: boolean = false) => {
    setTheme(prev => {
      if (prev === 'dark') return isSuperAdmin ? 'black-gold' : 'light';
      if (prev === 'black-gold') return 'light';
      return 'dark'; // prev === 'light'
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
