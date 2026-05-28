import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StudyRequestsService } from '../../../core/services/study-requests.service';
import { StudyRequest } from '../../../core/models/study-request.models';

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule, MatSnackBarModule],
  template: `
    <div class="dashboard-page">
      <div class="dashboard-header">
        <div>
          <h1>Cererile mele</h1>
          <p>Urmărește cererile trimise și primite.</p>
        </div>
      </div>

      <!-- Custom tabs -->
      <div class="tabs">
        <button class="tab" [class.tab--active]="activeTab() === 'sent'" (click)="activeTab.set('sent')">
          <span class="material-icons-outlined">send</span>
          Trimise
          @if (sentRequests.length > 0) {
            <span class="tab-badge">{{ sentRequests.length }}</span>
          }
        </button>
        <button class="tab" [class.tab--active]="activeTab() === 'received'" (click)="activeTab.set('received')">
          <span class="material-icons-outlined">inbox</span>
          Primite
          @if (pendingReceived > 0) {
            <span class="tab-badge tab-badge--accent">{{ pendingReceived }}</span>
          }
        </button>
      </div>

      <!-- SENT -->
      @if (activeTab() === 'sent') {
        @if (loadingSent) {
          <div class="spinner-container"><div class="sbh-spinner"></div></div>
        } @else if (sentRequests.length === 0) {
          <div class="empty-state">
            <span class="material-icons-outlined">send</span>
            <h3>Nu ai trimis nicio cerere</h3>
            <p>Explorează ofertele disponibile și trimite o cerere tutorului potrivit.</p>
            <a routerLink="/" class="sbh-btn sbh-btn--raised" style="margin-top:16px">Explorează oferte</a>
          </div>
        } @else {
          <div class="requests-list">
            @for (req of sentRequests; track req.id) {
              <div class="request-card">
                <div class="request-card__head">
                  <div class="request-card__info">
                    <a [routerLink]="['/offers', req.offerId]" class="request-card__offer">
                      {{ req.offerTitle }}
                    </a>
                    <span class="request-card__subject">{{ req.offerSubject }}</span>
                  </div>
                  <span class="sbh-chip" [ngClass]="statusChipClass(req.status)">
                    {{ statusLabel(req.status) }}
                  </span>
                </div>
                @if (req.message) {
                  <p class="request-card__msg">{{ req.message }}</p>
                }
                <div class="request-card__foot">
                  <span class="request-card__date">{{ req.createdAt | date:'d MMM yyyy' }}</span>
                  @if (req.status === 'Pending') {
                    <button class="sbh-btn sbh-btn--stroked sbh-btn--sm"
                            style="color:#c62828;border-color:#c62828"
                            (click)="cancel(req.id)">
                      <span class="material-icons-outlined" style="font-size:16px">cancel</span>
                      Anulează
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        }
      }

      <!-- RECEIVED -->
      @if (activeTab() === 'received') {
        @if (loadingReceived) {
          <div class="spinner-container"><div class="sbh-spinner"></div></div>
        } @else if (receivedRequests.length === 0) {
          <div class="empty-state">
            <span class="material-icons-outlined">inbox</span>
            <h3>Nu ai primit nicio cerere</h3>
            <p>Publică oferte pentru a primi cereri de la elevi.</p>
            <a routerLink="/offers/create" class="sbh-btn sbh-btn--raised" style="margin-top:16px">Publică ofertă</a>
          </div>
        } @else {
          <div class="requests-list">
            @for (req of receivedRequests; track req.id) {
              <div class="request-card" [class.request-card--pending]="req.status === 'Pending'">
                <div class="request-card__head">
                  <div class="request-card__info">
                    <span class="request-card__offer">{{ req.requesterName }}</span>
                    <span class="request-card__subject">
                      pentru <a [routerLink]="['/offers', req.offerId]">{{ req.offerTitle }}</a>
                    </span>
                  </div>
                  <span class="sbh-chip" [ngClass]="statusChipClass(req.status)">
                    {{ statusLabel(req.status) }}
                  </span>
                </div>
                @if (req.message) {
                  <p class="request-card__msg">{{ req.message }}</p>
                }
                <div class="request-card__foot">
                  <span class="request-card__date">{{ req.createdAt | date:'d MMM yyyy' }}</span>
                  @if (req.status === 'Pending') {
                    <div style="display:flex;gap:8px">
                      <button class="sbh-btn sbh-btn--raised sbh-btn--sm" (click)="accept(req.id)">
                        <span class="material-icons-outlined" style="font-size:16px">check</span>
                        Acceptă
                      </button>
                      <button class="sbh-btn sbh-btn--stroked sbh-btn--sm"
                              style="color:#c62828;border-color:#c62828"
                              (click)="reject(req.id)">
                        <span class="material-icons-outlined" style="font-size:16px">close</span>
                        Respinge
                      </button>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .dashboard-page { max-width: 860px; margin: 0 auto; padding: 32px 32px 80px; }
    .dashboard-header {
      margin-bottom: 28px;
      h1 { font-size: 28px; font-weight: 800; letter-spacing: -.025em; color: var(--indigo-900); margin: 0 0 4px; }
      p  { color: var(--text-muted); font-size: 15px; margin: 0; }
    }
    .tabs {
      display: flex; gap: 4px; padding: 4px;
      background: var(--indigo-50); border-radius: 12px;
      margin-bottom: 28px; width: fit-content;
    }
    .tab {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 20px; border-radius: 8px;
      font-weight: 600; font-size: 14.5px; color: var(--text-muted);
      background: transparent; border: 0; cursor: pointer; font-family: inherit;
      transition: background .15s, color .15s;
      .material-icons-outlined { font-size: 18px; }
      &:hover { background: white; color: var(--text); }
    }
    .tab--active { background: white; color: var(--indigo-700); box-shadow: var(--shadow-sm); }
    .tab-badge {
      display: inline-grid; place-items: center;
      width: 20px; height: 20px; border-radius: 999px;
      background: var(--indigo-700); color: white;
      font-size: 11px; font-weight: 700;
    }
    .tab-badge--accent { background: var(--coral-600); }
    .requests-list { display: flex; flex-direction: column; gap: 16px; }
    .request-card {
      background: white; border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 20px 24px;
      box-shadow: var(--shadow-xs);
      transition: box-shadow .2s;
      &:hover { box-shadow: var(--shadow-md); }
    }
    .request-card--pending { border-left: 4px solid var(--coral-600); }
    .request-card__head {
      display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
      margin-bottom: 10px;
    }
    .request-card__info { display: flex; flex-direction: column; gap: 4px; }
    .request-card__offer {
      font-size: 16px; font-weight: 700; color: var(--indigo-900);
      text-decoration: none;
      &:hover { color: var(--indigo-700); text-decoration: underline; }
    }
    .request-card__subject {
      font-size: 13px; color: var(--text-muted);
      a { color: var(--indigo-700); font-weight: 600; text-decoration: none;
        &:hover { text-decoration: underline; }
      }
    }
    .request-card__msg {
      font-size: 14.5px; color: var(--text); line-height: 1.55;
      font-style: italic; margin: 8px 0 12px;
      padding: 10px 14px; background: var(--bg-soft);
      border-radius: 8px; border-left: 3px solid var(--border-strong);
    }
    .request-card__foot {
      display: flex; align-items: center; justify-content: space-between; gap: 16px;
      margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border);
    }
    .request-card__date { font-size: 12.5px; color: var(--text-soft); }
    .sbh-spinner {
      width: 40px; height: 40px; border-radius: 999px;
      border: 3px solid var(--indigo-100); border-top-color: var(--indigo-700);
      animation: spin .8s linear infinite;
    }
    .spinner-container { display: flex; justify-content: center; padding: 60px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 600px) { .dashboard-page { padding: 20px 18px 60px; } }
  `]
})
export class MyRequestsComponent implements OnInit {
  private readonly requestsService = inject(StudyRequestsService);
  private readonly snackBar = inject(MatSnackBar);

