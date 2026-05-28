import { Component, inject, signal } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { filter } from 'rxjs/operators';
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

    <!-- Backdrop for menu close -->
    @if (menuOpen()) {
      <div class="nav__backdrop" (click)="closeMenu()"></div>
    }
  `,
  styles: [`
    .nav {
      position: sticky; top: 0; z-index: 200;
      background: rgba(255,255,255,.92);
      backdrop-filter: saturate(180%) blur(14px);
      border-bottom: 1px solid var(--border);
    }
    .nav__inner {
      max-width: 1280px; margin: 0 auto;
      display: flex; align-items: center; gap: 32px;
      padding: 14px 32px;
      position: relative;
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
      position: absolute; top: calc(100% + 10px); right: 0;
      background: white; border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      padding: 8px;
      min-width: 240px;
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
    @media (max-width: 980px) {
      .nav__inner { padding: 12px 18px; gap: 14px; }
      .nav__links { display: none; }
    }
  `]
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly menuOpen = signal(false);

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => this.menuOpen.set(false));
  }

  toggleMenu(): void { this.menuOpen.update(v => !v); }
  closeMenu(): void  { this.menuOpen.set(false); }

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
