import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';

/**
 * SSO landing page used by the InTouch portal (intouch.ovh) to open the dev
 * frontend already authenticated. The portal mints a JWT for a generic account
 * and redirects here with the tokens in the URL fragment:
 *
 *   https://frontend.intouch.ovh/sso#access=<jwt>&refresh=<jwt>
 *
 * We hand the refresh token to the backend, which moves it into an httpOnly
 * cookie and returns a fresh access token; AuthService then loads the user and
 * redirects to /influencer or /brand by role.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-sso',
  standalone: true,
  imports: [IonContent, IonSpinner],
  template: `
    <ion-content class="ion-padding" [fullscreen]="true">
      <div class="sso-wrap">
        <ion-spinner name="crescent"></ion-spinner>
        <p>{{ message }}</p>
      </div>
    </ion-content>
  `,
  styles: [`
    .sso-wrap { display:flex; flex-direction:column; align-items:center; justify-content:center;
      height:100%; gap:16px; color:var(--ion-color-medium); font-size:15px; }
    ion-spinner { width:42px; height:42px; }
  `],
})
export class SsoPage implements OnInit {
  message = 'Signing you in…';

  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    const raw = window.location.hash.replace(/^#/, '');
    const params = new URLSearchParams(raw);
    const refresh = params.get('refresh');

    // Strip the tokens out of the URL so they do not linger in history.
    history.replaceState(null, '', window.location.pathname);

    if (!refresh) {
      this.message = 'Invalid sign-in link. Redirecting…';
      this.router.navigateByUrl('/login');
      return;
    }

    // Exchanges the refresh token for an httpOnly cookie + access token, loads
    // /auth/users/me/, then redirects by role.
    this.auth.loginWithSsoRefresh(refresh);
  }
}
