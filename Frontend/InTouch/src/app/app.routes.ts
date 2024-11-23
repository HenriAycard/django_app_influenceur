import { Routes } from '@angular/router';
import { authGuard } from './guard/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'influencer',
    loadChildren: () => import('./pages/influencer/influencer-tabs/influencer-tabs.routes').then( m => m.INFLUENCER_TABS_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'view-search',
    loadComponent: () => import('./pages/influencer/explorer/view-search/view-search.page').then( m => m.ViewSearchPage)
  },
  {
    path: 'experience',
    loadComponent: () => import('./pages/influencer/explorer/experience/experience.page').then( m => m.ExperiencePage)
  },
];
