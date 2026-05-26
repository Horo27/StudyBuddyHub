import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { StudyRequestsService } from '../../../core/services/study-requests.service';
import { StudyRequest } from '../../../core/models/study-request.models';

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    RouterModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <h1>Cererile mele</h1>

    <mat-tab-group>
      <!-- Sent requests -->
      <mat-tab label="Trimise ({{ sentRequests.length }})">
        @if (loadingSent) {
          <div class="spinner-container"><mat-progress-spinner mode="indeterminate" diameter="40"></mat-progress-spinner></div>
        } @else if (sentRequests.length === 0) {
          <div class="empty-state"><mat-icon>send</mat-icon><p>Nu ai trimis nicio cerere.</p></div>
        } @else {
          <div class="requests-list">
            @for (req of sentRequests; track req.id) {
              <mat-card class="request-card">
                <mat-card-header>
                  <mat-card-title>
                    <a [routerLink]="['/offers', req.offerId]">{{ req.offerTitle }}</a>
                  </mat-card-title>
                  <mat-card-subtitle>{{ req.offerSubject }} · {{ req.createdAt | date:'d MMM yyyy' }}</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  @if (req.message) { <p>{{ req.message }}</p> }
                  <mat-chip-set>
                    <mat-chip [color]="statusColor(req.status)" [highlighted]="true">
                      {{ statusLabel(req.status) }}
                    </mat-chip>
                  </mat-chip-set>
                </mat-card-content>
                @if (req.status === 'Pending') {
                  <mat-card-actions>
                    <button mat-button color="warn" (click)="cancel(req.id)">
                      <mat-icon>cancel</mat-icon> Anulează
                    </button>
                  </mat-card-actions>
                }
              </mat-card>
            }
          </div>
        }
      </mat-tab>

      <!-- Received requests -->
      <mat-tab label="Primite ({{ receivedRequests.length }})">
        @if (loadingReceived) {
          <div class="spinner-container"><mat-progress-spinner mode="indeterminate" diameter="40"></mat-progress-spinner></div>
        } @else if (receivedRequests.length === 0) {
          <div class="empty-state"><mat-icon>inbox</mat-icon><p>Nu ai primit nicio cerere.</p></div>
        } @else {
          <div class="requests-list">
            @for (req of receivedRequests; track req.id) {
              <mat-card class="request-card">
                <mat-card-header>
                  <mat-card-title>{{ req.requesterName }}</mat-card-title>
                  <mat-card-subtitle>
                    pentru <a [routerLink]="['/offers', req.offerId]">{{ req.offerTitle }}</a>
                    · {{ req.createdAt | date:'d MMM yyyy' }}
                  </mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  @if (req.message) { <p class="message">{{ req.message }}</p> }
                  <mat-chip-set>
                    <mat-chip [color]="statusColor(req.status)" [highlighted]="true">
                      {{ statusLabel(req.status) }}
                    </mat-chip>
                  </mat-chip-set>
                </mat-card-content>
                @if (req.status === 'Pending') {
                  <mat-card-actions>
                    <button mat-raised-button color="primary" (click)="accept(req.id)">
                      <mat-icon>check</mat-icon> Acceptă
                    </button>
                    <button mat-button color="warn" (click)="reject(req.id)">
                      <mat-icon>close</mat-icon> Respinge
                    </button>
                  </mat-card-actions>
                }
              </mat-card>
            }
          </div>
        }
      </mat-tab>
    </mat-tab-group>
  `,
  styles: [`
    .requests-list { padding: 16px 0; display: flex; flex-direction: column; gap: 12px; }
    .request-card { }
    .message { font-style: italic; color: rgba(0,0,0,.7); }
    mat-tab-group { margin-top: 8px; }
  `]
})
export class MyRequestsComponent implements OnInit {
  private readonly requestsService = inject(StudyRequestsService);
  private readonly snackBar = inject(MatSnackBar);

  sentRequests: StudyRequest[] = [];
  receivedRequests: StudyRequest[] = [];
  loadingSent = false;
  loadingReceived = false;

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

  statusColor(status: string): string {
    const map: Record<string, string> = {
      Accepted: 'primary',
      Rejected: 'warn',
      Pending: 'accent',
      Cancelled: ''
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
