import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="page">
      <div class="card">
        <span class="material-icons-outlined icon">check_circle</span>
        <h1>Plată reușită!</h1>
        <p>Sesiunea a fost rezervată cu succes. Vei primi o notificare de confirmare în scurt timp.</p>
        <a routerLink="/dashboard/my-requests" class="sbh-btn sbh-btn--raised">
          Înapoi la cereri
        </a>
      </div>
    </div>
  `,
  styles: [`
    .page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: var(--bg-soft, #f8fafc); padding: 24px;
    }
    .card {
      background: white; border-radius: 16px; padding: 48px 40px;
      box-shadow: 0 4px 24px rgba(0,0,0,.08); text-align: center;
      max-width: 440px; width: 100%;
    }
    .icon { font-size: 72px; color: #2e7d32; margin-bottom: 16px; display: block; }
    h1 { font-size: 26px; font-weight: 800; color: #1b5e20; margin: 0 0 12px; }
    p  { color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 28px; }
  `]
})
export class PaymentSuccessComponent {}
