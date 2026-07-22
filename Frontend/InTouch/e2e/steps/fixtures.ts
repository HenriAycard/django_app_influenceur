import { test as base, createBdd } from 'playwright-bdd';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';

// Point the app at the isolated E2E backend before it boots. constant.ts reads
// window.__API_BASE__ at load time (see src/app/config/constant.ts), and
// addInitScript runs before any page script, so the app talks to :8010 instead
// of the deployed backend.
export const E2E_API_BASE = 'https://127.0.0.1:8010/';

const backendDir = path.resolve(__dirname, '../../../../Backend/InTouch');
const seedFile = path.resolve(__dirname, '../seed.py');

type WorkerFixtures = { seededDatabase: void };

export const test = base.extend<NonNullable<unknown>, WorkerFixtures>({
  // Re-seed intouch_e2e at the start of every run — not only when the backend
  // boots. In UI mode (and any repeat run against live servers) the webServer
  // survives between runs, and the scenarios are one-shot: accepting Noa's
  // application, validating Mia's collaboration, archiving an offer… all
  // mutate state a second run would need back.
  seededDatabase: [
    async ({}, use) => {
      execFileSync(path.join(backendDir, 'env/bin/python'), ['manage.py', 'shell'], {
        cwd: backendDir,
        env: { ...process.env, PG_DBNAME: 'intouch_e2e' },
        input: readFileSync(seedFile),
      });
      await use(undefined);
    },
    { scope: 'worker', auto: true },
  ],
  page: async ({ page }, use) => {
    await page.addInitScript((apiBase) => {
      (window as unknown as { __API_BASE__: string }).__API_BASE__ = apiBase;
    }, E2E_API_BASE);
    await use(page);
  },
});

export const { Given, When, Then } = createBdd(test);
