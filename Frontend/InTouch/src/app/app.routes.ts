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
    // SSO landing for the InTouch portal — see pages/sso/sso.page.ts
    path: 'sso',
    loadComponent: () => import('./pages/sso/sso.page').then( m => m.SsoPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then( m => m.RegisterPage)
  },
  {
    // Public landing for emailed uid+token links (account invitation + reset).
    path: 'set-password',
    loadComponent: () => import('./pages/set-password/set-password.page').then( m => m.SetPasswordPage)
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
