import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  isLight = false;

  constructor() {
    this.safeInitTheme();
  }

  /**
   * Evita errori SSR: controlla se sei nel browser
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  /**
   * Inizializza tema in modo SSR-safe
   */
  private safeInitTheme(): void {
    if (!this.isBrowser()) {
      // Siamo in SSR → NON accediamo a localStorage
      this.isLight = false; // default tema scuro
      return;
    }

    const saved = localStorage.getItem('integra-theme');
    this.isLight = saved === 'light';

    this.applyTheme();
  }

  /**
   * Applica attributo data-theme
   */
  private applyTheme(): void {
    document.documentElement.setAttribute(
      'data-theme',
      this.isLight ? 'light' : 'dark'
    );
  }

  /**
   * Toggle tema + salvataggio
   */
  toggleTheme(): void {
    this.isLight = !this.isLight;

    if (this.isBrowser()) {
      localStorage.setItem('integra-theme', this.isLight ? 'light' : 'dark');
    }

    this.applyTheme();
  }
}
