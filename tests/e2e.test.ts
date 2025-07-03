// @ts-expect-error TS(2792): Cannot find module '@playwright/test'. Did you mea... Remove this comment to see the full error message
import { test, expect } from '@playwright/test';

test('has title', async ({ page }: any) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Food Truck Finder/);
});

test('displays food truck finder interface', async ({ page }: any) => {
  await page.goto('/');

  // Check for main UI elements
  await expect(page.getByText('Food Truck Finder')).toBeVisible();

  // Check for search functionality
  await expect(page.getByPlaceholder(/search/i)).toBeVisible();

  // Check for map display container (using a more generic selector)
  await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 });
});

test('can search for food trucks', async ({ page }: any) => {
  await page.goto('/');

  // Find search input and search button
  const searchInput = page.getByPlaceholder(/search/i);
  await expect(searchInput).toBeVisible();

  // Type in search term
  await searchInput.fill('pizza');

  // Click search or press enter
  await searchInput.press('Enter');

  // Wait for results to load
  await page.waitForLoadState('networkidle');
});
