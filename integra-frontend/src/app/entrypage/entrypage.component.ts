import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
  standalone: true,
  selector: 'app-entrypage',
  imports: [RouterModule, ButtonModule, RippleModule], // <-- QUI
  templateUrl: './entrypage.component.html',
  styleUrls: ['./entrypage.component.scss'],
})
export class EntrypageComponent {}
