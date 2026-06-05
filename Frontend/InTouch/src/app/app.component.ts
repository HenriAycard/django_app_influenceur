import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { ApiFCMTokenService } from './services/api/api-fcm-token.service';
import { getToken, onMessage, getMessaging } from 'firebase/messaging';
import { initializeApp, getApps } from 'firebase/app';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private apiFcmToken: ApiFCMTokenService,
  ) {
    // Initialize Firebase
    const app = initializeApp(environment.firebaseConfig);
    const messaging = getMessaging(app);
    this.getFirebaseStatus()
    this.initializeApp(messaging)
  }

  initializeApp(messaging: any) {
    // Session is restored by provideAppInitializer (see main.ts) before routing,
    // so we only need to initialize push notifications here.
    this.platform.ready().then(() => {
      this.initFirebase(messaging)
    })
  }

  getFirebaseStatus() {
    if (getApps().length === 0) {
      console.error('Firebase is not initialized');
    } else {
      console.log('Firebase Messaging initialized');
    }
  }

  async initFirebase(messaging: any) {
    try {
      // Request notification permissions
      Notification.requestPermission().then(async (permission) => {
        if (permission === 'granted') {
          const token = await getToken(messaging, { vapidKey: environment.vapidKey });
          this.apiFcmToken.sendTokenToBackend(token).subscribe();

          // Listen for foreground notifications
          onMessage(messaging, (payload) => {
            console.log('Notification received:', payload);
            alert(`${payload.notification?.title}: ${payload.notification?.body}`);
          });
        }
      });
    } catch (error) {
      console.error('Firebase error:', error);
    }
  }

}
