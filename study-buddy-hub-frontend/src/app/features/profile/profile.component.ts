import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { avatarStyle, initials } from '../../shared/utils/avatar.utils';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule],
  template: `
    @if (user) {
      <div class="profile-page">
        <!-- Header banner -->
        <div class="profile-banner">
          <div class="profile-banner__inner">
            <span class="sbh-avatar sbh-avatar--xl" [style.background]="userAvatarStyle">
              {{ userInitials }}
            </span>
            <div class="profile-banner__info">
              <h1>{{ user.firstName }} {{ user.lastName }}</h1>
              <p>{{ user.email }}</p>
              <div class="profile-banner__chips">
                <span class="sbh-chip" [ngClass]="isAdmin ? 'sbh-chip--solid' : 'sbh-chip--outline'">
                  <span class="material-icons-outlined">{{ isAdmin ? 'admin_panel_settings' : 'school' }}</span>
                  {{ isAdmin ? 'Admin' : 'Student' }}
                </span>
                @if (user.university) {
                  <span class="sbh-chip sbh-chip--outline">
                    <span class="material-icons-outlined">account_balance</span>
                    {{ user.university }}
                  </span>
                }
              </div>
            </div>
            <button class="sbh-btn sbh-btn--stroked" (click)="auth.logout()">
              <span class="material-icons-outlined">logout</span>
              Deconectare
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="profile-content">
          <!-- Info cards -->
          <div class="profile-grid">
            <div class="info-card">
              <div class="info-card__title">Informații personale</div>
              <div class="info-rows">
                <div class="info-row">
                  <span class="material-icons-outlined">person</span>
                  <div>
                    <div class="info-row__label">Nume complet</div>
                    <div>{{ user.firstName }} {{ user.lastName }}</div>
                  </div>
                </div>
                <div class="info-row">
                  <span class="material-icons-outlined">mail</span>
                  <div>
                    <div class="info-row__label">Email</div>
                    <div>{{ user.email }}</div>
                  </div>
                </div>
                <div class="info-row">
                  <span class="material-icons-outlined">school</span>
                  <div>
                    <div class="info-row__label">Facultate</div>
                    <div>{{ user.faculty ?? '—' }}</div>
                  </div>
                </div>
                <div class="info-row">
                  <span class="material-icons-outlined">account_balance</span>
                  <div>
                    <div class="info-row__label">Universitate</div>
                    <div>{{ user.university ?? '—' }}</div>
                  </div>
                </div>
                <div class="info-row">
                  <span class="material-icons-outlined">calendar_today</span>
                  <div>
                    <div class="info-row__label">Membru din</div>
                    <div>{{ user.createdAt | date:'d MMMM yyyy' }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick actions -->
            <div class="quick-actions">
              <div class="info-card__title">Acțiuni rapide</div>
              <div class="action-list">
                <a routerLink="/dashboard/my-offers" class="action-item">
                  <span class="action-item__icon">
                    <span class="material-icons-outlined">list_alt</span>
                  </span>
                  <div class="action-item__text">
                    <div class="action-item__label">Ofertele mele</div>
                    <div class="action-item__sub">Gestionează ofertele publicate</div>
                  </div>
                  <span class="material-icons-outlined action-item__arrow">arrow_forward</span>
                </a>
                <a routerLink="/dashboard/my-requests" class="action-item">
                  <span class="action-item__icon">
                    <span class="material-icons-outlined">send</span>
                  </span>
                  <div class="action-item__text">
                    <div class="action-item__label">Cererile mele</div>
                    <div class="action-item__sub">Urmărește cererile trimise și primite</div>
                  </div>
                  <span class="material-icons-outlined action-item__arrow">arrow_forward</span>
                </a>
                <a routerLink="/offers/create" class="action-item action-item--accent">
                  <span class="action-item__icon action-item__icon--accent">
                    <span class="material-icons-outlined">add_circle</span>
                  </span>
                  <div class="action-item__text">
                    <div class="action-item__label">Publică ofertă nouă</div>
                    <div class="action-item__sub">Adaugă o nouă ofertă de meditații</div>
                  </div>
                  <span class="material-icons-outlined action-item__arrow">arrow_forward</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .profile-page { }
    .profile-banner {
      background:
        radial-gradient(900px 400px at 80% -10%, rgba(255,107,53,.15), transparent 60%),
        linear-gradient(180deg, var(--indigo-900) 0%, var(--indigo-700) 100%);
      padding: 48px 32px;
    }
    .profile-banner__inner {
      max-width: 1000px; margin: 0 auto;
      display: flex; align-items: center; gap: 28px;
    }
    .profile-banner__info {
      flex: 1;
      h1 { font-size: 32px; font-weight: 800; letter-spacing: -.025em; color: white; margin: 0 0 6px; }
      p  { color: rgba(255,255,255,.7); font-size: 15px; margin: 0 0 14px; }
    }
    .profile-banner__chips { display: flex; gap: 8px; flex-wrap: wrap; }

    .profile-content {
      max-width: 1000px; margin: 0 auto; padding: 32px 32px 80px;
    }
    .profile-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
      align-items: flex-start;
    }
    .info-card {
      background: white; border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 24px;
      box-shadow: var(--shadow-sm);
    }
    .info-card__title {
      font-size: 13px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: .06em;
      margin-bottom: 20px;
    }
    .info-rows { display: grid; gap: 18px; }
    .info-row {
      display: flex; align-items: flex-start; gap: 14px;
      .material-icons-outlined { font-size: 20px; color: var(--text-soft); margin-top: 1px; flex-shrink: 0; }
    }
    .info-row__label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: .04em; margin-bottom: 2px; }

    .quick-actions { }
    .action-list { display: grid; gap: 10px; }
    .action-item {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 16px; border-radius: var(--radius-lg);
      background: white; border: 1px solid var(--border);
      text-decoration: none; color: inherit;
      transition: box-shadow .15s, transform .15s, border-color .15s;
      &:hover {
        box-shadow: var(--shadow-md); transform: translateY(-1px);
        border-color: var(--border-strong);
      }
    }
    .action-item--accent { border-color: var(--indigo-100); background: var(--indigo-50); }
    .action-item__icon {
      width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
      background: var(--indigo-50); color: var(--indigo-700);
      display: grid; place-items: center;
      .material-icons-outlined { font-size: 22px; }
    }
    .action-item__icon--accent { background: var(--indigo-700); color: white; }
    .action-item__text { flex: 1; }
    .action-item__label { font-weight: 700; font-size: 14.5px; color: var(--indigo-900); }
    .action-item__sub { font-size: 12.5px; color: var(--text-muted); margin-top: 2px; }
    .action-item__arrow { font-size: 20px; color: var(--text-soft); flex-shrink: 0; }

    @media (max-width: 700px) {
      .profile-banner { padding: 32px 18px; }
      .profile-banner__inner { flex-direction: column; align-items: flex-start; gap: 16px; }
      .profile-content { padding: 24px 18px 60px; }
      .profile-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ProfileComponent {
  readonly auth = inject(AuthService);
  get user() { return this.auth.getCurrentUser(); }
  get isAdmin(): boolean { return this.auth.isAdmin(); }

  get userInitials(): string {
    const u = this.user;
    if (!u) return '?';
    return initials(`${u.firstName} ${u.lastName}`);
  }
  get userAvatarStyle(): string {
    const u = this.user;
    if (!u) return '';
    return avatarStyle(`${u.firstName} ${u.lastName}`);
  }
}
