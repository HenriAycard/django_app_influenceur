import { expect } from '@playwright/test';
import { Given } from './fixtures';
import { INFLUENCER, BRAND, signIn } from './helpers';

Given('I am signed in as the influencer', async ({ page }) => {
  await signIn(page, INFLUENCER.email, INFLUENCER.password);
  await expect(page).toHaveURL(/\/influencer(\/|$)/);
});

Given('I am signed in as the brand', async ({ page }) => {
  await signIn(page, BRAND.email, BRAND.password);
  await expect(page).toHaveURL(/\/brand(\/|$)/);
});
