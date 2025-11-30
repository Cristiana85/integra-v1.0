import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { EditorComponent } from './editor/editor.component';
import { LoginPageComponent } from './auth/login-page/login-page.component';
import { RegisterPageComponent } from './auth/register-page/register-page.component';
import { PricingComponent } from './landing/components/pricing/pricing.component';
import { TestComponent } from './test/test.component';

export const routes: Routes = [
  { path: '', component: TestComponent },
  { path: 'workspace', component: WorkspaceComponent },
  { path: 'editor', component: EditorComponent },
  { path: 'landing', component: LandingComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'pricing', component: PricingComponent },

  //TODEL
  { path: 'test', component: TestComponent },
  { path: '**', redirectTo: '' },
];
