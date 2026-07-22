import { expect } from '@playwright/test';
import { When, Then } from './fixtures';

When('I open my venue {string}', async ({ page }, venueName: string) => {
  const card = page.locator('.vcard', { hasText: venueName });
  await expect(card).toBeVisible();
  await card.click();
  await expect(page).toHaveURL(/\/brand\/venue\/\d+/);
});

Then('I see the offer {string} listed', async ({ page }, offerName: string) => {
  // .ocard-title has a real box; the app-offer-card host has display:contents.
  await expect(page.locator('.ocard-title', { hasText: offerName })).toBeVisible();
});
