import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { PrimeblocksModule } from 'src/app/shared/primeblocks.module';
import { AuthService } from 'src/app/shared/services/auth.service.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    PrimeblocksModule,
    ReactiveFormsModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  public registerForm: FormGroup;
  passwordsMismatch: boolean = false;

  constructor(
    private fb: FormBuilder,  // Using FormBuilder for easier form creation
    private authService: AuthService,
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password1: ['', [Validators.required, Validators.minLength(8)]],  // Password validation
      password2: ['', [Validators.required]]  // Password validation
    },
      { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.registerForm.valueChanges.subscribe(() => {
      this.checkPasswordsMatch();
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password1')?.value;
    const confirmPassword = control.get('password2')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  checkPasswordsMatch() {
    const password1 = this.registerForm.get('password1')?.value;
    const password2 = this.registerForm.get('password2')?.value;
    this.passwordsMismatch = password1 !== password2;
  }

  registerUser() {
    if (this.registerForm.valid) {
      console.log(this.registerForm.value);  // Optionally log the form values for debugging

      this.authService.register(this.registerForm.value).subscribe(
        (response) => {
          alert('Login effettuato con successo');
        },
        (error) => {
          alert('Credenziali non valide');
        }
      );
    }
  }
}
