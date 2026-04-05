import { test, expect } from '@playwright/test';

/**
 * E2E Tests — Pawfect FurEver
 * Simulates real user flows: register → onboarding → shop → cart → checkout
 */

const BASE_URL = 'http://localhost:5173';
const TEST_USER = {
  name: 'E2E Test User',
  email: `e2e-${Date.now()}@playwright.test`,
  password: 'testpassword123'
};

test.describe('Pawfect FurEver - Full User Journey', () => {
  test('1. User Registration and Onboarding Flow', async ({ page }) => {
    await page.goto(BASE_URL);

    // Should show auth page
    await expect(page.locator('text=Pawfect FurEver')).toBeVisible();
    await expect(page.locator('#auth-email')).toBeVisible();

    // Switch to register
    await page.click('text=Create Account');
    await expect(page.locator('#register-name')).toBeVisible();

    // Fill registration form
    await page.fill('#register-name', TEST_USER.name);
    await page.fill('#auth-email', TEST_USER.email);
    await page.fill('#auth-password', TEST_USER.password);
    await page.click('#auth-submit');

    // Should go to pet onboarding
    await expect(page.locator('text=Tell us about your pet')).toBeVisible({ timeout: 5000 });

    // Select dog
    await page.click('button:has-text("Dog")');
    await page.fill('#pet-name', 'Buddy');
    await page.fill('#pet-breed', 'Golden Retriever');
    await page.click('#pet-submit');

    // Should go to products page
    await expect(page.locator('text=Pawfect FurEver')).toBeVisible({ timeout: 5000 });
  });

  test('2. Login with Existing Credentials', async ({ page }) => {
    await page.goto(BASE_URL);

    await page.fill('#auth-email', TEST_USER.email);
    await page.fill('#auth-password', TEST_USER.password);
    await page.click('#auth-submit');

    // Should be logged in and see product page
    await expect(page.locator('#nav-products')).toBeVisible({ timeout: 5000 });
  });

  test('3. Browse and Search Products', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.fill('#auth-email', TEST_USER.email);
    await page.fill('#auth-password', TEST_USER.password);
    await page.click('#auth-submit');

    // Wait for products to load
    await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 8000 });

    // Search for dog
    await page.fill('#product-search', 'dog');
    await expect(page.locator('.product-card')).not.toHaveCount(0);

    // Clear search
    await page.fill('#product-search', '');
  });

  test('4. Add Product to Cart', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.fill('#auth-email', TEST_USER.email);
    await page.fill('#auth-password', TEST_USER.password);
    await page.click('#auth-submit');

    // Wait for products
    await expect(page.locator('.add-to-cart-btn').first()).toBeVisible({ timeout: 8000 });

    // Add first product to cart
    await page.click('.add-to-cart-btn >> nth=0');

    // Cart count should appear
    await expect(page.locator('.cart-count')).toBeVisible();
    await expect(page.locator('.cart-count')).toHaveText('1');
  });

  test('5. Cart and Checkout Flow', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.fill('#auth-email', TEST_USER.email);
    await page.fill('#auth-password', TEST_USER.password);
    await page.click('#auth-submit');

    // Add product to cart
    await expect(page.locator('.add-to-cart-btn').first()).toBeVisible({ timeout: 8000 });
    await page.click('.add-to-cart-btn >> nth=0');

    // Navigate to cart
    await page.click('#nav-cart');
    await expect(page.locator('.cart-item')).toBeVisible();

    // Checkout
    await page.click('#checkout-btn');

    // Should navigate to orders
    await expect(page.locator('.order-card')).toBeVisible({ timeout: 5000 });
  });

  test('6. View Orders', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.fill('#auth-email', TEST_USER.email);
    await page.fill('#auth-password', TEST_USER.password);
    await page.click('#auth-submit');

    // Go to orders
    await expect(page.locator('#nav-orders')).toBeVisible({ timeout: 5000 });
    await page.click('#nav-orders');

    await expect(page.locator('h2:has-text("My Orders")')).toBeVisible();
  });

  test('7. Logout Flow', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.fill('#auth-email', TEST_USER.email);
    await page.fill('#auth-password', TEST_USER.password);
    await page.click('#auth-submit');

    // Wait until logged in
    await expect(page.locator('#nav-logout')).toBeVisible({ timeout: 5000 });
    await page.click('#nav-logout');

    // Should be back on auth page
    await expect(page.locator('text=Sign In')).toBeVisible();
  });
});
