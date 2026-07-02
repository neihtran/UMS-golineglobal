import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  primaryColor: string;
  sidebarCollapsed: boolean;

  setMode: (mode: ThemeMode) => void;
  setPrimaryColor: (color: string) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isDark: () => boolean;
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',
      primaryColor: '#1E3A5F',
      sidebarCollapsed: false,

      setMode: (mode) => {
        set({ mode });
        applyTheme(mode);
      },

      setPrimaryColor: (primaryColor) => set({ primaryColor }),

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

      isDark: () => {
        const mode = get().mode;
        return mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      },
    }),
    {
      name: 'ums-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.mode);
        }
      },
    }
  )
);

// Apply theme on initial load
applyTheme(useThemeStore.getState().mode);
