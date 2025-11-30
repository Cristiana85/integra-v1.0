import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ThemeService } from '../../services/core/theme.service';

@Component({
  selector: 'integra-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './integra-topbar.component.html',
  styleUrls: ['./integra-topbar.component.scss'],
})
export class IntegraTopbarComponent {
  mobileMenuOpen = false;

  // lo rendo public così lo puoi usare anche direttamente nel template se vuoi
  constructor(public router: Router, public theme: ThemeService) {}

  get isLight(): boolean {
    return this.theme.isLight;
  }

  toggleTheme(): void {
    this.theme.toggleTheme();
  }

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
    } else {
      this.router.navigate(['/'], { fragment: sectionId });
    }
  }

  goToSectionAndClose(sectionId: string): void {
    this.closeMobileMenu();
    this.scrollToSection(sectionId);
  }

  isAuthPage(): boolean {
    return (
      this.router.url.startsWith('/login') ||
      this.router.url.startsWith('/register')
    );
  }
}
