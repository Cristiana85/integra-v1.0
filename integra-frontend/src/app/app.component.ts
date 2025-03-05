import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { SharedModule } from './shared/shared.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, SharedModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  title = 'integra-frontend';

}
