import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('http://localhost:3000'); // Assuming the app runs on localhost:3000

  // Expect a title "to contain" a substring.
  // The regex used here is simple and not vulnerable to super-linear runtime due to backtracking.

  await expect(page).toHaveTitle(/^Food Truck Finder$/);
});

test('get started link', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of the current URL.
  await expect(page).toHaveURL(/introduction/);
});
