import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { StudyOffersService } from '../../../core/services/study-offers.service';
import { StudyOfferList } from '../../../core/models/study-offer.models';
import { OfferCardComponent } from '../../../shared/components/offer-card/offer-card.component';

@Component({
  selector: 'app-my-offers',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    OfferCardComponent
  ],
  template: `
    <div class="page-header">
      <h1>Ofertele mele</h1>
      <button mat-raised-button color="primary" routerLink="/offers/create">
        <mat-icon>add</mat-icon> Ofertă nouă
      </button>
    </div>

    @if (loading) {
      <div class="spinner-container">
        <mat-progress-spinner mode="indeterminate" diameter="48"></mat-progress-spinner>
      </div>
    } @else if (offers.length === 0) {
      <div class="empty-state">
        <mat-icon>post_add</mat-icon>
        <p>Nu ai publicat nicio ofertă încă.</p>
        <button mat-raised-button color="primary" routerLink="/offers/create">Publică prima ofertă</button>
      </div>
    } @else {
      <div class="offers-grid">
        @for (offer of offers; track offer.id) {
          <app-offer-card
            [offer]="offer"
            [showActions]="true"
            (edit)="editOffer($event)"
            (delete)="confirmDelete($event)">
          </app-offer-card>
        }
      </div>
    }
  `,
  styles: [`
    .offers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }
  `]
})
export class MyOffersComponent implements OnInit {
  private readonly offersService = inject(StudyOffersService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  offers: StudyOfferList[] = [];
  loading = false;

  ngOnInit(): void {
    this.load();
  }

  editOffer(id: number): void {
    this.router.navigate(['/offers', id, 'edit']);
  }

  confirmDelete(id: number): void {
    if (confirm('Ești sigur că vrei să ștergi această ofertă?')) {
      this.offersService.delete(id).subscribe({
        next: () => {
          this.offers = this.offers.filter(o => o.id !== id);
          this.snackBar.open('Ofertă ștearsă', 'OK', { duration: 3000 });
        },
        error: err => this.snackBar.open(err.error?.message ?? 'Eroare la ștergere', 'OK', { duration: 4000 })
      });
    }
  }

  private load(): void {
    this.loading = true;
    this.offersService.getMine().subscribe({
      next: data => { this.offers = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
