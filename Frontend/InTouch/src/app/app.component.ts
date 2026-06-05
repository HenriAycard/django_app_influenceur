import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { AuthService } from './services/auth.service';
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
    private authService: AuthService,
    private apiFcmToken: ApiFCMTokenService,
  ) {
    // Initialize Firebase
    const app = initializeApp(environment.firebaseConfig);
    const messaging = getMessaging(app);
    this.getFirebaseStatus()
    this.initializeApp(messaging)
  }

  initializeApp(messaging: any) {
    this.platform.ready().then(() => {
      this.authService.fetchCurrentUser()
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

          this.apiFcmToken.sendNotification("ffdd4a75-21e8-433d-b519-63bd9144181e").subscribe()
        }
      });
    } catch (error) {
      console.error('Firebase error:', error);
    }
  }

}
