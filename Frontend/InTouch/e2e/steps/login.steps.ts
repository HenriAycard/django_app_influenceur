import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures';

Given('the login screen is open', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('ion-input[formControlName="email"] input')).toBeVisible();
});

When(
  'I sign in as {string} with password {string}',
  async ({ page }, email: string, password: string) => {
    await page.locator('ion-input[formControlName="email"] input').fill(email);
    await page.locator('ion-input[formControlName="password"] input').fill(password);
    await page.getByRole('button', { name: 'LOGIN' }).click();
  },
);

Then('I land on the influencer home', async ({ page }) => {
  await expect(page).toHaveURL(/\/influencer(\/|$)/);
});

Then('I land on the brand home', async ({ page }) => {
  await expect(page).toHaveURL(/\/brand(\/|$)/);
});

Then('I stay on the login screen', async ({ page }) => {
  // Give a would-be redirect time to happen, then assert it did not.
  await page.waitForTimeout(1500);
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('button', { name: 'LOGIN' })).toBeVisible();
});
