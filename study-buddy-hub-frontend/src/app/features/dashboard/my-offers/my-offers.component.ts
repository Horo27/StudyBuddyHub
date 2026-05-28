import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StudyOffersService } from '../../../core/services/study-offers.service';
import { StudyOfferList } from '../../../core/models/study-offer.models';
import { OfferCardComponent } from '../../../shared/components/offer-card/offer-card.component';

@Component({
  selector: 'app-my-offers',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSnackBarModule, OfferCardComponent],
  template: `
    <div class="dashboard-page">
      <div class="dashboard-header">
        <div>
          <h1>Ofertele mele</h1>
          <p>Gestionează ofertele tale de meditații.</p>
        </div>
        <a routerLink="/offers/create" class="sbh-btn sbh-btn--raised">
          <span class="material-icons-outlined">add</span> Ofertă nouă
        </a>
      </div>

      @if (loading) {
        <div class="spinner-container"><div class="sbh-spinner"></div></div>
      } @else if (offers.length === 0) {
        <div class="empty-state">
          <span class="material-icons-outlined">post_add</span>
          <h3>Nu ai publicat nicio ofertă</h3>
          <p>Publică prima ta ofertă și conectează-te cu elevi care au nevoie de ajutorul tău.</p>
          <a routerLink="/offers/create" class="sbh-btn sbh-btn--raised" style="margin-top:16px">
            Publică prima ofertă
          </a>
        </div>
      } @else {
        <div class="sbh-offers-grid">
          @for (offer of offers; track offer.id) {
            <app-offer-card
              [offer]="offer"
              [showActions]="true"
              (edit)="editOffer($event)"
              (delete)="confirmDelete($event)"
            ></app-offer-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-page { max-width: 1200px; margin: 0 auto; padding: 32px 32px 80px; }
    .dashboard-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      gap: 16px; margin-bottom: 32px;
      h1 { font-size: 28px; font-weight: 800; letter-spacing: -.025em; color: var(--indigo-900); margin: 0 0 4px; }
      p  { color: var(--text-muted); font-size: 15px; margin: 0; }
    }
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
export class MyOffersComponent implements OnInit {
  private readonly offersService = inject(StudyOffersService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  offers: StudyOfferList[] = [];
  loading = false;

  ngOnInit(): void { this.load(); }

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
