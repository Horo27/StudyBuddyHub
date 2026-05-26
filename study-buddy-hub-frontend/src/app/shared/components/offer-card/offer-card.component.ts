import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { StudyOfferList } from '../../../core/models/study-offer.models';
import { LevelLabelPipe, SessionTypeLabelPipe } from '../../pipes/level-label.pipe';

@Component({
  selector: 'app-offer-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    LevelLabelPipe,
    SessionTypeLabelPipe,
    CurrencyPipe
  ],
  template: `
    <mat-card class="offer-card">
      <mat-card-header>
        <mat-card-title>{{ offer.title }}</mat-card-title>
        <mat-card-subtitle>{{ offer.subjectName }} · {{ offer.ownerName }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div class="chips">
          <mat-chip-set>
            <mat-chip>{{ offer.level | levelLabel }}</mat-chip>
            <mat-chip>{{ offer.sessionType | sessionTypeLabel }}</mat-chip>
            @if (offer.location) {
              <mat-chip>
                <mat-icon matChipAvatar>location_on</mat-icon>
                {{ offer.location }}
              </mat-chip>
            }
          </mat-chip-set>
        </div>
        <div class="price">
          <strong>{{ offer.price | currency:'RON':'symbol':'1.0-0' }}</strong> / sesiune
        </div>
      </mat-card-content>
      <mat-card-actions>
        <button mat-button color="primary" [routerLink]="['/offers', offer.id]">
          Vezi detalii
        </button>
        @if (showActions) {
          <button mat-icon-button color="accent" (click)="edit.emit(offer.id)" title="Editează">
            <mat-icon>edit</mat-icon>
          </button>
          <button mat-icon-button color="warn" (click)="delete.emit(offer.id)" title="Șterge">
            <mat-icon>delete</mat-icon>
          </button>
        }
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .offer-card { height: 100%; display: flex; flex-direction: column; }
    .chips { margin-bottom: 12px; }
    .price { font-size: 18px; color: #3f51b5; margin-top: 8px; }
    mat-card-actions { margin-top: auto; }
  `]
})
export class OfferCardComponent {
  @Input({ required: true }) offer!: StudyOfferList;
  @Input() showActions = false;
  @Output() edit = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();
}
