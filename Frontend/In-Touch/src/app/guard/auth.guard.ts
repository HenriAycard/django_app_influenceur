
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanActivate } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular/standalone';

import { Observable, Subject } from 'rxjs';
import { filter, map, tap, take } from 'rxjs/operators';
import { AuthenticationService } from '../services/authentication.service';
import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = async (route, state) => {
  const authentication = inject(AuthenticationService);
  const navigation = inject(NavController);

  if (await authentication.isAuth()) {
    return true;
  }

  navigation.navigateRoot('/login');
  return false;
};
