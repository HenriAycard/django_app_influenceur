import { expect, Page } from '@playwright/test';
import { When, Then } from './fixtures';

/** Brand side: clicking an offer card opens its actions sheet; pick an action. */
async function openOfferAction(page: Page, offerName: string, action: string) {
  await page.locator('.ocard-title', { hasText: offerName }).click();
  await page.locator('ion-item', { hasText: action }).click();
}

When('I archive the offer {string}', async ({ page }, offerName: string) => {
  await openOfferAction(page, offerName, 'Archive');
  const alert = page.locator('ion-alert', { hasText: 'Archive this offer?' });
  await expect(alert).toBeVisible();
  await alert.getByRole('button', { name: 'Archive' }).click();
});

Then('the offer {string} is no longer listed', async ({ page }, offerName: string) => {
  await expect(page.locator('.ocard-title', { hasText: offerName })).toBeHidden();
});

When('I duplicate the offer {string}', async ({ page }, offerName: string) => {
  await openOfferAction(page, offerName, 'Duplicate');
});

Then('I land on the editor of the copy', async ({ page }) => {
  await expect(page).toHaveURL(/\/offer\/\d+\/edit/);
  await expect(page.locator('ion-input[formControlName="name"] input')).toHaveValue(/\(copy\)/);
});

When('I try to edit the frozen offer {string}', async ({ page }, offerName: string) => {
  await openOfferAction(page, offerName, 'Edit');
});

Then('I am told the terms are frozen', async ({ page }) => {
  const alert = page.locator('ion-alert', { hasText: 'Terms are frozen' });
  await expect(alert).toBeVisible();
  await alert.getByRole('button', { name: 'Cancel' }).click();
  await expect(alert).toBeHidden();
});
