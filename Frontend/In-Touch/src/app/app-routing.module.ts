import { inject, NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guard/auth.guard';
import { AutoLoginGuard } from './guard/auto-login.guard';
import { AuthenticationService } from './services/authentication.service';

const routes: Routes = [
  {
    path: 'brand',
    loadChildren: () => import('./pages/brand/brand-tabs/brand-tabs.module').then(m => m.BrandTabsPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'influenceur',
    loadChildren: () => import('./pages/influenceur/InfluenceurTabs/InfluenceurTabs.module').then(m => m.InfluenceurTabsPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule),
    canMatch: [() => inject(AuthenticationService).hasPermission('login')]
    //canLoad: [AutoLoginGuard]
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
