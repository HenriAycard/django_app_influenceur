import { expect } from '@playwright/test';
import { When, Then } from './fixtures';

When('I open my messages', async ({ page }) => {
  await page.locator('ion-tab-button[tab="messages"]').click();
  await expect(page).toHaveURL(/\/influencer\/messages/);
});

When('I open the conversation with {string}', async ({ page }, title: string) => {
  // Inbox rows are .conv items; the influencer sees the venue name as the title.
  await page.locator('ion-item.conv', { hasText: title }).click();
  await expect(page).toHaveURL(/\/influencer\/messages\/\d+/);
});

Then('I see the message {string} in the thread', async ({ page }, body: string) => {
  await expect(page.locator('.bubble .body', { hasText: body })).toBeVisible();
});

When('I send the message {string}', async ({ page }, body: string) => {
  await page.locator('ion-textarea textarea').fill(body);
  await page.locator('ion-button.send').click();
});
