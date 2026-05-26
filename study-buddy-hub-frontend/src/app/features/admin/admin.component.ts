import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
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
  imports: [
    CommonModule,
    DatePipe,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTabsModule
  ],
  template: `
    <h1>Panou de administrare</h1>

    <mat-tab-group>
      <!-- Stats -->
      <mat-tab label="Statistici">
        @if (loadingStats) {
          <div class="spinner-container"><mat-progress-spinner mode="indeterminate" diameter="40"></mat-progress-spinner></div>
        } @else if (stats) {
          <div class="stats-grid">
            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-number">{{ stats.totalUsers }}</div>
                <div class="stat-label">Utilizatori înregistrați</div>
              </mat-card-content>
            </mat-card>
            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-number">{{ stats.totalOffers }}</div>
                <div class="stat-label">Total oferte</div>
              </mat-card-content>
            </mat-card>
            <mat-card class="stat-card accent">
              <mat-card-content>
                <div class="stat-number">{{ stats.activeOffers }}</div>
                <div class="stat-label">Oferte active</div>
              </mat-card-content>
            </mat-card>
            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-number">{{ stats.totalRequests }}</div>
                <div class="stat-label">Total cereri</div>
              </mat-card-content>
            </mat-card>
            <mat-card class="stat-card warn">
              <mat-card-content>
                <div class="stat-number">{{ stats.pendingRequests }}</div>
                <div class="stat-label">Cereri în așteptare</div>
              </mat-card-content>
            </mat-card>
          </div>
        }
      </mat-tab>

      <!-- Users -->
      <mat-tab label="Utilizatori">
        @if (loadingUsers) {
          <div class="spinner-container"><mat-progress-spinner mode="indeterminate" diameter="40"></mat-progress-spinner></div>
        } @else {
          <table mat-table [dataSource]="users" class="users-table">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nume</th>
              <td mat-cell *matCellDef="let u">{{ u.firstName }} {{ u.lastName }}</td>
            </ng-container>
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let u">{{ u.email }}</td>
            </ng-container>
            <ng-container matColumnDef="roles">
              <th mat-header-cell *matHeaderCellDef>Rol</th>
              <td mat-cell *matCellDef="let u">{{ u.roles.join(', ') }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Acțiuni</th>
              <td mat-cell *matCellDef="let u">
                <button mat-button color="primary" (click)="changeRole(u, 'Admin')" [disabled]="u.roles.includes('Admin')">
                  → Admin
                </button>
                <button mat-button (click)="changeRole(u, 'Student')" [disabled]="u.roles.includes('Student') && !u.roles.includes('Admin')">
                  → Student
                </button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="userColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: userColumns;"></tr>
          </table>
        }
      </mat-tab>
    </mat-tab-group>
  `,
  styles: [`
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; padding: 16px 0; }
    .stat-card { text-align: center; }
    .stat-number { font-size: 48px; font-weight: 700; color: #3f51b5; }
    .stat-card.accent .stat-number { color: #ff4081; }
    .stat-card.warn .stat-number { color: #ff9800; }
    .stat-label { font-size: 14px; color: rgba(0,0,0,.54); margin-top: 4px; }
    .users-table { width: 100%; margin-top: 16px; }
  `]
})
export class AdminComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly snackBar = inject(MatSnackBar);

  stats: AdminStats | null = null;
  users: AdminUser[] = [];
  loadingStats = false;
  loadingUsers = false;

  userColumns = ['name', 'email', 'roles', 'actions'];

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
