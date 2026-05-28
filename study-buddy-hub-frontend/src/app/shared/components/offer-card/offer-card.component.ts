import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StudyOfferList } from '../../../core/models/study-offer.models';
import { LevelLabelPipe, SessionTypeLabelPipe } from '../../pipes/level-label.pipe';
import { avatarStyle, initials } from '../../utils/avatar.utils';

@Component({
  selector: 'app-offer-card',
  standalone: true,
  imports: [CommonModule, RouterModule, LevelLabelPipe, SessionTypeLabelPipe],
  template: `
    <article class="offer">
      <div class="offer__media">
        <!-- Tutor avatar -->
        <span class="offer__avatar sbh-avatar sbh-avatar--md"
              [style.background]="ownerAvatarStyle">{{ ownerInitials }}</span>

        <!-- Subject image -->
        @if (offer.subjectImageUrl) {
          <img class="offer__media-bg offer__media-img" [src]="offer.subjectImageUrl" [alt]="offer.subjectName" />
        } @else {
          <div class="offer__media-bg" [style.background]="subjectGradient(offer.subjectName)"></div>
        }

        <!-- Fav button -->
        @if (showFavButton) {
          <button class="offer__fav" [class.offer__fav--active]="isFavorite"
                  (click)="onFavClick($event)" title="Salvează">
            <span class="material-icons">{{ isFavorite ? 'favorite' : 'favorite_border' }}</span>
          </button>
        }

        <!-- Admin delete -->
        @if (showActions) {
          <button class="offer__fav" style="right: 58px" (click)="onEdit($event)" title="Editează">
            <span class="material-icons-outlined" style="font-size:18px">edit</span>
          </button>
          <button class="offer__fav offer__fav--danger" (click)="onDelete($event)" title="Șterge">
            <span class="material-icons-outlined" style="font-size:18px">delete</span>
          </button>
        }

        <!-- Subject chip -->
        <div class="offer__media-chips">
          <span class="sbh-chip sbh-chip--ghost">
            <span class="material-icons-outlined">{{ sessionIcon }}</span>
            {{ offer.sessionType | sessionTypeLabel }}
          </span>
        </div>
      </div>

      <div class="offer__body">
        <div class="offer__top">
          <div style="min-width:0">
            <div class="offer__tutor">{{ offer.ownerName }}
              @if (offer.location) { · {{ offer.location }} }
            </div>
            <h3 class="offer__title">{{ offer.title }}</h3>
          </div>
        </div>

        <div class="offer__meta">
          <span class="sbh-chip sbh-chip--outline">
            <span class="material-icons-outlined">school</span>
            {{ offer.level | levelLabel }}
          </span>
          <span class="sbh-chip">
            <span class="material-icons-outlined">menu_book</span>
            {{ offer.subjectName }}
          </span>
        </div>

        <div class="offer__foot">
          <div>
            <span class="offer__price">{{ offer.price }} lei</span>
            <span class="offer__price-unit"> /sesiune</span>
          </div>
          <button class="offer__cta" [routerLink]="['/offers', offer.id]">
            Vezi oferta
            <span class="material-icons-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </article>
  `,
  styles: [`
    .offer {
      background: white;
      border-radius: var(--radius-lg);
      overflow: hidden;
      border: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
      transition: transform .25s var(--ease), box-shadow .25s var(--ease);
      cursor: pointer;
      display: flex; flex-direction: column;
      text-decoration: none; color: inherit;
      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
      }
    }
    .offer__media {
      position: relative;
      aspect-ratio: 16 / 11;
      background: var(--indigo-50);
      overflow: hidden;
    }
    .offer__media-bg {
      width: 100%; height: 100%;
      transition: transform .5s var(--ease);
    }
    .offer__media-img {
      object-fit: cover;
      position: absolute; inset: 0;
    }
    .offer:hover .offer__media-bg { transform: scale(1.04); }
    .offer__media::after {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(180deg, rgba(15,18,48,0) 35%, rgba(15,18,48,.55) 100%);
    }
    .offer__avatar {
      position: absolute; top: 14px; left: 14px;
      z-index: 2;
      box-shadow: 0 4px 10px rgba(15,18,48,.3), inset 0 0 0 3px white;
    }
    .offer__fav {
      position: absolute; top: 14px; right: 14px; z-index: 2;
      width: 36px; height: 36px; border-radius: 999px;
      background: rgba(255,255,255,.92);
      border: 0; display: grid; place-items: center;
      color: var(--indigo-900);
      transition: transform .15s, background .15s;
      cursor: pointer;
      .material-icons, .material-icons-outlined { font-size: 19px; }
      &:hover { transform: scale(1.08); background: white; }
    }
    .offer__fav--active { color: var(--coral-600); }
    .offer__fav--danger { color: #c62828; }
    .offer__media-chips {
      position: absolute; left: 14px; bottom: 14px;
      z-index: 2; display: flex; gap: 6px;
    }
    .offer__body {
      padding: 18px 20px 20px;
      display: flex; flex-direction: column; gap: 12px;
      flex: 1;
    }
    .offer__top {
      display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
    }
    .offer__tutor {
      font-size: 13px; font-weight: 600; color: var(--text-muted);
      letter-spacing: -.005em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .offer__title {
      font-size: 17px; font-weight: 700; letter-spacing: -.02em;
      color: var(--indigo-900); margin: 4px 0 0;
      line-height: 1.25;
      overflow: hidden; text-overflow: ellipsis;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    }
    .offer__meta {
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
    }
    .offer__foot {
      display: flex; align-items: flex-end; justify-content: space-between;
      padding-top: 14px; border-top: 1px solid var(--border); margin-top: auto;
    }
    .offer__price {
      font-size: 22px; font-weight: 800; letter-spacing: -.02em;
      color: var(--indigo-900); line-height: 1;
    }
    .offer__price-unit { font-size: 13px; color: var(--text-muted); font-weight: 500; }
    .offer__cta {
      height: 38px; padding: 0 16px;
      border-radius: 999px;
      background: var(--indigo-700); color: white;
      border: 0; font-weight: 600; font-size: 13.5px;
      display: inline-flex; align-items: center; gap: 4px;
      transition: background .15s, transform .15s;
      cursor: pointer; font-family: inherit;
      .material-icons-outlined { font-size: 16px; }
      &:hover { background: var(--coral-600); transform: translateX(2px); }
    }
  `]
})
export class OfferCardComponent {
  @Input({ required: true }) offer!: StudyOfferList;
  @Input() showActions = false;
  @Input() showFavButton = false;
  @Input() isFavorite = false;
  @Output() edit = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();
  @Output() favToggle = new EventEmitter<number>();

