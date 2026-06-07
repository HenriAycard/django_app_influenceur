import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { TokenManagerService } from 'src/app/services/token-manager.service';

/**
 * SSO landing page used by the InTouch portal (intouch.ovh) to open the dev
 * frontend already authenticated. The portal mints a JWT for a generic account
 * and redirects here with the tokens in the URL fragment:
 *
 *   https://frontend.intouch.ovh/sso#access=<jwt>&refresh=<jwt>
 *
 * The fragment is never sent to a server. We persist the tokens through the
 * same TokenManagerService the normal login uses, then let AuthService load the
 * user and redirect to /influencer or /brand by role.
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
  private tokens = inject(TokenManagerService);
  private router = inject(Router);

  ngOnInit() {
    const raw = window.location.hash.replace(/^#/, '');
    const params = new URLSearchParams(raw);
    const access = params.get('access');
    const refresh = params.get('refresh');

    // Strip the tokens out of the URL so they do not linger in history.
    history.replaceState(null, '', window.location.pathname);

    if (!access || !refresh) {
      this.message = 'Invalid sign-in link. Redirecting…';
      this.router.navigateByUrl('/login');
      return;
    }

    this.tokens.setAccessToken(access);
    this.tokens.setRefreshToken(refresh);
    // Loads /auth/users/me/, populates auth state, then redirects by role.
    this.auth.fetchCurrentUser();
  }
}
