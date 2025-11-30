import { NgModule } from '@angular/core';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
// aggiungi qui altri moduli PrimeNG che ti serviranno (MenubarModule, ecc.)

@NgModule({
  imports: [
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    ButtonModule,
    RippleModule,
  ],
  exports: [
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    ButtonModule,
    RippleModule,
  ],
})
export class PrimengSharedModule {}
