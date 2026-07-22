import { test as base, createBdd } from 'playwright-bdd';

// Point the app at the isolated E2E backend before it boots. constant.ts reads
// window.__API_BASE__ at load time (see src/app/config/constant.ts), and
// addInitScript runs before any page script, so the app talks to :8010 instead
// of the deployed backend.
export const E2E_API_BASE = 'https://127.0.0.1:8010/';

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript((apiBase) => {
      (window as unknown as { __API_BASE__: string }).__API_BASE__ = apiBase;
    }, E2E_API_BASE);
    await use(page);
  },
});

export const { Given, When, Then } = createBdd(test);
