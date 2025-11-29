import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IntegraTopbarComponent } from '../../shared/components/integra-topbar/integra-topbar.component';

@Component({
  selector: 'auth-page',
  standalone: true,
  imports: [IntegraTopbarComponent, RouterModule],
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.scss'],
})
export class AuthPageComponent {}
