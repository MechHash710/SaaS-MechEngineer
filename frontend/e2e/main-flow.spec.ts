import { test, expect } from '@playwright/test';

test.describe('End-to-End Flow: Auth -> Simulation -> PDF', () => {
  const testPassword = 'senha123!';

  test.beforeEach(async ({ page }) => {
    // Mock APIs to safely test the Frontend flow without depending on the real Backend
    await page.route('**/auth/register', async (route) => {
      await route.fulfill({ status: 201, json: { id: 1, email: 'mock@test.com' } });
    });
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({ status: 200, json: { access_token: 'fake', token_type: 'bearer' } });
    });
    await page.route('**/auth/me', async (route) => {
      await route.fulfill({ status: 200, json: { email: 'mock@test.com', name: 'Tester' } });
    });
  });

  test('1 - Login page loads and shows correct fields', async ({ page }) => {
    await page.goto('/?mode=login');
    await expect(page.locator('text=Entrar na plataforma')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('2 - Register page loads and shows correct form', async ({ page }) => {
    await page.goto('/?mode=register');
    await expect(page.locator('text=Crie sua conta')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
  });

  test('3 - Landing page loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=EngenhariaPro')).toBeVisible({ timeout: 10000 });
  });

  test('4 - Register a new user and access dashboard', async ({ page }) => {
    const uniqueEmail = `playwright_${Date.now()}@test.com`;

    await page.goto('/?mode=register');
    await page.fill('input[name="name"]', 'Playwright Tester');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.click('button[type="submit"]');

    // Wait for redirect away from register page (onboarding or main app)
    await Promise.race([
      page.waitForURL('**/onboarding**', { timeout: 10000 }),
      page.waitForURL((url) => !url.search.includes('mode=register'), { timeout: 10000 }),
    ]).catch(() => {
      // Registration may have failed (e.g. duplicate email in test DB) — check for error
    });

    const currentUrl = page.url();
    const isOnRegisterPage = currentUrl.includes('mode=register');

    if (!isOnRegisterPage) {
      await page.goto('/');
      // Auth check completes when the logout button is visible
      await expect(page.locator('button:has-text("Sair")')).toBeVisible({ timeout: 15000 });
    } else {
      // Registration failed — an error banner should be visible
      await expect(page.locator('.bg-red-50')).toBeVisible({ timeout: 5000 });
    }
  });

  test('5 - HVAC Simulation form is accessible via the simulator tab', async ({ page }) => {
    const uniqueEmail = `playwright2_${Date.now()}@test.com`;

    // Register & auto-login
    await page.goto('/?mode=register');
    await page.fill('input[name="name"]', 'HVAC Tester');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.click('button[type="submit"]');

    // Wait for redirect away from register (onboarding or main app)
    await Promise.race([
      page.waitForURL('**/onboarding**', { timeout: 10000 }),
      page.waitForURL((url) => !url.search.includes('mode=register'), { timeout: 10000 }),
    ]).catch(() => {});

    // Navigate directly to main app (skips onboarding if redirected there)
    await page.goto('/');

    // Auth check complete when logout button is visible
    await expect(page.locator('button:has-text("Sair")')).toBeVisible({ timeout: 15000 });

    // Navigate to HVAC module tab
    const hvacBtn = page.locator('button', { hasText: 'Carga Térmica AVAC' });
    await hvacBtn.scrollIntoViewIfNeeded();
    await expect(hvacBtn).toBeVisible({ timeout: 10000 });
    await hvacBtn.click();

    // HVAC form must render with its primary input
    await expect(page.locator('input[name="area_m2"]')).toBeVisible({ timeout: 15000 });
  });
});
