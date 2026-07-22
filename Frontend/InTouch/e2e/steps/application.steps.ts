import { expect } from '@playwright/test';
import { When, Then } from './fixtures';

When('I open the venue {string} from the feed', async ({ page }, venueName: string) => {
  const card = page.locator('app-venue-card', { hasText: venueName });
  await expect(card).toBeVisible();
  await card.click();
  await expect(page).toHaveURL(/\/venue\/\d+/);
});

When('I open the offer {string}', async ({ page }, offerName: string) => {
  const card = page.locator('app-offer-card', { hasText: offerName });
  await expect(card).toBeVisible();
  await card.locator('.ocard').click();
  await expect(page).toHaveURL(/\/offer\/\d+/);
});

When('I apply for the collaboration', async ({ page }) => {
  await page.locator('.apply-cta').click();
  // The Angular host has no box (display:contents); target real elements inside.
  const confirm = page.locator('.confirm-btn');
  await expect(confirm).toBeVisible();
  await page.locator('ion-checkbox', { hasText: 'I accept the terms' }).click();
  await confirm.click();
});

Then('my application is confirmed', async ({ page }) => {
  await expect(page.getByText(/added to your calendar/i)).toBeVisible();
});
