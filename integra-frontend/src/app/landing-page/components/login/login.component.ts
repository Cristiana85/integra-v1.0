import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { PrimeblocksModule } from 'src/app/shared/primeblocks.module';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'integra-login',
  standalone: true,
  imports: [
    SharedModule,
    PrimeblocksModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  features: any[];

  ngOnInit() {
    this.features = [
      { title: 'Unlimited Inbox', image: 'live-collaboration.svg', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
      { title: 'Data Security', image: 'security.svg', text: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' },
      { title: 'Cloud Backup Williams', image: 'subscribe.svg', text: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' }
    ];
  }
}

