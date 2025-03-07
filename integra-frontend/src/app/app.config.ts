import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { EditorComponent } from './editor/pages/ui/editor.component';
import { diagramReducer } from './editor/store/reducers/diagram.reducer';
import { EntrypageComponent } from './entrypage/entrypage.component';
import { ForgotPasswordComponent } from './landing-page/components/forgot.password/forgot.password.component';
import { LoginComponent } from './landing-page/components/login/login.component';
import { RegisterComponent } from './landing-page/components/register/register.component';
import { ResetPasswordComponent } from './landing-page/components/reset.password/reset.password.component';
import { LandingpageComponent } from './landing-page/pages/landingpage.component';
import { AuthInterceptor } from './shared/services/auth.interceptor';
import { ProjectsComponent } from './workspace/components/projects/projects.component';
import { WorkspaceComponent } from './workspace/pages/workspace.component';
import { AuthGuard } from './shared/services/auth.guard';
import { TestpageComponent } from './testpage/testpage.component';

const routes: Routes = [
  { path: '', redirectTo: 'entrypage', pathMatch: 'full' }, // Default route
  { path: 'entrypage', component: EntrypageComponent }, // First page with buttons
  { path: 'landing-page', component: LandingpageComponent },
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard] }, //canActivate: [AuthGuard]
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: LandingpageComponent },
  {
    path: 'workspace',
    component: WorkspaceComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'projects',
        component: ProjectsComponent,
      },
      // Puoi aggiungere altre rotte figlie qui
    ],
  },
  { path: 'testpage', component: TestpageComponent },
  { path: 'editor', component: EditorComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'projects/:name', component: EditorComponent },
];

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(BrowserAnimationsModule), // Add this for animations
    provideRouter(routes), // Add routing here
    provideStore({ reducer: diagramReducer }), // Register the diagram reducer
    provideEffects([]), // Add effects here if needed
    provideStoreDevtools(), // Enable Store DevTools (Optional)
    provideHttpClient(withInterceptorsFromDi()), // Abilita gli interceptor DI
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
};
