import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  mode: 'login' | 'register' = 'login'; // 👈 toggla login/register

  email = '';
  password = '';

  registerName = '';
  registerSurname = '';
  registerEmail = '';
  registerPassword = '';
  registerPassword2 = '';

  constructor(private router: Router) {}

  login(): void {
    if (this.email && this.password) {
      this.router.navigate(['/workspace']);
    }
  }

  register(): void {
    if (
      !this.registerEmail ||
      !this.registerPassword ||
      !this.registerPassword2
    )
      return;

    if (this.registerPassword !== this.registerPassword2) {
      alert('Le password non coincidono!');
      return;
    }

    // Simulazione registrazione
    console.log('Registrazione ok:', this.registerEmail);

    // rientra nel login
    this.email = this.registerEmail;
    this.mode = 'login';
  }
}
