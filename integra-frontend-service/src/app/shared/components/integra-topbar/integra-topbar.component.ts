import { Component, Inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DOCUMENT, NgClass, NgIf } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'integra-topbar',
  standalone: true,
  templateUrl: './integra-topbar.component.html',
  styleUrls: ['./integra-topbar.component.scss'],

  // ⬇️ IMPORT IMPORTANTI per standalone
  imports: [RouterModule, NgClass, NgIf],
})
export class IntegraTopbarComponent {
  mobileMenuOpen = false;
  isLight = false;

  constructor(private router: Router) {}

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  scrollToSection(sectionId: string): void {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  goToSectionAndClose(sectionId: string): void {
    this.closeMobileMenu();
    this.scrollToSection(sectionId);
  }

  toggleTheme(): void {
    this.isLight = !this.isLight;
    document.body.classList.toggle('integra-light-theme', this.isLight);
  }
}
