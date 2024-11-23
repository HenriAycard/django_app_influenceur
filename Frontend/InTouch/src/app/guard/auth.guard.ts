import { inject } from '@angular/core';
import { NavController } from '@ionic/angular/standalone';

import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authentication = inject(AuthService);
  const navigation = inject(NavController);

  if (await authentication.isAuth()) {
    return true;
  }

  navigation.navigateRoot('/login');
  return false;
};