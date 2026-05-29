import { Page } from '@playwright/test';

export async function loginAs(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.locator('input[formcontrolname="email"]').fill(email);
  await page.locator('input[formcontrolname="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15_000 });
  // Wait until the token is written to localStorage before proceeding
  await page.waitForFunction(() => !!localStorage.getItem('sbh_token'), { timeout: 10_000 });
}
