import { Routes } from '@angular/router';
import { roleGuard } from './guard/role.guard';

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
    loadChildren: () => import('./pages/influencer/influencer-tabs.routes').then( m => m.INFLUENCER_TABS_ROUTES),
    canActivate: [roleGuard(['INFLUENCER'])]
  },
  {
    path: 'brand',
    loadChildren: () => import('./pages/brand/brand.routes').then( m => m.BRAND_TABS_ROUTES),
    canActivate: [roleGuard(['COMPANY'])]
  },
];
