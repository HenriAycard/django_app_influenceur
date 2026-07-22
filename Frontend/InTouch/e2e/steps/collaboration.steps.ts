import { expect, Page, Locator } from '@playwright/test';
import { When, Then } from './fixtures';

/** Expand an ion-accordion by its header label and return its content root. */
async function openAccordion(page: Page, label: string): Promise<Locator> {
  const accordion = page.locator('ion-accordion', { hasText: label });
  await accordion.locator('ion-item[slot="header"]').click();
  return accordion;
}

// Navigate via the tab bar, not page.goto(): a hard reload drops the
// in-memory access token (the refresh cookie is schemeful-cross-site between
// http:8110 and https:8010, so the session would not survive).
When('I open the brand calendar', async ({ page }) => {
  await page.locator('ion-tab-button[tab="calendar"]').click();
  await expect(page).toHaveURL(/\/brand\/calendar/);
});

When('I open the influencer calendar', async ({ page }) => {
  await page.locator('ion-tab-button[tab="calendar"]').click();
  await expect(page).toHaveURL(/\/influencer\/calendar/);
});

When('I open the waiting application from {string}', async ({ page }, name: string) => {
  const section = await openAccordion(page, 'Waiting your answer');
  await section.locator('app-calendar-venue ion-item', { hasText: name }).click();
  await expect(page).toHaveURL(/\/brand\/booking\/\d+/);
});

When('I open the past collaboration with {string}', async ({ page }, name: string) => {
  const section = await openAccordion(page, 'Last collaborations');
  await section.locator('app-calendar-venue ion-item', { hasText: name }).click();
  await expect(page).toHaveURL(/\/brand\/booking\/\d+/);
});

When('I open my past collaboration on {string}', async ({ page }, offerName: string) => {
  const section = await openAccordion(page, 'Last collaborations');
  await section.locator('app-calendar-influencer ion-item', { hasText: offerName }).click();
  await expect(page).toHaveURL(/\/influencer\/collaboration\/\d+/);
});

When('I accept the application', async ({ page }) => {
  // Target the ion-button host: role=button also matches its shadow-DOM button.
  await page.locator('ion-button', { hasText: 'Accept' }).click();
});

Then('the collaboration is scheduled', async ({ page }) => {
  // On success the page toasts and navigates back to the calendar.
  await expect(page.getByText('Reservation confirmed!')).toBeVisible();
  await expect(page).toHaveURL(/\/brand\/calendar/);
});

When('I submit the post link {string}', async ({ page }, url: string) => {
  await page.locator('ion-input[type="url"] input').fill(url);
  await page.getByRole('button', { name: 'Submit' }).click();
});

Then('the post is shared with the venue', async ({ page }) => {
  await expect(page.getByText('Your post has been shared with the venue.')).toBeVisible();
});

When('I validate the collaboration', async ({ page }) => {
  await page.locator('ion-button', { hasText: 'Validate' }).click();
});

Then('the collaboration is marked as validated', async ({ page }) => {
  // h4 in the lifecycle card (the success toast carries the same words).
  await expect(page.locator('h4', { hasText: 'Collaboration validated' })).toBeVisible();
});

When('I report a no-show', async ({ page }) => {
  await page.getByRole('button', { name: 'No-show' }).click();
});

Then('the collaboration is marked as a no-show', async ({ page }) => {
  await expect(page.locator('h4', { hasText: 'Marked as no-show' })).toBeVisible();
});
