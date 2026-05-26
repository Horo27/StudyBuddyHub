import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule
  ],
  template: `
    @if (user) {
      <div class="profile-container">
        <div class="page-header">
          <h1>Profilul meu</h1>
          <button mat-raised-button color="warn" (click)="auth.logout()">
            <mat-icon>logout</mat-icon> Deconectare
          </button>
        </div>

        <mat-card>
          <mat-card-header>
            <div mat-card-avatar class="avatar">
              <mat-icon style="font-size:40px;height:40px;width:40px">account_circle</mat-icon>
            </div>
            <mat-card-title>{{ user.firstName }} {{ user.lastName }}</mat-card-title>
            <mat-card-subtitle>{{ user.email }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <mat-divider></mat-divider>
            <div class="info-grid">
              <div class="info-item">
                <mat-icon>school</mat-icon>
                <div>
                  <div class="label">Facultate</div>
                  <div>{{ user.faculty ?? '—' }}</div>
                </div>
              </div>
              <div class="info-item">
                <mat-icon>account_balance</mat-icon>
                <div>
                  <div class="label">Universitate</div>
                  <div>{{ user.university ?? '—' }}</div>
                </div>
              </div>
              @if (user.bio) {
                <div class="info-item full">
                  <mat-icon>info</mat-icon>
                  <div>
                    <div class="label">Bio</div>
                    <div>{{ user.bio }}</div>
                  </div>
                </div>
              }
              <div class="info-item">
                <mat-icon>calendar_today</mat-icon>
                <div>
                  <div class="label">Membru din</div>
                  <div>{{ user.createdAt | date:'d MMMM yyyy' }}</div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <div class="quick-links">
          <button mat-raised-button routerLink="/dashboard/my-offers">
            <mat-icon>list_alt</mat-icon> Ofertele mele
          </button>
          <button mat-raised-button routerLink="/dashboard/my-requests">
            <mat-icon>send</mat-icon> Cererile mele
          </button>
          <button mat-raised-button routerLink="/offers/create" color="primary">
            <mat-icon>add</mat-icon> Ofertă nouă
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .profile-container { max-width: 640px; margin: 0 auto; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
    .info-item { display: flex; gap: 12px; align-items: flex-start; }
    .info-item.full { grid-column: 1 / -1; }
    .label { font-size: 12px; color: rgba(0,0,0,.54); text-transform: uppercase; letter-spacing: 0.05em; }
    .avatar { display: flex; align-items: center; justify-content: center; }
    .quick-links { display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap; }
    mat-divider { margin-bottom: 8px; }
  `]
})
export class ProfileComponent {
  readonly auth = inject(AuthService);
  get user() { return this.auth.getCurrentUser(); }
}
