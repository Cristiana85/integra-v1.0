import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { EditorComponent } from './editor/editor.component';
import { UserComponent } from './user/user.component';
import { AuthPageComponent } from './auth/auth-page/auth-page.component';
import { LoginPageComponent } from './auth/login-page/login-page.component';
import { RegisterPageComponent } from './auth/register-page/register-page.component';
import { PricingComponent } from './pricing/pricing.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'workspace', component: WorkspaceComponent },
  { path: 'editor', component: EditorComponent },
  { path: 'account', component: UserComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'pricing', component: PricingComponent },
  { path: '**', redirectTo: '' },
];
