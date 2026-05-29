import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AppNotification } from '../../../core/models/notification.models';
import { filter, Subscription } from 'rxjs';
import { initials, avatarStyle } from '../../utils/avatar.utils';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="nav">
      <div class="nav__inner">
        <!-- Logo -->
        <a class="nav__logo" routerLink="/">
          <span class="nav__logo-mark">
            <span class="material-icons-outlined">auto_stories</span>
          </span>
          StudyBuddy Hub
        </a>

        <!-- Desktop links -->
        <nav class="nav__links">
          <a class="nav__link" [class.nav__link--active]="isActive('/')" routerLink="/">
            Explorează
          </a>
          @if (auth.isLoggedIn()) {
            <a class="nav__link" [class.nav__link--active]="isActive('/dashboard/my-offers')" routerLink="/dashboard/my-offers">
              Ofertele mele
            </a>
            <a class="nav__link" [class.nav__link--active]="isActive('/dashboard/my-requests')" routerLink="/dashboard/my-requests">
              Cereri
            </a>
            @if (auth.isAdmin()) {
              <a class="nav__link" [class.nav__link--active]="isActive('/admin')" routerLink="/admin">
                Admin
              </a>
            }
          }
        </nav>

        <div class="nav__spacer"></div>

        <!-- Actions -->
        <div class="nav__actions">
          @if (!auth.isLoggedIn()) {
            <button class="sbh-btn sbh-btn--flat" routerLink="/login">Autentificare</button>
            <button class="sbh-btn sbh-btn--raised sbh-btn--sm" routerLink="/register">
              Înregistrează-te
            </button>
          } @else {
            <button class="sbh-icon-btn" title="Publică ofertă" routerLink="/offers/create">
              <span class="material-icons-outlined">add_circle_outline</span>
            </button>

            <!-- Notification Bell -->
            <div class="nav__bell-wrapper">
              <button class="sbh-icon-btn nav__bell-btn" (click)="toggleNotifications()" title="Notificări">
                <span class="material-icons-outlined">notifications</span>
                @if ((unreadCount$ | async) ?? 0; as count) {
                @if (count > 0) {
                  <span class="nav__bell-badge">{{ count > 9 ? '9+' : count }}</span>
                }
              }
              </button>

              @if (notifOpen()) {
                <div class="nav__notif-panel">
                  <div class="nav__notif-header">
                    <span class="nav__notif-title">Notificări</span>
                    <button class="nav__notif-mark-read" (click)="markAllRead()">
                      Marchează toate ca citite
                    </button>
                  </div>
                  <div class="nav__notif-list">
                    @for (n of (notifications$ | async)?.slice(0, 5); track n.id) {
                      <div class="nav__notif-item" [class.nav__notif-item--unread]="!n.read">
                        <span class="nav__notif-icon material-icons-outlined"
                              [class.nav__notif-icon--indigo]="n.type === 'request_received'"
                              [class.nav__notif-icon--green]="n.type === 'request_accepted'"
                              [class.nav__notif-icon--red]="n.type === 'request_rejected' || n.type === 'request_cancelled'">
                          {{ notifIcon(n.type) }}
                        </span>
                        <div class="nav__notif-body">
                          <div class="nav__notif-msg">{{ n.message }}</div>
                          <div class="nav__notif-time">{{ n.createdAt | date:'HH:mm' }}</div>
                        </div>
                      </div>
                    } @empty {
                      <div class="nav__notif-empty">Nicio notificare</div>
                    }
                  </div>
                </div>
              }
            </div>

            <div class="nav__avatar-menu" (click)="toggleMenu()" [class.nav__avatar-menu--open]="menuOpen()">
              <span class="material-icons-outlined">menu</span>
              <span class="sbh-avatar sbh-avatar--sm" [style.background]="currentAvatarStyle()">
                {{ currentInitials() }}
              </span>
            </div>

            @if (menuOpen()) {
              <div class="nav__dropdown">
                <div class="nav__dropdown-header">
                  <span class="sbh-avatar sbh-avatar--md" [style.background]="currentAvatarStyle()">
                    {{ currentInitials() }}
                  </span>
                  <div>
                    <div class="nav__dropdown-name">{{ currentUserName() }}</div>
                    <div class="nav__dropdown-email">{{ auth.getCurrentUser()?.email }}</div>
                  </div>
                </div>
                <div class="nav__dropdown-divider"></div>
                <a class="nav__dropdown-item" routerLink="/profile" (click)="closeMenu()">
                  <span class="material-icons-outlined">person</span> Profilul meu
                </a>
                <a class="nav__dropdown-item" routerLink="/dashboard/my-offers" (click)="closeMenu()">
                  <span class="material-icons-outlined">list_alt</span> Ofertele mele
                </a>
                <a class="nav__dropdown-item" routerLink="/dashboard/my-requests" (click)="closeMenu()">
                  <span class="material-icons-outlined">send</span> Cererile mele
                </a>
                <div class="nav__dropdown-divider"></div>
                <button class="nav__dropdown-item nav__dropdown-item--danger" (click)="logout()">
                  <span class="material-icons-outlined">logout</span> Deconectare
                </button>
              </div>
            }
          }
        </div>
      </div>
    </header>

    <!-- Backdrop for menu/notif close -->
    @if (menuOpen() || notifOpen()) {
      <div class="nav__backdrop" (click)="closeAll()"></div>
    }

    <!-- Toast -->
    @if (toast()) {
      <div class="sbh-toast" [class]="'sbh-toast--' + toast()!.color">
        <span class="material-icons-outlined sbh-toast__icon">{{ toast()!.icon }}</span>
        <span class="sbh-toast__msg">{{ toast()!.message }}</span>
      </div>
    }
  `,
  styles: [`
    .nav {
      position: sticky; top: 0; z-index: 200;
      background: rgba(255,255,255,.92);
      backdrop-filter: saturate(180%) blur(14px);
      border-bottom: 1px solid var(--border);
      min-width: 0;
    }
    .nav__inner {
      max-width: 1280px; margin: 0 auto;
      display: flex; align-items: center; gap: 32px;
      padding: 14px 32px;
      position: relative;
      min-width: 0;
    }
    .nav__logo {
      display: flex; align-items: center; gap: 10px;
      font-weight: 800; letter-spacing: -.02em; font-size: 19px;
      color: var(--indigo-700); cursor: pointer;
      text-decoration: none;
    }
    .nav__logo-mark {
      width: 32px; height: 32px; border-radius: 9px;
      background: linear-gradient(135deg, var(--indigo-700) 0%, var(--coral-600) 130%);
      display: grid; place-items: center; color: white;
      box-shadow: 0 6px 12px rgba(26,31,94,.25);
      flex-shrink: 0;
      .material-icons-outlined { font-size: 19px; }
    }
    .nav__links {
      display: flex; align-items: center; gap: 4px; margin-left: 8px;
    }
    .nav__link {
      padding: 10px 14px; border-radius: 10px;
      font-size: 14.5px; font-weight: 600; color: var(--text-muted);
      transition: background .15s, color .15s;
      cursor: pointer; text-decoration: none;
      &:hover { background: var(--indigo-50); color: var(--indigo-700); }
    }
    .nav__link--active { color: var(--indigo-700); background: var(--indigo-50); }
    .nav__spacer { flex: 1; }
    .nav__actions {
      display: flex; align-items: center; gap: 8px;
      position: relative;
    }

    /* Bell */
    .nav__bell-wrapper { position: relative; }
    .nav__bell-btn { position: relative; }
    .nav__bell-badge {
      position: absolute; top: 2px; right: 2px;
      min-width: 17px; height: 17px;
      background: #e53935; color: white;
      border-radius: 999px; font-size: 10px; font-weight: 700;
      display: grid; place-items: center; padding: 0 3px;
      border: 2px solid white;
      pointer-events: none;
    }

    /* Notification panel */
    .nav__notif-panel {
      position: fixed; top: 64px; right: 8px;
      background: white; border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      width: calc(100vw - 16px); max-width: 360px;
      z-index: 202;
      overflow: hidden;
    }
    .nav__notif-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px 10px;
      border-bottom: 1px solid var(--border);
    }
    .nav__notif-title { font-weight: 700; font-size: 14px; color: var(--text); }
    .nav__notif-mark-read {
      font-size: 12px; font-weight: 600; color: var(--indigo-700);
      background: none; border: none; cursor: pointer; font-family: inherit;
      &:hover { text-decoration: underline; }
    }
    .nav__notif-list { max-height: 320px; overflow-y: auto; }
    .nav__notif-item {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 10px 16px;
      border-bottom: 1px solid var(--border);
      transition: background .12s;
      &:last-child { border-bottom: 0; }
      &:hover { background: var(--indigo-50); }
    }
    .nav__notif-item--unread { background: #f0f4ff; }
    .nav__notif-icon {
      font-size: 20px; flex-shrink: 0; margin-top: 1px;
      &--indigo { color: var(--indigo-700); }
      &--green { color: #2e7d32; }
      &--red { color: #c62828; }
    }
    .nav__notif-body { flex: 1; min-width: 0; }
    .nav__notif-msg { font-size: 13px; font-weight: 500; color: var(--text); line-height: 1.4; }
    .nav__notif-time { font-size: 11px; color: var(--text-muted); margin-top: 3px; }
    .nav__notif-empty { padding: 24px 16px; text-align: center; font-size: 13px; color: var(--text-muted); }

    .nav__avatar-menu {
      display: flex; align-items: center; gap: 10px;
      padding: 6px 6px 6px 16px;
      border-radius: 999px;
      border: 1.5px solid var(--border);
      background: white;
      transition: box-shadow .15s, border-color .15s;
      cursor: pointer;
      .material-icons-outlined { font-size: 20px; color: var(--text-muted); }
      &:hover, &--open { box-shadow: var(--shadow-md); border-color: var(--border-strong); }
    }
    .nav__dropdown {
      position: fixed; top: 64px; right: 8px;
      background: white; border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      padding: 8px;
      width: calc(100vw - 16px); max-width: 280px;
      z-index: 201;
    }
    .nav__dropdown-header {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 8px;
    }
    .nav__dropdown-name { font-weight: 700; font-size: 14.5px; color: var(--text); }
    .nav__dropdown-email { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
    .nav__dropdown-divider { height: 1px; background: var(--border); margin: 6px 0; }
    .nav__dropdown-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; border-radius: 8px;
      font-size: 14px; font-weight: 600; color: var(--text);
      cursor: pointer; text-decoration: none;
      background: transparent; border: 0; width: 100%; text-align: left;
      font-family: inherit;
      transition: background .12s, color .12s;
      .material-icons-outlined { font-size: 18px; color: var(--text-muted); }
      &:hover { background: var(--indigo-50); color: var(--indigo-700);
        .material-icons-outlined { color: var(--indigo-700); }
      }
    }
    .nav__dropdown-item--danger {
      color: #c62828;
      .material-icons-outlined { color: #c62828; }
      &:hover { background: #fef2f2; color: #c62828;
        .material-icons-outlined { color: #c62828; }
      }
    }
    .nav__backdrop {
      position: fixed; inset: 0; z-index: 199;
    }

    /* Toast */
    .sbh-toast {
      position: fixed; bottom: 24px; right: 24px;
      z-index: 9999;
      display: flex; align-items: center; gap: 12px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,.14);
      padding: 14px 20px;
      min-width: 280px; max-width: 380px;
      border-left: 4px solid transparent;
      animation: toast-in .25s ease;
    }
    .sbh-toast--indigo { border-left-color: var(--indigo-700); .sbh-toast__icon { color: var(--indigo-700); } }
    .sbh-toast--green  { border-left-color: #2e7d32;           .sbh-toast__icon { color: #2e7d32; } }
    .sbh-toast--red    { border-left-color: #c62828;           .sbh-toast__icon { color: #c62828; } }
    .sbh-toast__icon { font-size: 22px; flex-shrink: 0; }
    .sbh-toast__msg { font-size: 13.5px; font-weight: 500; color: var(--text); line-height: 1.4; }
    @keyframes toast-in {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 980px) {
      .nav__inner { padding: 12px 18px; gap: 14px; }
      .nav__links { display: none; }
    }
    @media (max-width: 500px) {
      .nav__inner { padding: 10px 12px; gap: 8px; }
      .nav__logo { font-size: 16px; gap: 8px; }
      .nav__actions { gap: 4px; }
      .sbh-btn--flat { padding: 0 8px; font-size: 13px; height: 36px; }
      .sbh-btn--raised.sbh-btn--sm { padding: 0 12px; font-size: 13px; height: 34px; }
      .nav__avatar-menu { padding: 5px 5px 5px 10px; gap: 6px; }
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  readonly auth = inject(AuthService);
  private readonly notifService = inject(NotificationService);
  private readonly router = inject(Router);

  readonly menuOpen = signal(false);
  readonly notifOpen = signal(false);
  readonly toast = signal<{ message: string; icon: string; color: string } | null>(null);

  readonly notifications$ = this.notifService.notifications$;
  readonly unreadCount$ = this.notifService.unreadCount$;

  private subs = new Subscription();
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    // Connect/disconnect based on auth state
    this.subs.add(
      this.auth.currentUser$.subscribe(user => {
        if (user) {
          this.notifService.connect();
        } else {
          this.notifService.disconnect();
        }
      })
    );

    // Show toast on new notification
    this.subs.add(
      this.notifService.notifications$.subscribe(notifications => {
        const latest = notifications[0];
        if (!latest || latest.read) return;
        this.showToast(latest);
      })
    );

    // Close panels on navigation
    this.subs.add(
      this.router.events.pipe(filter(e => e instanceof NavigationEnd))
        .subscribe(() => { this.menuOpen.set(false); this.notifOpen.set(false); })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  private showToast(n: AppNotification): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    const config = this.toastConfig(n.type);
    this.toast.set({ message: n.message, ...config });
    this.toastTimer = setTimeout(() => this.toast.set(null), 4000);
  }

  private toastConfig(type: AppNotification['type']): { icon: string; color: string } {
    switch (type) {
      case 'request_accepted':   return { icon: 'check_circle', color: 'green' };
      case 'request_rejected':   return { icon: 'cancel',       color: 'red' };
      case 'request_cancelled':  return { icon: 'cancel',       color: 'red' };
      default:                   return { icon: 'notifications', color: 'indigo' };
    }
  }

  notifIcon(type: AppNotification['type']): string {
    switch (type) {
      case 'request_accepted':  return 'check_circle';
      case 'request_rejected':  return 'cancel';
      case 'request_cancelled': return 'cancel';
      default:                  return 'notifications';
    }
  }

  toggleMenu(): void { this.menuOpen.update(v => !v); this.notifOpen.set(false); }
  closeMenu(): void  { this.menuOpen.set(false); }

  toggleNotifications(): void { this.notifOpen.update(v => !v); this.menuOpen.set(false); }
  closeAll(): void { this.menuOpen.set(false); this.notifOpen.set(false); }

  markAllRead(): void { this.notifService.markAllRead(); }

  logout(): void {
    this.closeMenu();
    this.auth.logout();
  }

  isActive(path: string): boolean {
    if (path === '/') return this.router.url === '/';
    return this.router.url.startsWith(path);
  }

  currentInitials(): string {
    const u = this.auth.getCurrentUser();
    if (!u) return '?';
    return initials(`${u.firstName} ${u.lastName}`);
  }

  currentUserName(): string {
    const u = this.auth.getCurrentUser();
    if (!u) return '';
    return `${u.firstName} ${u.lastName}`;
  }

  currentAvatarStyle(): string {
    const u = this.auth.getCurrentUser();
    if (!u) return 'linear-gradient(135deg, #1a1f5e 0%, #ff6b35 100%)';
    return avatarStyle(`${u.firstName} ${u.lastName}`);
  }
}
