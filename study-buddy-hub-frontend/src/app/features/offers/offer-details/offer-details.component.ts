import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { StudyOffersService } from '../../../core/services/study-offers.service';
import { StudyRequestsService } from '../../../core/services/study-requests.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { AuthService } from '../../../core/services/auth.service';
import { StudyOfferDetails } from '../../../core/models/study-offer.models';
import { LevelLabelPipe, SessionTypeLabelPipe } from '../../../shared/pipes/level-label.pipe';

@Component({
  selector: 'app-offer-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CurrencyPipe,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatDividerModule,
    LevelLabelPipe,
    SessionTypeLabelPipe
  ],
  template: `
    @if (loading) {
      <div class="spinner-container">
        <mat-progress-spinner mode="indeterminate" diameter="48"></mat-progress-spinner>
      </div>
    } @else if (offer) {
      <div class="details-layout">
        <div class="details-main">
          <div class="back-link">
            <button mat-button routerLink="/">
              <mat-icon>arrow_back</mat-icon> Înapoi la oferte
            </button>
          </div>

          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ offer.title }}</mat-card-title>
              <mat-card-subtitle>{{ offer.subjectName }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="chips-row">
                <mat-chip-set>
                  <mat-chip color="primary">{{ offer.level | levelLabel }}</mat-chip>
                  <mat-chip>{{ offer.sessionType | sessionTypeLabel }}</mat-chip>
                  @if (offer.location) {
                    <mat-chip>
                      <mat-icon matChipAvatar>location_on</mat-icon>
                      {{ offer.location }}
                    </mat-chip>
                  }
                  @if (!offer.isActive) {
                    <mat-chip color="warn">Inactivă</mat-chip>
                  }
                </mat-chip-set>
              </div>

              <div class="price-tag">{{ offer.price | currency:'RON':'symbol':'1.0-0' }} / sesiune</div>

              <mat-divider></mat-divider>

              <h3>Descriere</h3>
              <p class="description">{{ offer.description }}</p>

              <mat-divider></mat-divider>

              <div class="owner-info">
                <mat-icon>person</mat-icon>
                <div>
                  <strong>{{ offer.ownerName }}</strong>
                  @if (offer.ownerEmail) { <div>{{ offer.ownerEmail }}</div> }
                </div>
              </div>

              <div class="meta">
                Publicat la {{ offer.createdAt | date:'d MMM yyyy' }}
                @if (offer.updatedAt) { · Actualizat {{ offer.updatedAt | date:'d MMM yyyy' }} }
              </div>
            </mat-card-content>
            <mat-card-actions>
              @if (auth.isLoggedIn() && !isOwner) {
                <button mat-raised-button color="primary" (click)="showRequestForm = !showRequestForm">
                  <mat-icon>send</mat-icon> Trimite cerere
                </button>
                <button mat-icon-button (click)="toggleFavorite()" [title]="isFavorite ? 'Elimină din favorite' : 'Adaugă la favorite'">
                  <mat-icon [color]="isFavorite ? 'warn' : ''">{{ isFavorite ? 'favorite' : 'favorite_border' }}</mat-icon>
                </button>
              }
              @if (isOwner || auth.isAdmin()) {
                <button mat-button color="accent" [routerLink]="['/offers', offer.id, 'edit']">
                  <mat-icon>edit</mat-icon> Editează
                </button>
              }
            </mat-card-actions>
          </mat-card>

          @if (showRequestForm) {
            <mat-card class="request-form-card">
              <mat-card-header>
                <mat-card-title>Trimite cerere</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="requestForm" (ngSubmit)="sendRequest()">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Mesaj (opțional)</mat-label>
                    <textarea matInput formControlName="message" rows="3"
                              placeholder="Descrie pe scurt ce ai nevoie..."></textarea>
                  </mat-form-field>
                  <div class="form-actions">
                    <button mat-raised-button color="primary" type="submit" [disabled]="sendingRequest">
                      Trimite
                    </button>
                    <button mat-button type="button" (click)="showRequestForm = false">Anulează</button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          }
        </div>
      </div>
    } @else {
      <div class="empty-state">
        <mat-icon>error_outline</mat-icon>
        <p>Oferta nu a fost găsită.</p>
        <button mat-raised-button routerLink="/">Înapoi la oferte</button>
      </div>
    }
  `,
  styles: [`
    .details-layout { max-width: 720px; margin: 0 auto; }
    .back-link { margin-bottom: 16px; }
    .chips-row { margin-bottom: 16px; }
    .price-tag { font-size: 24px; font-weight: 500; color: #3f51b5; margin: 16px 0; }
    .description { white-space: pre-wrap; line-height: 1.6; }
    .owner-info { display: flex; align-items: center; gap: 12px; margin: 16px 0; }
    .meta { font-size: 12px; color: rgba(0,0,0,.54); margin-top: 8px; }
    .request-form-card { margin-top: 16px; }
    .form-actions { display: flex; gap: 8px; }
    mat-divider { margin: 16px 0; }
  `]
})
export class OfferDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly offersService = inject(StudyOffersService);
  private readonly requestsService = inject(StudyRequestsService);
  private readonly favoritesService = inject(FavoritesService);
  readonly auth = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  offer: StudyOfferDetails | null = null;
  loading = true;
  showRequestForm = false;
  sendingRequest = false;
  isFavorite = false;

  get isOwner(): boolean {
    return !!this.offer && this.offer.ownerId === this.auth.getCurrentUserId();
  }

  requestForm = this.fb.group({ message: [''] });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.offersService.getById(id).subscribe({
      next: offer => {
        this.offer = offer;
        this.loading = false;
        if (this.auth.isLoggedIn()) this.checkFavorite();
      },
      error: () => { this.loading = false; }
    });
  }

  sendRequest(): void {
    if (!this.offer) return;
    this.sendingRequest = true;
    this.requestsService.create({ offerId: this.offer.id, message: this.requestForm.value.message || undefined }).subscribe({
      next: () => {
        this.showRequestForm = false;
        this.sendingRequest = false;
        this.snackBar.open('Cerere trimisă cu succes!', 'OK', { duration: 3000 });
      },
      error: err => {
        this.sendingRequest = false;
        this.snackBar.open(err.error?.message ?? 'Eroare la trimiterea cererii', 'OK', { duration: 4000 });
      }
    });
  }

  toggleFavorite(): void {
    if (!this.offer) return;
    const action = this.isFavorite
      ? this.favoritesService.remove(this.offer.id)
      : this.favoritesService.add(this.offer.id);
    action.subscribe({
      next: () => {
        this.isFavorite = !this.isFavorite;
        this.snackBar.open(this.isFavorite ? 'Adăugat la favorite' : 'Eliminat din favorite', 'OK', { duration: 2000 });
      },
      error: err => this.snackBar.open(err.error?.message ?? 'Eroare', 'OK', { duration: 3000 })
    });
  }

  private checkFavorite(): void {
    this.favoritesService.getAll().subscribe(favs => {
      this.isFavorite = favs.some(f => f.offerId === this.offer?.id);
    });
  }
}
