import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'apps', pathMatch: 'full' },
  {
    path: 'apps',
    loadComponent: () => import('./pages/apps.page').then((m) => m.AppsPage),
  },
  {
    path: 'b/:boardId',
    loadComponent: () => import('./pages/board.page').then((m) => m.BoardPage),
  },
  { path: '**', redirectTo: 'apps' },
];
