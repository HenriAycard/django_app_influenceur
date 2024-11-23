import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { provideIonicAngular, IonicRouteStrategy, IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { TokenInterceptor } from './services/token.interceptor';


@NgModule({ declarations: [AppComponent],
    imports: [BrowserModule, AppRoutingModule, IonApp, IonRouterOutlet, TranslateModule.forRoot()],
    providers: [
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        /**
         * The custom config serves as an example
         * of how to pass a config to provideIonicAngular.
         * You do not need to set "mode: 'ios'" to
         * use Ionic standalone components.
         */
       provideIonicAngular({ mode: 'ios' }),
       { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
       provideHttpClient(withInterceptorsFromDi())
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
