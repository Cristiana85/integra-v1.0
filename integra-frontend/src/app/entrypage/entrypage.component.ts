import { Component } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-entrypage',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './entrypage.component.html',
  styleUrl: './entrypage.component.scss'
})
export class EntrypageComponent {

}


