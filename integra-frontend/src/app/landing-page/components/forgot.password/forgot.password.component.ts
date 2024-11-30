import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrimeblocksModule } from 'src/app/shared/primeblocks.module';
import { AuthService } from 'src/app/shared/services/auth.service.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'integra-forgot.password',
  standalone: true,
  imports: [
    SharedModule,
    FormsModule,
    PrimeblocksModule,
    ReactiveFormsModule
  ],
  templateUrl: './forgot.password.component.html',
  styleUrl: './forgot.password.component.scss'
})
export class ForgotPasswordComponent implements OnInit {
  public forgotPasswordForm: FormGroup;

  constructor(
    private fb: FormBuilder,  // Using FormBuilder for easier form creation
    private loginService: AuthService
  ) { }

  ngOnInit(): void {
    // Initialize the form with FormBuilder
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],  // Email validation
    });
  }

  forgotPassword() {
    if (this.forgotPasswordForm.valid) {
      console.log(this.forgotPasswordForm.value);  // Optionally log the form values for debugging

      this.loginService.forgotPassword(this.forgotPasswordForm.value).subscribe(
        (response) => {
          alert('Link forgot passowrd inviato');
        },
        (error) => {
          alert('Utente non trovato');
        }
      );
    }
  }
}
