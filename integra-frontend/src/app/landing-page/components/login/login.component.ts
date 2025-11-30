import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PrimeblocksModule } from 'src/app/shared/primeblocks.module';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SharedModule } from '../../../shared/shared.module';
import { Router } from '@angular/router'; // importa Router
<<<<<<< HEAD
//import { ProjectService } from 'src/app/editor/services/project.service';
=======
import { ProjectService } from 'src/app/integra/editor/services/project.service';
>>>>>>> feature/diagram

@Component({
  selector: 'integra-login',
  standalone: true,
  imports: [SharedModule, FormsModule, PrimeblocksModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  email: string = ''; // Nuova variabile per l'email
  password: string = ''; // Nuova variabile per la password

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/workspace']); // ✅ Se già loggato, vai in homepage
    }
  }

  loginUser() {
    if (this.email && this.password) {
      // Controllo che i campi non siano vuoti
      const loginData = { email: this.email, password: this.password };

      this.authService.login(loginData).subscribe(
        (response) => {
          this.router.navigate(['/workspace']);
        },
        (error) => {
          alert('Invalid username or password');
        }
      );
    } else {
      alert('Please enter both email and password.');
    }
  }

  onForgotPasswordClick() {
    this.router.navigate(['/forgot-password']);
  }
}
