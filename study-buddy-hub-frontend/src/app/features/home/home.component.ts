import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StudyOffersService } from '../../core/services/study-offers.service';
import { SubjectsService } from '../../core/services/subjects.service';
import { AuthService } from '../../core/services/auth.service';
import { StudyOfferList } from '../../core/models/study-offer.models';
import { Subject } from '../../core/models/subject.models';
import { OfferCardComponent } from '../../shared/components/offer-card/offer-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    OfferCardComponent
  ],
  template: `
    <div class="page-header">
      <h1>Oferte de meditații</h1>
      @if (auth.isLoggedIn()) {
        <button mat-raised-button color="primary" routerLink="/offers/create">
          <mat-icon>add</mat-icon> Publică ofertă
        </button>
      }
    </div>

    <!-- Filters -->
    <form [formGroup]="filtersForm" (ngSubmit)="applyFilters()" class="filters-row">
      <mat-form-field appearance="outline">
        <mat-label>Caută</mat-label>
        <input matInput formControlName="search" placeholder="Titlu sau descriere...">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Materie</mat-label>
        <mat-select formControlName="subjectId">
          <mat-option [value]="null">Toate</mat-option>
          @for (s of subjects; track s.id) {
            <mat-option [value]="s.id">{{ s.name }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="price-field">
        <mat-label>Preț min (RON)</mat-label>
        <input matInput type="number" formControlName="minPrice" min="0">
      </mat-form-field>

      <mat-form-field appearance="outline" class="price-field">
        <mat-label>Preț max (RON)</mat-label>
        <input matInput type="number" formControlName="maxPrice" min="0">
      </mat-form-field>

      <button mat-raised-button color="primary" type="submit">Filtrează</button>
      <button mat-button type="button" (click)="resetFilters()">Resetează</button>
    </form>

    <!-- Results -->
    @if (loading) {
      <div class="spinner-container">
        <mat-progress-spinner mode="indeterminate" diameter="48"></mat-progress-spinner>
      </div>
    } @else if (offers.length === 0) {
      <div class="empty-state">
        <mat-icon>search_off</mat-icon>
        <p>Nu s-au găsit oferte cu criteriile selectate.</p>
      </div>
    } @else {
      <p class="results-count">{{ offers.length }} ofertă/oferte găsite</p>
      <div class="offers-grid">
        @for (offer of offers; track offer.id) {
          <app-offer-card [offer]="offer"></app-offer-card>
        }
      </div>
    }
  `,
  styles: [`
    .filters-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      margin-bottom: 24px;
      mat-form-field { min-width: 180px; }
      .price-field { min-width: 130px; }
    }
    .offers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }
    .results-count { color: rgba(0,0,0,.54); margin-bottom: 12px; }
  `]
})
export class HomeComponent implements OnInit {
  private readonly offersService = inject(StudyOffersService);
  private readonly subjectsService = inject(SubjectsService);
  readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  offers: StudyOfferList[] = [];
  subjects: Subject[] = [];
  loading = false;

  filtersForm = this.fb.group({
    search: [''],
    subjectId: [null as number | null],
    minPrice: [null as number | null],
    maxPrice: [null as number | null]
  });

  ngOnInit(): void {
    this.subjectsService.getAll().subscribe(s => this.subjects = s);
    this.loadOffers();
  }

  applyFilters(): void {
    this.loadOffers();
  }

  resetFilters(): void {
    this.filtersForm.reset();
    this.loadOffers();
  }

  private loadOffers(): void {
    this.loading = true;
    const { search, subjectId, minPrice, maxPrice } = this.filtersForm.value;
    this.offersService.getAll({
      search: search ?? undefined,
      subjectId: subjectId ?? undefined,
      minPrice: minPrice ?? undefined,
      maxPrice: maxPrice ?? undefined,
      isActive: true
    }).subscribe({
      next: data => { this.offers = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
