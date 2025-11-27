import { Routes } from '@angular/router';
import { DiagramComponent } from './diagram/diagram.component';

export const routes: Routes = [
  { path: '', component: DiagramComponent },
  // se vuoi, in futuro:
  // { path: 'diagram', component: DiagramComponent },
];
