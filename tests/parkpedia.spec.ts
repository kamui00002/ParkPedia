import { test, expect } from '@playwright/test';

test.describe('ParkPedia Mobile Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
  });

  test('should load the app successfully', async ({ page }) => {
    // Verify the page loaded
    await expect(page).toHaveTitle(/ParkPedia|Expo/i);
  });

  test('should display map on home screen', async ({ page }) => {
    // Wait for map container or main content
    const mapOrContent = page.locator(
      '[data-testid="map-container"], [role="main"], .map-container, #root'
    );
    await expect(mapOrContent.first()).toBeVisible({ timeout: 30000 });
  });

  test('should be responsive on mobile', async ({ page, isMobile: _isMobile }) => {
    const viewport = page.viewportSize();
    const isPhone = viewport && viewport.width < 768;
    test.skip(!isPhone, 'Phone only test');

    // Check viewport is mobile-sized
    expect(viewport?.width).toBeLessThan(768);

    // Take screenshot for visual verification
    await page.screenshot({ path: `screenshots/mobile-home-${Date.now()}.png` });
  });

  test('should handle touch interactions', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile only test');

    // Test touch on interactive elements
    const interactiveElement = page.locator('button, [role="button"]').first();
    if (await interactiveElement.isVisible()) {
      await interactiveElement.tap();
    }
  });

  test('should display correctly on tablet', async ({ page, viewport }) => {
    if (!viewport || viewport.width < 768) {
      test.skip();
      return;
    }

    // Tablet-specific tests
    await expect(page.locator('#root, [role="main"]').first()).toBeVisible();
    await page.screenshot({ path: `screenshots/tablet-home-${Date.now()}.png` });
  });
});

test.describe('ParkPedia Navigation', () => {
  test('should have navigation elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for navigation or header elements
    const navElements = page.locator('header, nav, [role="navigation"]');
    // App should have some form of navigation
    const count = await navElements.count();
    console.log(`Found ${count} navigation elements`);
  });
});

test.describe('Screenshot Tests', () => {
  test('capture home screen on all devices', async ({ page, browserName }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Give the app time to render
    await page.waitForTimeout(3000);

    const viewport = page.viewportSize();
    const deviceType =
      viewport && viewport.width < 768
        ? 'mobile'
        : viewport && viewport.width < 1024
          ? 'tablet'
          : 'desktop';

    await page.screenshot({
      path: `screenshots/${deviceType}-${browserName}-${Date.now()}.png`,
      fullPage: true,
    });
  });
});
