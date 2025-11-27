import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { EditorComponent } from './editor/editor.component';
import { WorkspaceComponent } from './workspace/workspace.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'editor', component: EditorComponent },
  { path: 'workspace', component: WorkspaceComponent },
  { path: '**', redirectTo: '' },
];
