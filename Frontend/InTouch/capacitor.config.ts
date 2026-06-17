import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ovh.intouch.app',
  appName: 'InTouch',
  webDir: 'www',
  server: {
    // Allow the WebView to reach the production API over HTTPS.
    allowNavigation: ['backend.intouch.ovh'],
  },
};

export default config;