  get ownerInitials(): string { return initials(this.offer.ownerName); }
  get ownerAvatarStyle(): string { return avatarStyle(this.offer.ownerName); }

  get sessionIcon(): string {
    const map: Record<string, string> = {
      Online: 'videocam',
      OnSite: 'home',
      Hybrid: 'sync_alt'
    };
    return map[this.offer.sessionType] ?? 'videocam';
  }

  subjectGradient(subject: string): string {
    const gradients: Record<string, string> = {
      'Matematică':   'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'Informatică':  'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
      'Fizică':       'linear-gradient(135deg, #1a1f5e 0%, #4a52b8 100%)',
      'Chimie':       'linear-gradient(135deg, #0f8a5f 0%, #1a1f5e 100%)',
      'Biologie':     'linear-gradient(135deg, #1a6b3a 0%, #2e8b57 100%)',
      'Engleză':      'linear-gradient(135deg, #b35900 0%, #ff6b35 100%)',
      'Lb. Română':   'linear-gradient(135deg, #c44a89 0%, #1a1f5e 100%)',
      'Istorie':      'linear-gradient(135deg, #7b4f12 0%, #b35900 100%)',
    };
    return gradients[subject] ?? 'linear-gradient(135deg, var(--indigo-700) 0%, var(--indigo-500) 100%)';
  }

  navigate(e: Event): void {
    e.stopPropagation();
    e.preventDefault();
  }

  onFavClick(e: Event): void {
    e.stopPropagation();
    e.preventDefault();
    this.favToggle.emit(this.offer.id);
  }

  onEdit(e: Event): void {
    e.stopPropagation();
    e.preventDefault();
    this.edit.emit(this.offer.id);
  }

  onDelete(e: Event): void {
    e.stopPropagation();
    e.preventDefault();
    this.delete.emit(this.offer.id);
  }
}
