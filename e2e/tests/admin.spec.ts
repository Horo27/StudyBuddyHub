import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

const ADMIN_EMAIL = 'admin@studybuddy.com';
const ADMIN_PASSWORD = 'Admin123!';
const STUDENT_EMAIL = 'ana.pop@student.ro';
const STUDENT_PASSWORD = 'Student123!';

test.describe('Admin', () => {
  test('/admin unauthenticated → redirected away from /admin', async ({ page }) => {
    await page.goto('/admin');
    // adminGuard redirects unauthenticated users to '/' (home)
    await page.waitForURL(url => !url.pathname.startsWith('/admin'), { timeout: 10_000 });
    expect(page.url()).not.toContain('/admin');
  });

  test('/admin as student → redirected (admin guard fires)', async ({ page }) => {
    await loginAs(page, STUDENT_EMAIL, STUDENT_PASSWORD);
    await page.goto('/admin');
    await page.waitForURL(url => !url.pathname.startsWith('/admin'), { timeout: 10_000 });
    expect(page.url()).not.toContain('/admin');
  });

  test('/admin as admin → admin panel visible with stats section', async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/admin');
    await expect(page.locator('.admin-page h1')).toBeVisible({ timeout: 10_000 });
    // Stats tab should be active by default, stats grid should render
    await expect(page.locator('.stats-grid, .stat-card').first()).toBeVisible({ timeout: 10_000 });
  });

  test('Users tab renders table with at least one row', async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/admin');
    await expect(page.locator('.admin-page h1')).toBeVisible({ timeout: 10_000 });

    // Click "Utilizatori" tab
    await page.locator('button.tab:has-text("Utilizatori")').click();

    // Wait for spinner to hide before asserting table content
    await page.locator('.sbh-spinner').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});

    await expect(page.locator('table.users-table')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('table.users-table tbody tr').first()).toBeVisible({ timeout: 10_000 });
  });

  test('change user role to Admin then restore to Student', async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/admin');
    await expect(page.locator('.admin-page h1')).toBeVisible({ timeout: 10_000 });

    // Open Users tab
    await page.locator('button.tab:has-text("Utilizatori")').click();
    await page.locator('.sbh-spinner').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
    await expect(page.locator('table.users-table')).toBeVisible({ timeout: 10_000 });

    // Find a row where the user is NOT already an Admin (the → Admin button is not disabled)
    const rows = page.locator('table.users-table tbody tr');
    const rowCount = await rows.count();
    let targetRow: ReturnType<typeof page.locator> | null = null;

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const promoteBtn = row.locator('button:has-text("→ Admin")');
      const isDisabled = await promoteBtn.evaluate((el) => (el as HTMLButtonElement).disabled).catch(() => true);
      if (!isDisabled) {
        targetRow = row;
        break;
      }
    }

    if (!targetRow) {
      test.skip(true, 'All users are already Admin — cannot test role promotion.');
      return;
    }

    // Promote to Admin
    await targetRow.locator('button:has-text("→ Admin")').click();

    // The chip in that row should now show "Admin"
    await expect(targetRow.locator('span.sbh-chip')).toContainText('Admin', { timeout: 10_000 });

    // Restore to Student
    await targetRow.locator('button:has-text("→ Student")').click();

    // The chip should no longer be exclusively "Admin"
    await expect(targetRow.locator('span.sbh-chip')).toContainText('Student', { timeout: 10_000 });
  });
});
