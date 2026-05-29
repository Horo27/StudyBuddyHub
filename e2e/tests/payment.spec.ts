import { test, expect, Page } from '@playwright/test';
import { loginAs } from '../helpers/auth';
import * as crypto from 'crypto';

const STUDENT_EMAIL = 'ana.pop@student.ro';
const STUDENT_PASSWORD = 'Student123!';
const TUTOR_EMAIL = 'admin@studybuddy.com';
const TUTOR_PASSWORD = 'Admin123!';
const API = 'http://localhost:8080/api';

// ---------------------------------------------------------------------------
// Stripe webhook secret used in tests — must match Stripe:WebhookSecret in
// the backend's appsettings. If the backend uses a different value, set the
// env variable STRIPE_WEBHOOK_SECRET before running the suite.
// ---------------------------------------------------------------------------
const WEBHOOK_SECRET = process.env['STRIPE_WEBHOOK_SECRET']
  ?? 'whsec_a10cbb0be34de5e3847964397a34aff7f490be44ad98869622d57a171f79336b';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getToken(email: string, password: string): Promise<string> {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login failed for ${email}: ${res.status}`);
  const { token } = await res.json() as { token: string };
  return token;
}

async function getFirstSubjectId(token: string): Promise<number> {
  const res = await fetch(`${API}/subjects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const subjects = await res.json() as { id: number }[];
  return subjects[0].id;
}

/**
 * Creates a fresh offer as tutor, sends a request as student, accepts it as
 * tutor. Returns the requestId and offerId ready for payment.
 */
async function setupAcceptedRequest(): Promise<{ requestId: number; offerId: number }> {
  const tutorToken = await getToken(TUTOR_EMAIL, TUTOR_PASSWORD);
  const studentToken = await getToken(STUDENT_EMAIL, STUDENT_PASSWORD);
  const subjectId = await getFirstSubjectId(tutorToken);

  const offerRes = await fetch(`${API}/studyoffers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tutorToken}` },
    body: JSON.stringify({
      title: `Payment E2E ${Date.now()}`,
      description: 'Auto-created for payment e2e tests.',
      subjectId,
      level: 0,
      sessionType: 0,
      price: 75,
    }),
  });
  if (!offerRes.ok) throw new Error(`Create offer failed: ${offerRes.status}`);
  const offer = await offerRes.json() as { id: number };

  const reqRes = await fetch(`${API}/studyrequests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({ offerId: offer.id, message: 'Payment e2e auto-request.' }),
  });
  if (!reqRes.ok) throw new Error(`Create request failed: ${reqRes.status}`);
  const req = await reqRes.json() as { id: number };

  const acceptRes = await fetch(`${API}/studyrequests/${req.id}/accept`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tutorToken}` },
  });
  if (!acceptRes.ok) throw new Error(`Accept request failed: ${acceptRes.status}`);

  return { requestId: req.id, offerId: offer.id };
}

/**
 * Builds a Stripe-style HMAC-SHA256 signature for the webhook payload.
 * Format: t=<timestamp>,v1=<signature>
 */
function buildStripeSignature(payload: string, secret: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');
  return `t=${timestamp},v1=${signature}`;
}

/**
 * Simulates a successful Stripe checkout.session.completed webhook for a
 * given requestId/offerId/studentId. Returns the fetch Response.
 */
