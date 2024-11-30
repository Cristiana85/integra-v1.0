import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PrimeblocksModule } from 'src/app/shared/primeblocks.module';
import { AuthService } from 'src/app/shared/services/auth.service.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-reset.password',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    PrimeblocksModule,
    ReactiveFormsModule
  ],
  templateUrl: './reset.password.component.html',
  styleUrl: './reset.password.component.scss'
})
export class ResetPasswordComponent implements OnInit {

  public resetPasswordForm: FormGroup;
  token: string | null = null;
  passwordsMismatch: boolean = false;

  constructor(
    private fb: FormBuilder,  // Using FormBuilder for easier form creation
    private authService: AuthService,
    private route: ActivatedRoute,
  ) {
    this.resetPasswordForm = this.fb.group({
      password1: ['', [Validators.required, Validators.minLength(8)]],  // Password validation
      password2: ['', [Validators.required]]  // Password validation
    },
      { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    this.resetPasswordForm.valueChanges.subscribe(() => {
      this.checkPasswordsMatch();
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password1')?.value;
    const confirmPassword = control.get('password2')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  checkPasswordsMatch() {
    const password1 = this.resetPasswordForm.get('password1')?.value;
    const password2 = this.resetPasswordForm.get('password2')?.value;
    this.passwordsMismatch = password1 !== password2;
  }

  resetPassword() {
    if (this.resetPasswordForm.valid && this.token) {
      this.authService.resetPassword(this.resetPasswordForm.value).subscribe(
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
