import { bootstrapApplication } from '@angular/platform-browser';
import { ErrorHandler, provideAppInitializer, inject } from '@angular/core';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules, withComponentInputBinding } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import * as Sentry from '@sentry/angular';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/services/auth.interceptor';
import { AuthService } from './app/services/auth.service';
import { environment } from './environments/environment';
import { register as registerSwiperElements } from 'swiper/element/bundle';

registerSwiperElements()

// Error monitoring — inert when sentryDsn is empty (dev / CI builds).
if (environment.sentryDsn) {
  Sentry.init({ dsn: environment.sentryDsn, sendDefaultPii: false });
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    // Resolve auth state from a stored token before the first route activates,
    // so guards don't race an un-initialized session on hard refresh.
    provideAppInitializer(() => inject(AuthService).restoreSession()),
    // Uncaught errors go to Sentry when enabled; default behavior otherwise.
    { provide: ErrorHandler, useValue: environment.sentryDsn ? Sentry.createErrorHandler() : new ErrorHandler() },
  ],
});