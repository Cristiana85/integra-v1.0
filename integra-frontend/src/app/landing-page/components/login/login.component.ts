import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimeblocksModule } from 'src/app/shared/primeblocks.module';
import { AuthService } from 'src/app/shared/services/auth.service.service';
import { SharedModule } from '../../../shared/shared.module';
import { Router } from '@angular/router';  // importa Router

@Component({
  selector: 'integra-login',
  standalone: true,
  imports: [
    SharedModule,
    FormsModule,
    PrimeblocksModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,  // Using FormBuilder for easier form creation
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Initialize the form with FormBuilder
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],  // Email validation
      password: ['', [Validators.required]]  // Password validation
    });
  }

  loginUser() {
    if (this.loginForm.valid) {
      console.log(this.loginForm.value);  // Optionally log the form values for debugging

      this.authService.login(this.loginForm.value).subscribe(
        (response) => {
          alert('Login effettuato con successo');
        },
        (error) => {
          alert('Credenziali non valide');
        }
      );
    }
  }

  onForgotPasswordClick() {
    this.router.navigate(['/forgot-password']);  // naviga al componente forgot-password
  }
}

