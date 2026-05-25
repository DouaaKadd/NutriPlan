import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./features/shared/layout/layout').then((m) => m.Layout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'diary',
        loadComponent: () => import('./features/diary/diary/diary').then((m) => m.Diary),
      },
      {
        path: 'foods',
        loadComponent: () => import('./features/foods/foods/foods').then((m) => m.Foods),
      },
      {
        path: 'progress',
        loadComponent: () =>
          import('./features/progress/progress/progress').then((m) => m.Progress),
      },
      {
        path: 'plan',
        loadComponent: () => import('./features/plan/plan/plan').then((m) => m.Plan),
      },
      {
        path: 'goals',
        loadComponent: () =>
          import('./features/goals/goals/goals').then((m) => m.Goals),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
