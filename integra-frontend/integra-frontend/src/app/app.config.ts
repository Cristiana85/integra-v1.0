import { ApplicationConfig } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { LandingpageComponent } from './landing-page/pages/landingpage.component';
import { WorkspaceComponent } from './workspace/pages/workspace.component';
import { EditorComponent } from './editor/pages/ui/editor.component';
import { EntrypageComponent } from './entrypage/entrypage.component';
import { diagramReducer } from './editor/store/reducers/diagram.reducer';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

const routes: Routes = [
  { path: '', redirectTo: 'entrypage', pathMatch: 'full' }, // Default route
  { path: 'entrypage', component:  EntrypageComponent },          // First page with buttons
  { path: 'landing-page', component: LandingpageComponent },
  { path: 'workspace', component: WorkspaceComponent },
  { path: 'editor', component: EditorComponent },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), // Add routing here
    provideStore({ reducer: diagramReducer }), // Register the diagram reducer
    provideEffects([]), // Add effects here if needed
    provideStoreDevtools(), // Enable Store DevTools (Optional)
  ],
};
