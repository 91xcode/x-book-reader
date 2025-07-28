import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeState {
  themeMode: ThemeMode;
  themeColor: string;
  systemIsDarkMode: boolean;
  isDarkMode: boolean;
  getIsDarkMode: () => boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setThemeColor: (color: string) => void;
}

const getInitialThemeMode = (): ThemeMode => {
  if (typeof window !== 'undefined' && localStorage) {
    const stored = localStorage.getItem('themeMode') as ThemeMode;
    if (stored && ['light', 'dark', 'auto'].includes(stored)) {
      return stored;
    }
  }
  return 'auto';
};

const getInitialThemeColor = (): string => {
  if (typeof window !== 'undefined' && localStorage) {
    const stored = localStorage.getItem('themeColor');
    if (stored) {
      return stored;
    }
  }
  return 'default';
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => {
      const initialThemeMode = getInitialThemeMode();
      const initialThemeColor = getInitialThemeColor();
      const systemIsDarkMode =
        typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDarkMode =
        initialThemeMode === 'dark' || (initialThemeMode === 'auto' && systemIsDarkMode);

      if (typeof window !== 'undefined') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemThemeChange = () => {
          const mode = get().themeMode;
          const isDarkMode = mode === 'dark' || (mode === 'auto' && mediaQuery.matches);
          set({ systemIsDarkMode: mediaQuery.matches, isDarkMode });
        };

        mediaQuery.addEventListener('change', handleSystemThemeChange);
      }

      return {
        themeMode: initialThemeMode,
        themeColor: initialThemeColor,
        systemIsDarkMode,
        isDarkMode,
        getIsDarkMode: () => get().isDarkMode,
        setThemeMode: (mode: ThemeMode) => {
          if (typeof window !== 'undefined' && localStorage) {
            localStorage.setItem('themeMode', mode);
          }
          const isDarkMode = mode === 'dark' || (mode === 'auto' && get().systemIsDarkMode);
          document.documentElement.setAttribute(
            'data-theme',
            `${get().themeColor}-${isDarkMode ? 'dark' : 'light'}`,
          );
          set({ themeMode: mode, isDarkMode });
        },
        setThemeColor: (color: string) => {
          if (typeof window !== 'undefined' && localStorage) {
            localStorage.setItem('themeColor', color);
          }
          document.documentElement.setAttribute(
            'data-theme',
            `${color}-${get().isDarkMode ? 'dark' : 'light'}`,
          );
          set({ themeColor: color });
        },
      };
    },
    {
      name: 'theme-store',
      partialize: (state) => ({
        themeMode: state.themeMode,
        themeColor: state.themeColor,
      }),
    }
  )
); 