import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { PushNotificationService } from './services/push-notification.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private platform = inject(Platform);
  private push = inject(PushNotificationService);

  constructor() {
    // Silent token refresh if already granted; the explicit opt-in lives in the
    // profile (Notifications). Best-effort — never blocks app bootstrap.
    this.platform.ready().then(() => this.push.init());
  }
}
