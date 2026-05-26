import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  template: `
    <mat-toolbar color="primary">
      <a routerLink="/" class="brand">
        <mat-icon>school</mat-icon>
        StudyBuddyHub
      </a>
      <span class="spacer"></span>

      @if (auth.isLoggedIn()) {
        <button mat-button routerLink="/">Oferte</button>
        <button mat-button routerLink="/dashboard/my-offers">Ofertele mele</button>
        <button mat-button routerLink="/dashboard/my-requests">Cereri</button>
        @if (auth.isAdmin()) {
          <button mat-button routerLink="/admin">Admin</button>
        }
        <button mat-icon-button [matMenuTriggerFor]="userMenu">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item routerLink="/profile">
            <mat-icon>person</mat-icon> Profil
          </button>
          <button mat-menu-item (click)="auth.logout()">
            <mat-icon>logout</mat-icon> Deconectare
          </button>
        </mat-menu>
      } @else {
        <button mat-button routerLink="/login">Autentificare</button>
        <button mat-raised-button color="accent" routerLink="/register">Înregistrare</button>
      }
    </mat-toolbar>
  `,
  styles: [`
    mat-toolbar { position: sticky; top: 0; z-index: 100; }
    .brand { color: white; text-decoration: none; display: flex; align-items: center; gap: 8px; font-size: 20px; font-weight: 500; }
    .spacer { flex: 1; }
  `]
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
}