async function simulateWebhook(
  requestId: number,
  offerId: number,
  studentId: string,
  paymentStatus: 'paid' | 'unpaid' = 'paid',
): Promise<Response> {
  const sessionId = `cs_test_sim_${Date.now()}`;
  const event = {
    id: `evt_test_${Date.now()}`,
    object: 'event',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: sessionId,
        object: 'checkout.session',
        payment_status: paymentStatus,
        metadata: {
          requestId: String(requestId),
          offerId: String(offerId),
          studentId,
        },
      },
    },
  };

  const payload = JSON.stringify(event);
  const signature = buildStripeSignature(payload, WEBHOOK_SECRET);

  return fetch(`${API}/payments/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Stripe-Signature': signature,
    },
    body: payload,
  });
}

/** Injects a JWT token directly into localStorage (skips the login UI). */
async function injectToken(page: Page, token: string): Promise<void> {
  await page.goto('/');
  await page.evaluate((t) => localStorage.setItem('sbh_token', t), token);
  await page.reload();
}

// ---------------------------------------------------------------------------
// Static page smoke tests
// ---------------------------------------------------------------------------

test.describe('Payment static pages', () => {
  test('/payment/success renders success heading', async ({ page }) => {
    await page.goto('/payment/success');
    await expect(page.locator('h1')).toContainText('Plată reușită', { timeout: 10_000 });
  });

  test('/payment/cancel renders cancel heading', async ({ page }) => {
    await page.goto('/payment/cancel');
    await expect(page.locator('h1')).toBeVisible({ timeout: 10_000 });
  });
});

// ---------------------------------------------------------------------------
// Create-checkout endpoint
// ---------------------------------------------------------------------------

test.describe('Create checkout session (API)', () => {
  test('unauthenticated → 401', async () => {
    const res = await fetch(`${API}/payments/create-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: 999 }),
    });
    expect(res.status).toBe(401);
  });

  test('non-existent requestId → 404', async () => {
    const token = await getToken(STUDENT_EMAIL, STUDENT_PASSWORD);
    const res = await fetch(`${API}/payments/create-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ requestId: 999999 }),
    });
    expect(res.status).toBe(404);
  });

  test('pending (not accepted) request → 400', async () => {
    const tutorToken = await getToken(TUTOR_EMAIL, TUTOR_PASSWORD);
    const studentToken = await getToken(STUDENT_EMAIL, STUDENT_PASSWORD);
    const subjectId = await getFirstSubjectId(tutorToken);

    const offerRes = await fetch(`${API}/studyoffers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tutorToken}` },
      body: JSON.stringify({
        title: `Checkout test pending ${Date.now()}`, description: 'e2e',
        subjectId, level: 0, sessionType: 0, price: 50,
      }),
    });
    const offer = await offerRes.json() as { id: number };

    const reqRes = await fetch(`${API}/studyrequests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ offerId: offer.id }),
    });
    const req = await reqRes.json() as { id: number };

    // Request is still Pending — payment must be blocked
    const res = await fetch(`${API}/payments/create-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ requestId: req.id }),
    });
    expect(res.status).toBe(400);
  });

  test('wrong user tries to pay someone else\'s request → 403', async () => {
    const { requestId } = await setupAcceptedRequest();
    // Login as the tutor (not the student who owns the request)
    const tutorToken = await getToken(TUTOR_EMAIL, TUTOR_PASSWORD);
    const res = await fetch(`${API}/payments/create-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tutorToken}` },
      body: JSON.stringify({ requestId }),
    });
    expect(res.status).toBe(403);
  });

  test('accepted request → returns a Stripe checkout URL', async () => {
    const { requestId } = await setupAcceptedRequest();
    const studentToken = await getToken(STUDENT_EMAIL, STUDENT_PASSWORD);

    const res = await fetch(`${API}/payments/create-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ requestId }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as { url: string };
    expect(body.url).toMatch(/^https:\/\//);
  });
});

// ---------------------------------------------------------------------------
// Webhook — simulated payment outcomes
// ---------------------------------------------------------------------------

