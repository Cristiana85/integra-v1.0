import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PrimeblocksModule } from 'src/app/shared/primeblocks.module';
import { AuthService } from 'src/app/shared/services/auth.service';
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
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],  // Password validation
      confirmPassowrd: ['', [Validators.required]]  // Password validation
    },
      { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.registerForm.valueChanges.subscribe(() => {
      this.checkPasswordsMatch();
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassowrd')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  checkPasswordsMatch() {
    const password = this.registerForm.get('password')?.value;
    const confirmPassowrd = this.registerForm.get('confirmPassowrd')?.value;
    this.passwordsMismatch = password !== confirmPassowrd;
  }

  registerUser() {
    if (this.registerForm.valid) {
      console.log(this.registerForm.value);

      this.authService.register(this.registerForm.value).subscribe(
        (response) => {
          this.router.navigate(['/login']);
        },
        (error) => {
          alert('Username already existing');
        }
      );
    }
  }
}
