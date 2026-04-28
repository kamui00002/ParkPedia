import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/./);
  });

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    await page.goto('/');

    if (isMobile) {
      // Mobile-specific assertions - check for any content
      const content = page.locator('#root, [role="main"], body');
      await expect(content.first()).toBeVisible();
    }
  });
});
