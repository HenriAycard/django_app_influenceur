import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { NavController } from '@ionic/angular/standalone';

import { AuthService } from '../services/auth.service';
import { Role } from 'src/app/shared/models';

/**
 * Guard factory that protects a route by role.
 *
 * - Not authenticated  -> redirect to /login
 * - Wrong role         -> redirect to the user's own home (prevents a company
 *                         from loading /influencer/* and vice-versa)
 * - Allowed role       -> activate
 */
export function roleGuard(allowedRoles: Role[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const navigation = inject(NavController);

    if (!auth.isAuth()) {
      navigation.navigateRoot('/login');
      return false;
    }

    const { roles } = auth.getCurrentUserProfile();
    if (roles.some(role => allowedRoles.includes(role))) {
      return true;
    }

    // Authenticated, but trying to access the other side of the marketplace.
    if (roles.includes('INFLUENCER')) {
      navigation.navigateRoot('/influencer');
    } else if (roles.includes('COMPANY')) {
      navigation.navigateRoot('/brand');
    } else {
      navigation.navigateRoot('/login');
    }
    return false;
  };
}
