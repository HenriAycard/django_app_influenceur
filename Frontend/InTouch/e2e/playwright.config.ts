import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import * as path from 'path';

const backendDir = path.resolve(__dirname, '../../../Backend/InTouch');
const frontendDir = path.resolve(__dirname, '..');

const testDir = defineBddConfig({
  features: path.join(__dirname, 'features/*.feature'),
  steps: path.join(__dirname, 'steps/*.ts'),
});

export default defineConfig({
  testDir,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:8110',
    ignoreHTTPSErrors: true, // the E2E backend serves a self-signed cert on :8010
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: `bash ${path.join(__dirname, 'backend.sh')}`,
      cwd: backendDir,
      url: 'https://127.0.0.1:8010/admin/login/',
      ignoreHTTPSErrors: true,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        PG_DBNAME: 'intouch_e2e',
        DJANGO_ALLOWED_HOSTS: 'localhost,127.0.0.1,testserver',
        CORS_ALLOWED_ORIGINS: 'http://127.0.0.1:8110,http://localhost:8110',
      },
    },
    {
      command: 'npm run start -- --host 127.0.0.1 --port 8110',
      cwd: frontendDir,
      url: 'http://127.0.0.1:8110',
      reuseExistingServer: !process.env.CI,
      timeout: 240_000,
    },
  ],
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
