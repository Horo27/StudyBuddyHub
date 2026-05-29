import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

const STUDENT_EMAIL = 'ana.pop@student.ro';
const STUDENT_PASSWORD = 'Student123!';
const ADMIN_EMAIL = 'admin@studybuddy.com';
const ADMIN_PASSWORD = 'Admin123!';
const API = 'http://localhost:8080/api';

// Use the backend API directly to:
//  1. login as admin → create a fresh offer (guarantees no prior requests)
//  2. login as student → POST a study request to that offer
// Returns the offer ID so callers can verify if needed.
async function createOfferAndSendRequest(): Promise<number> {
  // Step 1: get admin token
  const loginAdmin = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!loginAdmin.ok) throw new Error(`Admin login failed: ${loginAdmin.status}`);
  const { token: adminToken } = await loginAdmin.json() as { token: string };

  // Step 2: get the first available subject ID
  const subjectsRes = await fetch(`${API}/subjects`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const subjects = await subjectsRes.json() as { id: number }[];
  const subjectId = subjects[0].id;

  // Step 3: create a fresh offer as admin
  const createRes = await fetch(`${API}/studyoffers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      title: `E2E Request Test ${Date.now()}`,
      description: 'Auto-created by Playwright for request accept/reject tests.',
      subjectId,
      level: 0,        // Beginner
      sessionType: 0,  // Online
      price: 50,
    }),
  });
  if (!createRes.ok) throw new Error(`Create offer failed: ${createRes.status}`);
  const offer = await createRes.json() as { id: number };

  // Step 4: get student token
  const loginStudent = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: STUDENT_EMAIL, password: STUDENT_PASSWORD }),
  });
  if (!loginStudent.ok) throw new Error(`Student login failed: ${loginStudent.status}`);
  const { token: studentToken } = await loginStudent.json() as { token: string };

  // Step 5: send a study request to the new offer
  const requestRes = await fetch(`${API}/studyrequests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({ offerId: offer.id, message: 'E2E auto-request for accept/reject test.' }),
  });
  if (!requestRes.ok) throw new Error(`Create study request failed: ${requestRes.status}`);

  return offer.id;
}

test.describe('Dashboard', () => {
  test('my-offers unauthenticated → redirected to /login', async ({ page }) => {
    await page.goto('/dashboard/my-offers');
    await page.waitForURL(url => url.pathname.includes('/login'), { timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('my-offers as student → page renders without crash', async ({ page }) => {
    await loginAs(page, STUDENT_EMAIL, STUDENT_PASSWORD);
    await page.goto('/dashboard/my-offers');
    await expect(page.locator('.dashboard-page h1')).toBeVisible({ timeout: 10_000 });
    // Either the offers grid or the empty-state should be present
    const hasContent = await page.locator('.sbh-offers-grid, .empty-state').first().isVisible();
    expect(hasContent).toBe(true);
  });

  test('my-requests as student → page renders without crash', async ({ page }) => {
    await loginAs(page, STUDENT_EMAIL, STUDENT_PASSWORD);
    await page.goto('/dashboard/my-requests');
    await expect(page.locator('.dashboard-page h1')).toBeVisible({ timeout: 10_000 });
    // Tabs should be visible
    await expect(page.locator('button.tab').first()).toBeVisible();
    // Wait for spinner to disappear before checking content
    await page.locator('.sbh-spinner').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
    // Either requests list or empty-state should be present
    await expect(page.locator('.requests-list, .empty-state').first()).toBeVisible({ timeout: 10_000 });
  });

  test('accept a received request → status chip changes from pending', async ({ page }) => {
    // Create a brand-new offer as admin + send a request as student via the API,
    // so this test is self-sufficient regardless of execution order or prior runs.
    await createOfferAndSendRequest();

    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/dashboard/my-requests');
    await expect(page.locator('.dashboard-page h1')).toBeVisible({ timeout: 10_000 });
    await page.locator('button.tab:has-text("Primite")').click();
    await page.locator('.sbh-spinner').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});

    // Find the first card that has an Accept button and note its index so the
    // locator stays stable after the button is removed from the DOM on status change.
    const cards = page.locator('div.request-card');
    const pendingCardIndex = await cards.filter({ has: page.locator('button:has-text("Acceptă")') }).first().evaluate(
      el => Array.from(el.parentElement!.children).indexOf(el)
    );
    const card = cards.nth(pendingCardIndex);

    await card.locator('button:has-text("Acceptă")').click();

    await expect(card.locator('span.sbh-chip').first()).not.toHaveText('În așteptare', { timeout: 10_000 });
  });

  test('reject a received request → status chip changes from pending', async ({ page }) => {
    // Create a brand-new offer as admin + send a request as student via the API.
    await createOfferAndSendRequest();

    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/dashboard/my-requests');
    await expect(page.locator('.dashboard-page h1')).toBeVisible({ timeout: 10_000 });
    await page.locator('button.tab:has-text("Primite")').click();
    await page.locator('.sbh-spinner').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});

    // Find the first card that has a Reject button and note its index so the
    // locator stays stable after the button is removed from the DOM on status change.
    const cards = page.locator('div.request-card');
    const pendingCardIndex = await cards.filter({ has: page.locator('button:has-text("Respinge")') }).first().evaluate(
      el => Array.from(el.parentElement!.children).indexOf(el)
    );
    const card = cards.nth(pendingCardIndex);

    await card.locator('button:has-text("Respinge")').click();

    await expect(card.locator('span.sbh-chip').first()).not.toHaveText('În așteptare', { timeout: 10_000 });
  });
});
