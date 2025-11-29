import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

const THEME_KEY = 'integra-theme'; // 'dark' | 'light'

@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** true = tema chiaro attivo, false = tema scuro */
  isLight = false;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    const isBrowser = isPlatformBrowser(this.platformId);

    // ⚠️ ATTENZIONE: qui usiamo localStorage SOLO se siamo nel browser
    if (isBrowser) {
      const saved = localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null;
      this.isLight = saved === 'light';
    } else {
      // lato server: default dark, niente localStorage
      this.isLight = false;
    }

    this.applyTheme(this.isLight ? 'light' : 'dark');
  }

  toggleTheme(): void {
    this.isLight = !this.isLight;
    const theme: 'light' | 'dark' = this.isLight ? 'light' : 'dark';
    this.applyTheme(theme);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(THEME_KEY, theme);
    }
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    const body = this.document.body;

    // usiamo la tua classe .theme-light per cambiare le CSS var globali
    if (theme === 'light') {
      body.classList.add('theme-light');
    } else {
      body.classList.remove('theme-light');
    }
  }
}
