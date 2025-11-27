import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { EditorComponent } from './editor/editor.component';
import { UserComponent } from './user/user.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'workspace', component: WorkspaceComponent },
  { path: 'editor', component: EditorComponent },
  { path: 'account', component: UserComponent },
  { path: '**', redirectTo: '' },
];
