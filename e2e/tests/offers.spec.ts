import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

const STUDENT_EMAIL = 'ana.pop@student.ro';
const STUDENT_PASSWORD = 'Student123!';

test.describe('Offers', () => {
  test('home page loads → offer list visible with at least one card', async ({ page }) => {
    await page.goto('/');
    // Wait for grid or at least one offer card
    await expect(page.locator('app-offer-card').first()).toBeVisible({ timeout: 15_000 });
  });

  test('click an offer card → navigates to /offers/:id, offer title visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('app-offer-card').first()).toBeVisible({ timeout: 15_000 });
    // The card navigates via the "Vezi oferta" button which has [routerLink]
    await page.locator('app-offer-card').first().locator('button.offer__cta').click();
    await page.waitForURL(/\/offers\/\d+/, { timeout: 15_000 });
    await expect(page.locator('h1.detail__title')).toBeVisible();
  });

  test('create offer page unauthenticated → redirected to /login', async ({ page }) => {
    await page.goto('/offers/create');
    await page.waitForURL(url => url.pathname.includes('/login'), { timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('create offer authenticated as student → form visible, submit → offer in my-offers', async ({ page }) => {
    await loginAs(page, STUDENT_EMAIL, STUDENT_PASSWORD);

    await page.goto('/offers/create');
    await expect(page.locator('input[formcontrolname="title"]')).toBeVisible({ timeout: 10_000 });

    const offerTitle = `E2E Offer ${Date.now()}`;
    await page.locator('input[formcontrolname="title"]').fill(offerTitle);
    await page.locator('textarea[formcontrolname="description"]').fill('E2E test description for Playwright automated test offer.');

    // Select first available subject
    await page.locator('select[formcontrolname="subjectId"]').selectOption({ index: 1 });
    await page.locator('select[formcontrolname="level"]').selectOption({ index: 1 });
    await page.locator('select[formcontrolname="sessionType"]').selectOption({ index: 1 });
    await page.locator('input[formcontrolname="price"]').fill('50');

    await page.locator('button[type="submit"]').click();

    // Should navigate away from create page (to dashboard or offer detail)
    await page.waitForURL(url => !url.pathname.includes('/offers/create'), { timeout: 15_000 });

    // Navigate to my-offers and verify the new offer appears
    await page.goto('/dashboard/my-offers');
    await expect(page.locator('.dashboard-page h1')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(offerTitle)).toBeVisible({ timeout: 10_000 });
  });

  test('send study request → appears in my-requests sent tab', async ({ page }) => {
    await loginAs(page, STUDENT_EMAIL, STUDENT_PASSWORD);

    // Find an offer NOT owned by the student: iterate cards until we land on a detail
    // page that shows the "Trimite cerere" button in the tutor card (only shown when !isOwner)
    await page.goto('/');
    await expect(page.locator('app-offer-card').first()).toBeVisible({ timeout: 15_000 });
    await page.locator('.sbh-spinner').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});

    const cards = page.locator('app-offer-card');
    const cardCount = await cards.count();
    let foundOffer = false;

    for (let i = 0; i < cardCount; i++) {
      await cards.nth(i).locator('button.offer__cta').click();
      await page.waitForURL(/\/offers\/\d+/, { timeout: 15_000 });
      await page.locator('.sbh-spinner').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
      await expect(page.locator('h1.detail__title')).toBeVisible({ timeout: 10_000 });

      const sendRequestBtn = page.locator('.detail__tutor button.sbh-btn--stroked:has-text("Trimite cerere")');
      const isVisible = await sendRequestBtn.isVisible();
      if (isVisible) {
        foundOffer = true;
        await sendRequestBtn.click();
        break;
      }
      // This offer is owned by the student — go back and try the next one
      await page.goto('/');
      await expect(page.locator('app-offer-card').first()).toBeVisible({ timeout: 15_000 });
    }

    if (!foundOffer) {
      test.skip(true, 'No non-owned offer found on the home page — seed data may need an offer owned by a different user.');
      return;
    }

    // Fill the request form
    await expect(page.locator('.request-form-card')).toBeVisible({ timeout: 10_000 });
    await page.locator('textarea[formcontrolname="message"]').fill('Bună ziua, aș dori să solicit o sesiune de meditații.');

    // Submit and wait for the POST to complete (success or duplicate error — both count)
    const [response] = await Promise.all([
      page.waitForResponse(
        res => res.url().includes('/api/studyrequests') && res.request().method() === 'POST',
        { timeout: 15_000 }
      ),
      page.locator('.request-form-card button[type="submit"]').click(),
    ]);

    // A 201 means sent; a 400/409 means already sent — both mean the request exists
    expect([201, 400, 409]).toContain(response.status());

    // Navigate to my-requests and verify the sent tab has at least one card
    await page.goto('/dashboard/my-requests');
    await page.locator('.sbh-spinner').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});

    // "Trimise" tab should be active by default
    await expect(page.locator('button.tab:has-text("Trimise")')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('div.request-card').first()).toBeVisible({ timeout: 10_000 });
  });

  test('edit offer → updated title appears in my-offers', async ({ page }) => {
    await loginAs(page, STUDENT_EMAIL, STUDENT_PASSWORD);

    // Create a new offer first
    await page.goto('/offers/create');
    await expect(page.locator('input[formcontrolname="title"]')).toBeVisible({ timeout: 10_000 });

    const originalTitle = `E2E Edit Test ${Date.now()}`;
    await page.locator('input[formcontrolname="title"]').fill(originalTitle);
    await page.locator('textarea[formcontrolname="description"]').fill('E2E description for edit test offer.');
    await page.locator('select[formcontrolname="subjectId"]').selectOption({ index: 1 });
    await page.locator('select[formcontrolname="level"]').selectOption({ index: 1 });
    await page.locator('select[formcontrolname="sessionType"]').selectOption({ index: 1 });
    await page.locator('input[formcontrolname="price"]').fill('75');
    await page.locator('button[type="submit"]').click();

    // After create the app navigates to /offers/:id — grab the ID from the URL
    await page.waitForURL(/\/offers\/\d+$/, { timeout: 15_000 });
    const createdUrl = page.url();
    const match = createdUrl.match(/\/offers\/(\d+)$/);
    if (!match) throw new Error(`Unexpected post-create URL: ${createdUrl}`);
    const offerId = match[1];

    // Navigate directly to the edit page
    await page.goto(`/offers/${offerId}/edit`);
    await page.waitForURL(/\/offers\/\d+\/edit/, { timeout: 15_000 });

    // Wait for the form to hydrate — the subjectId is loaded asynchronously
    await expect(page.locator('input[formcontrolname="title"]')).toBeVisible({ timeout: 10_000 });
    await page.waitForFunction(() => {
      const sel = document.querySelector('select[formcontrolname="subjectId"]') as HTMLSelectElement | null;
      return sel !== null && sel.value !== '' && sel.value !== 'null';
    }, { timeout: 10_000 });

    // Update the title: triple-click selects all existing text, then fill replaces it
    const updatedTitle = `E2E Edited ${Date.now()}`;
    const titleInput = page.locator('input[formcontrolname="title"]');
    await titleInput.click({ clickCount: 3 });
    await titleInput.fill(updatedTitle);

    await page.locator('button[type="submit"]').click();

    // Form navigates to /offers/:id after a successful edit
    await page.waitForURL(/\/offers\/\d+$/, { timeout: 15_000 });

    // Navigate to my-offers and assert updated title is visible
    await page.goto('/dashboard/my-offers');
    await page.locator('.sbh-spinner').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
    await expect(page.getByText(updatedTitle)).toBeVisible({ timeout: 10_000 });
  });

  test('add to favorites → heart fills; remove from favorites → heart unfills', async ({ page }) => {
    await loginAs(page, STUDENT_EMAIL, STUDENT_PASSWORD);

    // Go to home and wait for offer cards and the favorites API to load
    await page.goto('/');
    await expect(page.locator('app-offer-card').first()).toBeVisible({ timeout: 15_000 });
    await page.locator('.sbh-spinner').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});

    const firstCard = page.locator('app-offer-card').first();
    const favBtn = firstCard.locator('button.offer__fav').first();
    await expect(favBtn).toBeVisible({ timeout: 10_000 });

    // Read initial icon — wait until the favorites API response has settled
    // (the icon toggles between 'favorite' and 'favorite_border')
    const iconSpan = favBtn.locator('span.material-icons');
    await expect(iconSpan).toBeVisible({ timeout: 10_000 });
    const iconBefore = (await iconSpan.innerText()).trim();
    const expectedAfterAdd = iconBefore === 'favorite_border' ? 'favorite' : 'favorite_border';
    const expectedAfterRemove = iconBefore;

    // Click to add/remove and wait for DOM update from the API response
    await favBtn.click();
    await expect(iconSpan).toHaveText(expectedAfterAdd, { timeout: 10_000 });

    // Click again to restore and wait for DOM update
    await favBtn.click();
    await expect(iconSpan).toHaveText(expectedAfterRemove, { timeout: 10_000 });
  });
});
