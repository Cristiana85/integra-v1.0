import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { IntegraTopbarComponent } from '../../shared/components/integra-topbar/integra-topbar.component';
import { PrimengSharedModule } from '../../shared/primeng-shared/primeng-shared.module';

@Component({
  selector: 'register-page',
  standalone: true,
  imports: [RouterModule, IntegraTopbarComponent, PrimengSharedModule],
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss'],
})
export class RegisterPageComponent {}
