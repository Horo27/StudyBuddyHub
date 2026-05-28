import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';

interface AdminStats {
  totalUsers: number;
  activeOffers: number;
  pendingRequests: number;
  totalOffers: number;
  totalRequests: number;
}

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  faculty?: string;
  university?: string;
  createdAt: string;
  roles: string[];
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, DatePipe, MatSnackBarModule],
  template: `
    <div class="admin-page">
      <div class="admin-header">
        <div>
          <h1>Panou de administrare</h1>
          <p>Statistici platformă și gestionarea utilizatorilor.</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab" [class.tab--active]="activeTab() === 'stats'" (click)="activeTab.set('stats')">
          <span class="material-icons-outlined">bar_chart</span> Statistici
        </button>
        <button class="tab" [class.tab--active]="activeTab() === 'users'" (click)="activeTab.set('users')">
          <span class="material-icons-outlined">people</span> Utilizatori
          @if (users.length > 0) {
            <span class="tab-badge">{{ users.length }}</span>
          }
        </button>
      </div>

      <!-- Stats tab -->
      @if (activeTab() === 'stats') {
        @if (loadingStats) {
          <div class="spinner-container"><div class="sbh-spinner"></div></div>
        } @else if (stats) {
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-card__icon stat-card__icon--indigo">
                <span class="material-icons-outlined">people</span>
              </div>
              <div class="stat-card__num">{{ stats.totalUsers }}</div>
              <div class="stat-card__label">Utilizatori înregistrați</div>
            </div>
            <div class="stat-card">
              <div class="stat-card__icon stat-card__icon--success">
                <span class="material-icons-outlined">auto_stories</span>
              </div>
              <div class="stat-card__num">{{ stats.activeOffers }}</div>
              <div class="stat-card__label">Oferte active</div>
            </div>
            <div class="stat-card">
              <div class="stat-card__icon">
                <span class="material-icons-outlined">list_alt</span>
              </div>
              <div class="stat-card__num">{{ stats.totalOffers }}</div>
              <div class="stat-card__label">Total oferte</div>
            </div>
            <div class="stat-card">
              <div class="stat-card__icon stat-card__icon--coral">
                <span class="material-icons-outlined">send</span>
              </div>
              <div class="stat-card__num">{{ stats.totalRequests }}</div>
              <div class="stat-card__label">Total cereri</div>
            </div>
            @if (stats.pendingRequests !== undefined) {
              <div class="stat-card">
                <div class="stat-card__icon stat-card__icon--warn">
                  <span class="material-icons-outlined">pending</span>
                </div>
                <div class="stat-card__num">{{ stats.pendingRequests }}</div>
                <div class="stat-card__label">Cereri în așteptare</div>
              </div>
            }
          </div>
        }
      }

      <!-- Users tab -->
      @if (activeTab() === 'users') {
        @if (loadingUsers) {
          <div class="spinner-container"><div class="sbh-spinner"></div></div>
        } @else {
          <div class="users-table-wrap">
            <table class="users-table">
              <thead>
                <tr>
                  <th>Utilizator</th>
                  <th>Email</th>
                  <th>Instituție</th>
                  <th>Rol</th>
                  <th>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                @for (u of users; track u.id) {
                  <tr>
                    <td>
                      <div class="user-cell">
                        <div class="user-cell__name">{{ u.firstName }} {{ u.lastName }}</div>
                        <div class="user-cell__date">din {{ u.createdAt | date:'MMM yyyy' }}</div>
                      </div>
                    </td>
                    <td class="user-email">{{ u.email }}</td>
                    <td>
                      @if (u.university || u.faculty) {
                        <span>{{ u.faculty }}{{ u.faculty && u.university ? ' · ' : '' }}{{ u.university }}</span>
                      } @else {
                        <span style="color:var(--text-soft)">—</span>
                      }
                    </td>
                    <td>
                      @for (role of u.roles; track role) {
                        <span class="sbh-chip" [ngClass]="role === 'Admin' ? 'sbh-chip--solid' : 'sbh-chip--outline'"
                              style="font-size:12px;height:26px">
                          {{ role }}
                        </span>
                      }
                    </td>
                    <td>
                      <div style="display:flex;gap:6px">
                        <button class="sbh-btn sbh-btn--stroked sbh-btn--sm"
                                [disabled]="u.roles.includes('Admin')"
                                (click)="changeRole(u, 'Admin')">
                          → Admin
                        </button>
                        <button class="sbh-btn sbh-btn--flat sbh-btn--sm"
                                [disabled]="u.roles.includes('Student') && !u.roles.includes('Admin')"
                                (click)="changeRole(u, 'Student')">
                          → Student
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .admin-page { max-width: 1100px; margin: 0 auto; padding: 32px 32px 80px; }
    .admin-header {
      margin-bottom: 28px;
      h1 { font-size: 28px; font-weight: 800; letter-spacing: -.025em; color: var(--indigo-900); margin: 0 0 4px; }
      p  { color: var(--text-muted); font-size: 15px; margin: 0; }
    }
    .tabs {
      display: flex; gap: 4px; padding: 4px;
      background: var(--indigo-50); border-radius: 12px;
      margin-bottom: 32px; width: fit-content;
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
      background: var(--indigo-700); color: white; font-size: 11px; font-weight: 700;
    }

    .stats-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px;
    }
    .stat-card {
      background: white; border: 1px solid var(--border); border-radius: var(--radius-lg);
      padding: 24px; box-shadow: var(--shadow-sm);
    }
    .stat-card__icon {
      width: 48px; height: 48px; border-radius: 12px;
      background: var(--indigo-50); color: var(--indigo-700);
      display: grid; place-items: center; margin-bottom: 16px;
      .material-icons-outlined { font-size: 24px; }
    }
    .stat-card__icon--indigo { background: var(--indigo-50); color: var(--indigo-700); }
    .stat-card__icon--coral  { background: var(--coral-50);  color: var(--coral-700); }
    .stat-card__icon--success{ background: #e8f5f0; color: var(--success); }
    .stat-card__icon--warn   { background: #fff8f0; color: var(--warn); }
    .stat-card__num { font-size: 40px; font-weight: 800; letter-spacing: -.025em; color: var(--indigo-900); line-height: 1; }
    .stat-card__label { font-size: 14px; color: var(--text-muted); margin-top: 6px; }

    .users-table-wrap {
      background: white; border: 1px solid var(--border);
      border-radius: var(--radius-lg); overflow: hidden;
      box-shadow: var(--shadow-sm);
    }
    .users-table {
      width: 100%; border-collapse: collapse;
      thead tr {
        background: var(--bg-soft); border-bottom: 1px solid var(--border);
      }
      th {
        padding: 12px 16px; text-align: left;
        font-size: 12px; font-weight: 700; color: var(--text-muted);
        text-transform: uppercase; letter-spacing: .04em;
      }
      tbody tr {
        border-bottom: 1px solid var(--border);
        transition: background .12s;
        &:last-child { border-bottom: 0; }
        &:hover { background: var(--bg-soft); }
      }
      td { padding: 14px 16px; font-size: 14px; color: var(--text); vertical-align: middle; }
    }
    .user-cell__name { font-weight: 600; color: var(--indigo-900); }
    .user-cell__date { font-size: 12px; color: var(--text-soft); margin-top: 2px; }
    .user-email { color: var(--text-muted); font-size: 13.5px; }

    .sbh-spinner {
      width: 40px; height: 40px; border-radius: 999px;
      border: 3px solid var(--indigo-100); border-top-color: var(--indigo-700);
      animation: spin .8s linear infinite;
    }
    .spinner-container { display: flex; justify-content: center; padding: 60px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 700px) {
      .admin-page { padding: 20px 18px 60px; }
      .users-table { font-size: 13px; }
    }
  `]
})
export class AdminComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly snackBar = inject(MatSnackBar);

  readonly activeTab = signal<'stats' | 'users'>('stats');
  stats: AdminStats | null = null;
  users: AdminUser[] = [];
  loadingStats = false;
  loadingUsers = false;

  ngOnInit(): void {
    this.loadStats();
    this.loadUsers();
  }

  changeRole(user: AdminUser, role: string): void {
    this.http.patch(`${environment.apiUrl}/admin/users/${user.id}/role`, { role }).subscribe({
      next: () => {
        user.roles = [role];
        this.snackBar.open(`Rol actualizat: ${role}`, 'OK', { duration: 3000 });
      },
      error: err => this.snackBar.open(err.error?.message ?? 'Eroare', 'OK', { duration: 3000 })
    });
  }

  private loadStats(): void {
    this.loadingStats = true;
    this.http.get<AdminStats>(`${environment.apiUrl}/admin/stats`).subscribe({
      next: data => { this.stats = data; this.loadingStats = false; },
      error: () => { this.loadingStats = false; }
    });
  }

  private loadUsers(): void {
    this.loadingUsers = true;
    this.http.get<AdminUser[]>(`${environment.apiUrl}/admin/users`).subscribe({
      next: data => { this.users = data; this.loadingUsers = false; },
      error: () => { this.loadingUsers = false; }
    });
  }
}
