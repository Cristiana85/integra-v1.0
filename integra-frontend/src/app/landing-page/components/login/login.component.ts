import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimeblocksModule } from 'src/app/shared/primeblocks.module';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SharedModule } from '../../../shared/shared.module';
import { Router } from '@angular/router';  // importa Router
import { ProjectService } from 'src/app/editor/services/project.service';

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
    private projectService: ProjectService,
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
      this.authService.login(this.loginForm.value).subscribe(
        (response) => {
          this.router.navigate(['/editor']);
        },
        (error) => {
          console.error('Login failed:', error);
        }
      );
    }
  }

  onForgotPasswordClick() {
    this.router.navigate(['/forgot-password']);  // naviga al componente forgot-password
  }
}

