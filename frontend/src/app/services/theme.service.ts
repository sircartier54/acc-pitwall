import { Injectable, signal, computed, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'acc-pitwall-theme';

  // Initialize theme from localStorage or device system preference
  public readonly theme = signal<Theme>(this.getInitialTheme());
  public readonly isDark = computed(() => this.theme() === 'dark');

  constructor() {
    // Keep DOM document element in sync with the theme signal
    effect(() => {
      const currentTheme = this.theme();
      this.applyThemeToDocument(currentTheme);
    });

    this.listenToSystemPreferenceChanges();
  }

  public toggle(): void {
    const nextTheme: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  public setTheme(theme: Theme): void {
    this.theme.set(theme);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(this.storageKey, theme);
      } catch (e) {
        console.warn('[ThemeService] Unable to save theme to localStorage:', e);
      }
    }
  }

  private getInitialTheme(): Theme {
    if (typeof window === 'undefined') {
      return 'dark';
    }

    try {
      const savedTheme = localStorage.getItem(this.storageKey);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
    } catch {
      // localStorage may be unavailable or restricted
    }

    // Default to device / OS setting
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  private applyThemeToDocument(theme: Theme): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.classList.remove('theme-light', 'theme-dark');
    root.classList.add(`theme-${theme}`);
  }

  private listenToSystemPreferenceChanges(): void {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      // Only auto-update if the user has not explicitly set a manual preference in localStorage
      let hasManualOverride = false;
      try {
        hasManualOverride = localStorage.getItem(this.storageKey) !== null;
      } catch {
        // Fall back to following system changes
      }

      if (!hasManualOverride) {
        this.theme.set(e.matches ? 'dark' : 'light');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      // Fallback for older browsers
      (mediaQuery as any).addListener(handler);
    }
  }
}