test.describe('Stripe webhook simulation', () => {
  test('invalid signature → 400', async () => {
    const payload = JSON.stringify({ type: 'checkout.session.completed' });
    const res = await fetch(`${API}/payments/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Stripe-Signature': 'bad_sig' },
      body: payload,
    });
    expect(res.status).toBe(400);
  });

  test('unknown event type → 200 (ignored gracefully)', async () => {
    const payload = JSON.stringify({ id: 'evt_x', type: 'payment_intent.created', data: { object: {} } });
    const signature = buildStripeSignature(payload, WEBHOOK_SECRET);
    const res = await fetch(`${API}/payments/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Stripe-Signature': signature },
      body: payload,
    });
    expect(res.status).toBe(200);
  });

  test('successful payment → request marked Paid', async () => {
    const studentToken = await getToken(STUDENT_EMAIL, STUDENT_PASSWORD);
    const studentId = JSON.parse(
      Buffer.from(studentToken.split('.')[1], 'base64').toString()
    )['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] as string;

    const { requestId, offerId } = await setupAcceptedRequest();

    const webhookRes = await simulateWebhook(requestId, offerId, studentId);
    expect(webhookRes.status).toBe(200);

    // Verify via the sent-requests endpoint that paymentStatus is now Paid
    const sentRes = await fetch(`${API}/studyrequests/sent`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const requests = await sentRes.json() as { id: number; paymentStatus: string }[];
    const paid = requests.find(r => r.id === requestId);
    expect(paid?.paymentStatus).toBe('Paid');
  });

  test('successful payment → offer marked inactive', async () => {
    const studentToken = await getToken(STUDENT_EMAIL, STUDENT_PASSWORD);
    const studentId = JSON.parse(
      Buffer.from(studentToken.split('.')[1], 'base64').toString()
    )['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] as string;

    const { requestId, offerId } = await setupAcceptedRequest();

    await simulateWebhook(requestId, offerId, studentId);

    const offerRes = await fetch(`${API}/studyoffers/${offerId}`);
    const offer = await offerRes.json() as { isActive: boolean };
    expect(offer.isActive).toBe(false);
  });

  test('successful payment → offer disappears from public listing', async () => {
    const studentToken = await getToken(STUDENT_EMAIL, STUDENT_PASSWORD);
    const studentId = JSON.parse(
      Buffer.from(studentToken.split('.')[1], 'base64').toString()
    )['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] as string;

    const { requestId, offerId } = await setupAcceptedRequest();

    await simulateWebhook(requestId, offerId, studentId);

    // Public listing only returns isActive=true offers
    const listRes = await fetch(`${API}/studyoffers?isActive=true`);
    const offers = await listRes.json() as { id: number }[];
    expect(offers.find(o => o.id === offerId)).toBeUndefined();
  });

  test('duplicate webhook for same request → still 200, not double-paid', async () => {
    const studentToken = await getToken(STUDENT_EMAIL, STUDENT_PASSWORD);
    const studentId = JSON.parse(
      Buffer.from(studentToken.split('.')[1], 'base64').toString()
    )['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] as string;

    const { requestId, offerId } = await setupAcceptedRequest();

    // Fire the webhook twice
    const res1 = await simulateWebhook(requestId, offerId, studentId);
    const res2 = await simulateWebhook(requestId, offerId, studentId);
    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);

    // Still only Paid once — not some other corrupted state
    const sentRes = await fetch(`${API}/studyrequests/sent`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const requests = await sentRes.json() as { id: number; paymentStatus: string }[];
    const req = requests.find(r => r.id === requestId);
    expect(req?.paymentStatus).toBe('Paid');
  });

  test('create-checkout on already-paid request → 400', async () => {
    const studentToken = await getToken(STUDENT_EMAIL, STUDENT_PASSWORD);
    const studentId = JSON.parse(
      Buffer.from(studentToken.split('.')[1], 'base64').toString()
    )['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] as string;

    const { requestId, offerId } = await setupAcceptedRequest();
    await simulateWebhook(requestId, offerId, studentId);

    // Trying to pay again must be blocked
    const res = await fetch(`${API}/payments/create-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ requestId }),
    });
    expect(res.status).toBe(400);
  });

  test('successful payment → other accepted requests for same offer are cancelled', async () => {
    const tutorToken = await getToken(TUTOR_EMAIL, TUTOR_PASSWORD);
    const subjectId = await getFirstSubjectId(tutorToken);

    // Create offer
    const offerRes = await fetch(`${API}/studyoffers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tutorToken}` },
      body: JSON.stringify({
        title: `Multi-request cancel test ${Date.now()}`, description: 'e2e',
        subjectId, level: 0, sessionType: 0, price: 60,
      }),
    });
    const offer = await offerRes.json() as { id: number };

    // Two different student accounts both send requests
    // (reuse the same student for simplicity — create two separate requests by
    //  using a second unique account; if only one student account exists, create
    //  one more request via the API with a fresh registration)
    const studentToken = await getToken(STUDENT_EMAIL, STUDENT_PASSWORD);
    const studentId = JSON.parse(
      Buffer.from(studentToken.split('.')[1], 'base64').toString()
    )['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] as string;

    // Register a second student on the fly
    const secondEmail = `e2e_second_${Date.now()}@test.com`;
    await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: 'Second', lastName: 'Student', email: secondEmail, password: 'Student123!' }),
    });
    const secondToken = await getToken(secondEmail, 'Student123!');

    const req1Res = await fetch(`${API}/studyrequests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ offerId: offer.id }),
    });
    const req1 = await req1Res.json() as { id: number };

    const req2Res = await fetch(`${API}/studyrequests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secondToken}` },
      body: JSON.stringify({ offerId: offer.id }),
    });
    const req2 = await req2Res.json() as { id: number };

    // Accept both
    await fetch(`${API}/studyrequests/${req1.id}/accept`, {
      method: 'PATCH', headers: { Authorization: `Bearer ${tutorToken}` },
    });
    await fetch(`${API}/studyrequests/${req2.id}/accept`, {
      method: 'PATCH', headers: { Authorization: `Bearer ${tutorToken}` },
    });

    // Student 1 pays
    await simulateWebhook(req1.id, offer.id, studentId);

    // req2 must now be Cancelled
    const secondSentRes = await fetch(`${API}/studyrequests/sent`, {
      headers: { Authorization: `Bearer ${secondToken}` },
    });
    const secondRequests = await secondSentRes.json() as { id: number; status: string }[];
    const cancelledReq = secondRequests.find(r => r.id === req2.id);
    expect(cancelledReq?.status).toBe('Cancelled');
  });
});

