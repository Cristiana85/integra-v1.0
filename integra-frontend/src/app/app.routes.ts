// NUOVO: src/app/app.routes.ts
import { Routes } from '@angular/router';

// Entry & landing
import { EntrypageComponent } from './entrypage/entrypage.component';
import { LandingpageComponent } from './landing-page/pages/landingpage.component';

// Auth
import { LoginComponent } from './landing-page/components/login/login.component';
import { RegisterComponent } from './landing-page/components/register/register.component';
import { ForgotPasswordComponent } from './landing-page/components/forgot.password/forgot.password.component';
import { ResetPasswordComponent } from './landing-page/components/reset.password/reset.password.component';
import { AuthGuard } from './shared/services/auth.guard';

// Workspace (layout with its own <router-outlet>)
import { WorkspaceComponent } from './workspace/pages/workspace.component';
import { ProjectsComponent } from './workspace/components/projects/projects.component';

// Chat area (layout + children)
import { DashboardComponent } from './integra/dashboard/dashboard.component';
import { BoardEmptyComponent } from './integra/dashboard/components/boardempty/boardempty.component';
import { BoardExplorerComponent } from './integra/dashboard/components/boardexplorer/boardexplorer.component';

// Misc
import { DiagramComponent } from './integra/editor/components/diagram/diagram.component';
import { EditorComponent } from './integra/editor/pages/ui/editor.component';
import { TestpageComponent } from './testpage/testpage.component';

export const routes: Routes = [
  { path: '', redirectTo: 'entrypage', pathMatch: 'full' },

  { path: 'entrypage', component: EntrypageComponent },
  { path: 'landing-page', component: LandingpageComponent },

  //{ path: 'login', component: LoginComponent, canActivate: [AuthGuard] }, // o togli il guard
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  {
    path: 'workspace',
    component: WorkspaceComponent,
    children: [
      { path: '', redirectTo: 'projects', pathMatch: 'full' },
      { path: 'projects', component: ProjectsComponent },
      // altre child routes qui
    ],
  },

  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'chat', pathMatch: 'full' },
      { path: 'board', component: BoardEmptyComponent },
      { path: 'explorer', component: BoardExplorerComponent },
    ],
  },
  { path: 'testpage', component: TestpageComponent },
  { path: 'editor', component: EditorComponent },
  { path: '**', redirectTo: 'entrypage' },
];
