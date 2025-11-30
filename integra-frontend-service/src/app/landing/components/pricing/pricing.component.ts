import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IntegraTopbarComponent } from '../../../shared/components/integra-topbar/integra-topbar.component';

@Component({
  selector: 'integra-pricing',
  standalone: true,
  imports: [CommonModule, RouterModule, IntegraTopbarComponent],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss'],
})
export class PricingComponent {
  billingMode: 'monthly' | 'yearly' = 'monthly';

  setBillingMode(mode: 'monthly' | 'yearly'): void {
    this.billingMode = mode;
  }
}
