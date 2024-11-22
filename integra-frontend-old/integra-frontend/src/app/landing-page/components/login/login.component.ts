import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isSubmitted = false;
  loginError: string | null = null;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.isSubmitted = true;
    this.loginError = null;

    if (this.loginForm.invalid) {
      return;
    }

    const { email, password } = this.loginForm.value;
    console.log('Login attempt:', email, password);

    // Simula un login (in un'app reale, chiama un'API di autenticazione)
    if (email === 'test@example.com' && password === 'password123') {
      alert('Login riuscito!');
      // Esegui la navigazione o altre azioni di successo qui
    } else {
      this.loginError = 'Email o password non corretti.';
    }
  }
}
