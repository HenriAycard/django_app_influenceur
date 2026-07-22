import { expect, Page } from '@playwright/test';

// The seeded actors (see e2e/seed.py).
export const INFLUENCER = { email: 'e2e-influencer@intouch.test', password: 'E2e-Pass-123!' };
export const BRAND = { email: 'e2e-brand@intouch.test', password: 'E2e-Pass-123!' };

// The seeded venue + offer.
export const VENUE_NAME = 'E2E Test Venue';
export const OFFER_NAME = 'E2E Welcome Offer';

/** Fill the login form and wait for the role-based redirect away from /login. */
export async function signIn(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.locator('ion-input[formControlName="email"] input').fill(email);
  await page.locator('ion-input[formControlName="password"] input').fill(password);
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await expect(page).toHaveURL(/\/(influencer|brand)(\/|$)/);
}
