import { Injectable, inject } from '@angular/core';
import { getToken, onMessage, getMessaging, isSupported } from 'firebase/messaging';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { environment } from 'src/environments/environment';
import { ApiFCMTokenService } from './api/api-fcm-token.service';
import { ToastService } from './toast.service';

const SW_URL = '/assets/firebase-messaging-sw.js';

/**
 * Centralizes web-push setup so both the app bootstrap and an explicit
 * user-gesture entry (profile → Notifications) share one code path.
 *
 * On-load auto-prompts are unreliable on Chrome (quieter UI / abuse heuristics)
 * and impossible on iOS, so `init()` is silent and `enable()` (a button) is the
 * reliable, user-initiated path with visible feedback for every outcome.
 */
@Injectable({ providedIn: 'root' })
export class PushNotificationService {
    private apiFcmToken = inject(ApiFCMTokenService);
    private toast = inject(ToastService);
    private foregroundBound = false;

    /** Best-effort on app start: refresh the token only if already granted.
     *  Never prompts and never toasts. */
    async init(): Promise<void> {
        try {
            if (!(await this.available())) return;
            if (Notification.permission === 'granted') {
                await this.registerAndSync();
            }
        } catch (e) {
            console.error('[push] init failed', e);
        }
    }

    /** User-gesture entry: prompts if needed and reports the outcome. */
    async enable(): Promise<void> {
        try {
            if (!(await this.available())) {
                this.toast.toastWarn(
                    'Notifications unavailable',
                    'This browser/context does not support web push (needs HTTPS and a modern browser; on iOS, install the app to your home screen first).'
                );
                return;
            }

            let permission = Notification.permission;
            if (permission === 'default') {
                permission = await Notification.requestPermission();
            }

            if (permission === 'denied') {
                this.toast.toastWarn(
                    'Notifications blocked',
                    'Allow notifications for this site in your browser settings (click the icon left of the address bar), then try again.'
                );
                return;
            }
            if (permission !== 'granted') return;

            await this.registerAndSync();
            this.toast.toastSuccess('Notifications enabled', 'You will now receive updates about your collaborations.');
        } catch (e) {
            console.error('[push] enable failed', e);
            this.toast.toastDanger('Notifications', 'Could not enable notifications. Please try again.');
        }
    }

    private async available(): Promise<boolean> {
        return (await isSupported()) && 'Notification' in window && 'serviceWorker' in navigator;
    }

    private async registerAndSync(): Promise<void> {
        const app = getApps().length ? getApp() : initializeApp(environment.firebaseConfig);
        const messaging = getMessaging(app);
        const registration = await navigator.serviceWorker.register(SW_URL);
        const token = await getToken(messaging, {
            vapidKey: environment.vapidKey,
            serviceWorkerRegistration: registration,
        });
        if (token) {
            this.apiFcmToken.sendTokenToBackend(token).subscribe({ error: () => {} });
        }
        if (!this.foregroundBound) {
            this.foregroundBound = true;
            onMessage(messaging, (payload) => {
                this.toast.toastSuccess(
                    payload.notification?.title ?? 'Notification',
                    payload.notification?.body ?? ''
                );
            });
        }
    }
}
