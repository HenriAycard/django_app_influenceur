// Development placeholder — all secrets are empty here.
// Production values live in environment.prod.ts (gitignored).
// On the server: see /home/ubuntu/django_app_influenceur/Frontend/InTouch/src/environments/environment.prod.ts
// In CI: the "Create environment file" step generates it from GitHub Secrets.
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: '',
  },
  sentryDsn: '',
  vapidKey: '',
};
