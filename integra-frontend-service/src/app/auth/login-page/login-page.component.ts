import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IntegraTopbarComponent } from '../../shared/components/integra-topbar/integra-topbar.component';
import { PrimengSharedModule } from '../../shared/primeng-shared/primeng-shared.module';

@Component({
  selector: 'login-page',
  standalone: true,
  imports: [RouterModule, IntegraTopbarComponent, PrimengSharedModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent {}
