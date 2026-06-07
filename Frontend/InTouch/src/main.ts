import { bootstrapApplication } from '@angular/platform-browser';
import { provideAppInitializer, inject } from '@angular/core';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules, withComponentInputBinding } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/services/auth.interceptor';
import { AuthService } from './app/services/auth.service';
import { register as registerSwiperElements } from 'swiper/element/bundle';

registerSwiperElements()

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    // Resolve auth state from a stored token before the first route activates,
    // so guards don't race an un-initialized session on hard refresh.
    provideAppInitializer(() => inject(AuthService).restoreSession()),
  ],
});