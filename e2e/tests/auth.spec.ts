import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

const STUDENT_EMAIL = 'ana.pop@student.ro';
const STUDENT_PASSWORD = 'Student123!';

test.describe('Auth', () => {
  test('login with valid student credentials → redirected, token in localStorage', async ({ page }) => {
    await loginAs(page, STUDENT_EMAIL, STUDENT_PASSWORD);
    expect(page.url()).not.toContain('/login');
    const token = await page.evaluate(() => localStorage.getItem('sbh_token'));
    expect(token).toBeTruthy();
  });

  test('login with wrong password → stays on /login, error message visible', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[formcontrolname="email"]').fill(STUDENT_EMAIL);
    await page.locator('input[formcontrolname="password"]').fill('WrongPassword999!');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('.sbh-field__error').first()).toBeVisible();
  });

  test('register with new unique email → redirected, token in localStorage', async ({ page }) => {
    const uniqueEmail = `test${Date.now()}@example.com`;

    await page.goto('/register');
    await page.locator('input[formcontrolname="firstName"]').fill('Test');
    await page.locator('input[formcontrolname="lastName"]').fill('User');
    await page.locator('input[formcontrolname="email"]').fill(uniqueEmail);
    await page.locator('input[formcontrolname="password"]').fill('Password123!');
    await page.locator('button[type="submit"]').click();

    await page.waitForURL(url => !url.pathname.includes('/register'), { timeout: 15_000 });
    expect(page.url()).not.toContain('/register');
    const token = await page.evaluate(() => localStorage.getItem('sbh_token'));
    expect(token).toBeTruthy();
  });

  test('register with duplicate email → error message visible', async ({ page }) => {
    await page.goto('/register');
    await page.locator('input[formcontrolname="firstName"]').fill('Ana');
    await page.locator('input[formcontrolname="lastName"]').fill('Pop');
    await page.locator('input[formcontrolname="email"]').fill(STUDENT_EMAIL);
    await page.locator('input[formcontrolname="password"]').fill('Password123!');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('.sbh-field__error').first()).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/register/);
  });

  test('session persists across page reload → still logged in', async ({ page }) => {
    await loginAs(page, STUDENT_EMAIL, STUDENT_PASSWORD);

    // Reload the page — the token should survive
    await page.reload();

    // Navigate to a protected route; authGuard should NOT redirect to /login
    await page.goto('/dashboard/my-offers');
    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10_000 });
    await expect(page.locator('.dashboard-page h1')).toBeVisible({ timeout: 10_000 });
  });

  test('forced logout → protected route redirects to /login', async ({ page }) => {
    await loginAs(page, STUDENT_EMAIL, STUDENT_PASSWORD);

    // Manually wipe localStorage to simulate an expired/cleared session
    await page.evaluate(() => localStorage.clear());

    // Navigating to a protected route should now trigger the authGuard
    await page.goto('/dashboard/my-offers');
    await page.waitForURL(url => url.pathname.includes('/login'), { timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
  });
});
