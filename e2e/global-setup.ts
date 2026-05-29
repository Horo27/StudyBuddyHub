import { chromium, FullConfig } from '@playwright/test';

async function waitForUrl(url: string, timeoutMs = 60_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (res.ok || res.status < 500) return;
    } catch {
      // not ready yet
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error(`Timed out waiting for ${url} to be reachable`);
}

async function globalSetup(_config: FullConfig) {
  console.log('Waiting for frontend at http://localhost:4200 ...');
  await waitForUrl('http://localhost:4200');
  console.log('Frontend ready.');

  console.log('Waiting for backend at http://localhost:8080/api/StudyOffers ...');
  await waitForUrl('http://localhost:8080/api/StudyOffers');
  console.log('Backend ready.');
}

export default globalSetup;