  readonly activeTab = signal<'sent' | 'received'>('sent');
  sentRequests: StudyRequest[] = [];
  receivedRequests: StudyRequest[] = [];
  loadingSent = false;
  loadingReceived = false;

  get pendingReceived(): number {
    return this.receivedRequests.filter(r => r.status === 'Pending').length;
  }

  ngOnInit(): void {
    this.loadSent();
    this.loadReceived();
  }

  accept(id: number): void {
    this.requestsService.accept(id).subscribe({
      next: () => {
        const req = this.receivedRequests.find(r => r.id === id);
        if (req) req.status = 'Accepted';
        this.snackBar.open('Cerere acceptată', 'OK', { duration: 3000 });
      },
      error: err => this.snackBar.open(err.error?.message ?? 'Eroare', 'OK', { duration: 3000 })
    });
  }

  reject(id: number): void {
    this.requestsService.reject(id).subscribe({
      next: () => {
        const req = this.receivedRequests.find(r => r.id === id);
        if (req) req.status = 'Rejected';
        this.snackBar.open('Cerere respinsă', 'OK', { duration: 3000 });
      },
      error: err => this.snackBar.open(err.error?.message ?? 'Eroare', 'OK', { duration: 3000 })
    });
  }

  cancel(id: number): void {
    this.requestsService.cancel(id).subscribe({
      next: () => {
        const req = this.sentRequests.find(r => r.id === id);
        if (req) req.status = 'Cancelled';
        this.snackBar.open('Cerere anulată', 'OK', { duration: 3000 });
      },
      error: err => this.snackBar.open(err.error?.message ?? 'Eroare', 'OK', { duration: 3000 })
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      Pending: 'În așteptare',
      Accepted: 'Acceptată',
      Rejected: 'Respinsă',
      Cancelled: 'Anulată'
    };
    return map[status] ?? status;
  }

  statusChipClass(status: string): string {
    const map: Record<string, string> = {
      Pending:   'sbh-chip--coral',
      Accepted:  'sbh-chip--success',
      Rejected:  '',
      Cancelled: 'sbh-chip--outline'
    };
    return map[status] ?? '';
  }

  private loadSent(): void {
    this.loadingSent = true;
    this.requestsService.getSent().subscribe({
      next: data => { this.sentRequests = data; this.loadingSent = false; },
      error: () => { this.loadingSent = false; }
    });
  }

  private loadReceived(): void {
    this.loadingReceived = true;
    this.requestsService.getReceived().subscribe({
      next: data => { this.receivedRequests = data; this.loadingReceived = false; },
      error: () => { this.loadingReceived = false; }
    });
  }
}
