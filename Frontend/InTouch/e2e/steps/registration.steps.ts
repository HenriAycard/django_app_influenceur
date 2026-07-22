import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures';

Given('the registration screen is open', async ({ page }) => {
  await page.goto('/register');
  await expect(page.getByText("I'm an influencer")).toBeVisible();
});

When('I apply as an influencer with a social handle', async ({ page }) => {
  // Unique email so the scenario passes even against a backend seeded once.
  const email = `nina.${Date.now()}@e2e.test`;
  await page.getByText("I'm an influencer").click();
  await page.locator('ion-input[formControlName="firstName"] input').fill('Nina');
  await page.locator('ion-input[formControlName="lastName"] input').fill('Newcomer');
  await page.locator('ion-input[formControlName="email"] input').fill(email);
  await page.locator('ion-input[formControlName="instagram"] input').fill('@nina');
  await page.getByRole('button', { name: 'Send my application' }).click();
});

Then('I see the application confirmation', async ({ page }) => {
  await expect(page.getByText('Application received!')).toBeVisible();
});