// ---------------------------------------------------------------------------
// UI — pay button and post-payment display
// ---------------------------------------------------------------------------

test.describe('Payment UI flow', () => {
  test('"Plătește sesiunea" button visible on Accepted+Unpaid request', async ({ page }) => {
    const { requestId } = await setupAcceptedRequest();
    void requestId; // just used to confirm accepted state exists

    await loginAs(page, STUDENT_EMAIL, STUDENT_PASSWORD);
    await page.goto('/dashboard/my-requests');
    await page.locator('.sbh-spinner').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});

    await expect(
      page.locator('button:has-text("Plătește sesiunea")').first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('after simulated payment, "Plătit" chip appears for student', async ({ page }) => {
    const studentToken = await getToken(STUDENT_EMAIL, STUDENT_PASSWORD);
    const studentId = JSON.parse(
      Buffer.from(studentToken.split('.')[1], 'base64').toString()
    )['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] as string;

    const { requestId, offerId } = await setupAcceptedRequest();

    // Simulate payment via webhook before loading the UI
    await simulateWebhook(requestId, offerId, studentId);

    // Inject token directly (faster than UI login)
    await injectToken(page, studentToken);
    await page.goto('/dashboard/my-requests');
    await page.locator('.sbh-spinner').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});

    await expect(
      page.locator('.sbh-chip--success', { hasText: 'Plătit' }).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('after simulated payment, "Plătit" chip appears for tutor in Primite tab', async ({ page }) => {
    const studentToken = await getToken(STUDENT_EMAIL, STUDENT_PASSWORD);
    const studentId = JSON.parse(
      Buffer.from(studentToken.split('.')[1], 'base64').toString()
    )['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] as string;

    const tutorToken = await getToken(TUTOR_EMAIL, TUTOR_PASSWORD);
    const { requestId, offerId } = await setupAcceptedRequest();

    await simulateWebhook(requestId, offerId, studentId);

    await injectToken(page, tutorToken);
    await page.goto('/dashboard/my-requests');
    await page.locator('button.tab:has-text("Primite")').click();
    await page.locator('.sbh-spinner').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});

    await expect(
      page.locator('.sbh-chip--success', { hasText: 'Plătit' }).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('after simulated payment, offer shows "Platită" badge in tutor My Offers', async ({ page }) => {
    const studentToken = await getToken(STUDENT_EMAIL, STUDENT_PASSWORD);
    const studentId = JSON.parse(
      Buffer.from(studentToken.split('.')[1], 'base64').toString()
    )['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] as string;

    const tutorToken = await getToken(TUTOR_EMAIL, TUTOR_PASSWORD);
    const { requestId, offerId } = await setupAcceptedRequest();

    await simulateWebhook(requestId, offerId, studentId);

    await injectToken(page, tutorToken);
    await page.goto('/dashboard/my-offers');
    await page.locator('.sbh-spinner').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});

    await expect(
      page.locator('.sbh-chip--success', { hasText: 'Platită' }).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('paid offer does not appear in public listing', async ({ page }) => {
    const studentToken = await getToken(STUDENT_EMAIL, STUDENT_PASSWORD);
    const studentId = JSON.parse(
      Buffer.from(studentToken.split('.')[1], 'base64').toString()
    )['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] as string;

    const { requestId, offerId } = await setupAcceptedRequest();
    await simulateWebhook(requestId, offerId, studentId);

    await page.goto('/');
    await page.locator('.sbh-spinner').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});

    // There must be no card linking to the paid offer
    const paidOfferCard = page.locator(`a[href="/offers/${offerId}"], [routerLink*="${offerId}"]`);
    await expect(paidOfferCard).toHaveCount(0, { timeout: 10_000 });
  });

  test('paid offer detail page shows "Sesiune rezervată" instead of request button', async ({ page }) => {
    const studentToken = await getToken(STUDENT_EMAIL, STUDENT_PASSWORD);
    const studentId = JSON.parse(
      Buffer.from(studentToken.split('.')[1], 'base64').toString()
    )['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] as string;

    const { requestId, offerId } = await setupAcceptedRequest();
    await simulateWebhook(requestId, offerId, studentId);

    // Visit offer page as a random other logged-in user (re-use student here)
    await injectToken(page, studentToken);
    await page.goto(`/offers/${offerId}`);
    await page.locator('.detail').waitFor({ timeout: 10_000 });

    await expect(page.locator('.book__taken')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('button:has-text("Trimite cerere")')).toHaveCount(0);
  });

  test('"Plătește sesiunea" button not visible after payment', async ({ page }) => {
    const studentToken = await getToken(STUDENT_EMAIL, STUDENT_PASSWORD);
    const studentId = JSON.parse(
      Buffer.from(studentToken.split('.')[1], 'base64').toString()
    )['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] as string;

    const { requestId, offerId } = await setupAcceptedRequest();
    await simulateWebhook(requestId, offerId, studentId);

    await injectToken(page, studentToken);
    await page.goto('/dashboard/my-requests');
    await page.locator('.sbh-spinner').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});

    // The pay button for this specific request must not exist
    // (there may be others from unrelated offers)
    const allCards = page.locator('.request-card');
    const paidCard = allCards.filter({ has: page.locator('.sbh-chip--success:has-text("Plătit")') }).first();
    await expect(paidCard.locator('button:has-text("Plătește sesiunea")')).toHaveCount(0, { timeout: 10_000 });
  });
});
