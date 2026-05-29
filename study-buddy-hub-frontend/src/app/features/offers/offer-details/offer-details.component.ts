import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StudyOffersService } from '../../../core/services/study-offers.service';
import { StudyRequestsService } from '../../../core/services/study-requests.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { AuthService } from '../../../core/services/auth.service';
import { StudyOfferDetails } from '../../../core/models/study-offer.models';
import { LevelLabelPipe, SessionTypeLabelPipe } from '../../../shared/pipes/level-label.pipe';
import { avatarStyle, initials } from '../../../shared/utils/avatar.utils';

@Component({
  selector: 'app-offer-details',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, DatePipe,
    MatSnackBarModule, LevelLabelPipe, SessionTypeLabelPipe
  ],
  template: `
    @if (loading) {
      <div class="detail-loading">
        <div class="sbh-spinner"></div>
      </div>
    } @else if (offer) {
      <div class="detail">
        <!-- Back -->
        <a class="detail__back" routerLink="/">
          <span class="material-icons-outlined">arrow_back</span>
          Înapoi la oferte
        </a>

        <!-- Hero image -->
        <div class="detail__hero" [style.background]="offer.subjectImageUrl ? 'none' : subjectGradient">
          @if (offer.subjectImageUrl) {
            <img class="detail__hero-img" [src]="offer.subjectImageUrl" [alt]="offer.subjectName" />
          }
          <div class="detail__hero-meta">
            <span class="sbh-chip sbh-chip--ghost">
              <span class="material-icons-outlined">menu_book</span>
              {{ offer.subjectName }}
            </span>
            <span class="sbh-chip sbh-chip--ghost">
              <span class="material-icons-outlined">school</span>
              {{ offer.level | levelLabel }}
            </span>
            <span class="sbh-chip sbh-chip--ghost">
              <span class="material-icons-outlined">{{ sessionIcon }}</span>
              {{ offer.sessionType | sessionTypeLabel }}
            </span>
            @if (!offer.isActive) {
              <span class="sbh-chip sbh-chip--coral">Inactivă</span>
            }
            <span style="flex:1"></span>
            <!-- Actions -->
            @if (auth.isLoggedIn() && !isOwner) {
              <button class="sbh-icon-btn" style="background:rgba(255,255,255,.92);color:var(--indigo-900)"
                      (click)="toggleFavorite()" [title]="isFavorite ? 'Elimină din favorite' : 'Adaugă la favorite'">
                <span class="material-icons">{{ isFavorite ? 'favorite' : 'favorite_border' }}</span>
              </button>
            }
            @if (isOwner || auth.isAdmin()) {
              <a [routerLink]="['/offers', offer.id, 'edit']"
                 class="sbh-icon-btn" style="background:rgba(255,255,255,.92);color:var(--indigo-900)"
                 title="Editează">
                <span class="material-icons-outlined">edit</span>
              </a>
            }
          </div>
        </div>

        <!-- Two-column layout -->
        <div class="detail__layout">
          <!-- Main content -->
          <div>
            <h1 class="detail__title">{{ offer.title }}</h1>
            <div class="detail__meta-row">
              @if (offer.location) {
                <span class="detail__meta-item">
                  <span class="material-icons-outlined">location_on</span>
                  {{ offer.location }}
                </span>
              }
              <span class="detail__meta-item">
                <span class="material-icons-outlined">calendar_today</span>
                Publicat {{ offer.createdAt | date:'d MMM yyyy' }}
              </span>
            </div>

            <!-- Tutor card -->
            <div class="detail__tutor">
              <span class="sbh-avatar sbh-avatar--lg" [style.background]="ownerAvatarStyle">
                {{ ownerInitials }}
              </span>
              <div style="flex:1">
                <div class="detail__tutor-name">{{ offer.ownerName }}</div>
                <div class="detail__tutor-meta">
                  {{ offer.subjectName }}
                  @if (offer.ownerEmail) { · {{ offer.ownerEmail }} }
                </div>
              </div>
              @if (auth.isLoggedIn() && !isOwner && offer.isActive) {
                <button class="sbh-btn sbh-btn--stroked sbh-btn--sm"
                        (click)="showRequestForm = !showRequestForm">
                  <span class="material-icons-outlined" style="font-size:18px">send</span>
                  Trimite cerere
                </button>
              }
            </div>

            <h2 class="detail__h2">Descriere</h2>
            <div class="detail__body">
              <p>{{ offer.description }}</p>
            </div>

            <h2 class="detail__h2">Ce vei obține</h2>
            <ul class="detail__bullets">
              <li><span class="material-icons-outlined">check_circle</span> Concepte fundamentale explicate clar</li>
              <li><span class="material-icons-outlined">check_circle</span> Tehnici de rezolvare pentru probleme tipice</li>
              <li><span class="material-icons-outlined">check_circle</span> Materiale personalizate</li>
              <li><span class="material-icons-outlined">check_circle</span> Feedback după fiecare sesiune</li>
            </ul>

            <!-- Request form inline -->
            @if (showRequestForm && offer.isActive) {
              <div class="request-form-card">
                <h2 class="detail__h2" style="margin-top:0">Trimite o cerere</h2>
                <form [formGroup]="requestForm" (ngSubmit)="sendRequest()">
                  <div class="sbh-field">
                    <label class="sbh-field__label">Mesaj (opțional)</label>
                    <div class="sbh-field__input" style="height:auto;padding:14px 16px;align-items:flex-start">
                      <textarea formControlName="message" rows="3" style="flex:1;border:0;outline:0;background:transparent;font:inherit;font-size:15px;color:var(--text);resize:vertical"
                                placeholder="Descrie pe scurt ce ai nevoie..."></textarea>
                    </div>
                  </div>
                  <div style="display:flex;gap:10px;margin-top:4px">
                    <button type="submit" class="sbh-btn sbh-btn--raised" [disabled]="sendingRequest">
                      @if (sendingRequest) { <span class="sbh-spin-sm"></span> } @else { Trimite }
                    </button>
                    <button type="button" class="sbh-btn sbh-btn--flat" (click)="showRequestForm = false">Anulează</button>
                  </div>
                </form>
              </div>
            }
          </div>

          <!-- Booking sidebar -->
          <aside>
            <div class="book">
              <div class="book__price">
                <span class="book__price-num">{{ offer.price }} lei</span>
                <span class="book__price-unit">/ sesiune</span>
              </div>

              <div class="book__row">
                <div class="book__field">
                  <div class="book__field-label">Nivel</div>
                  <div class="book__field-val">{{ offer.level | levelLabel }}</div>
                </div>
                <div class="book__field">
                  <div class="book__field-label">Format</div>
                  <div class="book__field-val">{{ offer.sessionType | sessionTypeLabel }}</div>
                </div>
              </div>
              @if (offer.location) {
                <div class="book__row">
                  <div class="book__field" style="grid-column:1/-1">
                    <div class="book__field-label">Locație</div>
                    <div class="book__field-val">{{ offer.location }}</div>
                  </div>
                </div>
              }

              @if (auth.isLoggedIn() && !isOwner) {
                @if (offer.isActive) {
                  <button class="sbh-btn sbh-btn--accent sbh-btn--full"
                          style="margin-top:16px;height:52px"
                          (click)="showRequestForm = true">
                    Trimite cerere
                  </button>
                } @else {
                  <div class="book__taken">
                    <span class="material-icons-outlined">lock</span>
                    Sesiune rezervată
                  </div>
                }
                <button class="sbh-btn sbh-btn--stroked sbh-btn--full"
                        style="margin-top:8px"
                        (click)="toggleFavorite()">
                  <span class="material-icons">{{ isFavorite ? 'favorite' : 'favorite_border' }}</span>
                  {{ isFavorite ? 'Salvat' : 'Salvează' }}
                </button>
              } @else if (!auth.isLoggedIn()) {
                <a routerLink="/login" class="sbh-btn sbh-btn--raised sbh-btn--full"
                   style="margin-top:16px;height:52px">
                  Autentifică-te pentru a solicita
                </a>
              } @else {
                <a [routerLink]="['/offers', offer.id, 'edit']"
                   class="sbh-btn sbh-btn--stroked sbh-btn--full" style="margin-top:16px">
                  <span class="material-icons-outlined">edit</span> Editează oferta
                </a>
              }

              <p class="book__note">Nu se percepe nicio plată acum.</p>

              <div class="book__total">
                <span class="book__total-label">Sesiune</span>
                <span class="book__total-val">{{ offer.price }} lei</span>
              </div>
              <div class="book__fee">
                <span>Comision platformă</span><span>Gratuit</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    } @else {
      <div class="detail">
        <div class="empty-state" style="max-width:480px;margin:60px auto">
          <span class="material-icons-outlined">error_outline</span>
          <h3>Oferta nu a fost găsită</h3>
          <p>Aceasta a fost ștearsă sau nu există.</p>
          <a routerLink="/" class="sbh-btn sbh-btn--raised" style="margin-top:16px">Înapoi la oferte</a>
        </div>
      </div>
    }
  `,
  styles: [`
    .detail-loading {
      display: flex; justify-content: center; align-items: center;
      min-height: 50vh;
    }
    .sbh-spinner {
      width: 40px; height: 40px; border-radius: 999px;
      border: 3px solid var(--indigo-100); border-top-color: var(--indigo-700);
      animation: spin .8s linear infinite;
    }
    .sbh-spin-sm {
      width: 18px; height: 18px; border-radius: 999px;
      border: 2px solid rgba(255,255,255,.3); border-top-color: white;
      animation: spin .8s linear infinite; display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .detail {
      max-width: 1080px; margin: 0 auto; padding: 32px 32px 80px;
    }
    .detail__back {
      display: inline-flex; align-items: center; gap: 6px;
      color: var(--text-muted); font-weight: 600; font-size: 14px;
      margin-bottom: 18px; cursor: pointer; text-decoration: none;
      transition: color .15s;
      .material-icons-outlined { font-size: 20px; }
      &:hover { color: var(--indigo-700); }
    }
    .detail__hero {
      position: relative; height: 320px;
      border-radius: var(--radius-xl); overflow: hidden;
      margin-bottom: 28px;
      &::after {
        content: ''; position: absolute; inset: 0;
        background: linear-gradient(180deg, rgba(15,18,48,0) 30%, rgba(15,18,48,.7) 100%);
      }
    }
    .detail__hero-img {
      position: absolute; inset: 0;
      width: 100%; height: 100%; object-fit: cover;
    }
    .detail__hero-meta {
      position: absolute; left: 24px; right: 24px; bottom: 22px;
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
      z-index: 2;
    }
    .detail__layout {
      display: grid; grid-template-columns: 1.4fr .9fr; gap: 40px;
      align-items: flex-start;
    }
    .detail__title {
      font-size: 36px; font-weight: 800; letter-spacing: -.025em;
      margin: 0 0 12px; color: var(--indigo-900);
    }
    .detail__meta-row {
      display: flex; align-items: center; gap: 20px;
      font-size: 14px; color: var(--text-muted);
      margin-bottom: 20px;
    }
    .detail__meta-item {
      display: inline-flex; align-items: center; gap: 4px;
      .material-icons-outlined { font-size: 16px; }
    }
    .detail__tutor {
      display: flex; align-items: center; gap: 14px;
      padding: 16px; border-radius: var(--radius-lg);
      background: var(--bg-soft); border: 1px solid var(--border);
      margin-bottom: 24px;
    }
    .detail__tutor-name { font-weight: 700; font-size: 16px; }
    .detail__tutor-meta { font-size: 13px; color: var(--text-muted); margin-top: 2px; }
    .detail__h2 {
      font-size: 20px; font-weight: 700; letter-spacing: -.015em;
      margin: 24px 0 12px;
    }
    .detail__body p {
      font-size: 15.5px; line-height: 1.7; color: var(--text); margin: 0 0 12px;
      white-space: pre-wrap;
    }
    .detail__bullets {
      list-style: none; padding: 0; margin: 0; display: grid; gap: 10px;
      li {
        display: flex; gap: 10px; align-items: flex-start;
        font-size: 15px; color: var(--text);
      }
      .material-icons-outlined { color: var(--success); font-size: 20px; flex-shrink: 0; }
    }

    .request-form-card {
      margin-top: 24px; padding: 24px;
      background: var(--bg-soft); border: 1px solid var(--border);
      border-radius: var(--radius-lg);
    }

    /* Booking sidebar */
    .book {
      position: sticky; top: 90px;
      background: white; border: 1px solid var(--border);
      border-radius: var(--radius-lg); box-shadow: var(--shadow-md);
      padding: 24px;
    }
    .book__price {
      display: flex; align-items: flex-end; gap: 6px; margin-bottom: 16px;
    }
    .book__price-num { font-size: 32px; font-weight: 800; letter-spacing: -.025em; color: var(--indigo-900); line-height: 1; }
    .book__price-unit { color: var(--text-muted); font-size: 14px; }
    .book__row {
      display: grid; grid-template-columns: 1fr 1fr; gap: 0;
      border: 1px solid var(--border); border-radius: 12px; overflow: hidden;
      margin-bottom: 10px;
    }
    .book__field {
      padding: 10px 14px;
      & + .book__field { border-left: 1px solid var(--border); }
    }
    .book__field-label { font-size: 11px; font-weight: 700; color: var(--text-muted); letter-spacing: .04em; text-transform: uppercase; }
    .book__field-val { font-size: 14px; font-weight: 600; color: var(--text); margin-top: 2px; }
    .book__note {
      font-size: 12px; color: var(--text-muted); text-align: center;
      margin: 14px 0 0;
    }
    .book__total {
      display: flex; justify-content: space-between; align-items: center;
      margin-top: 16px; padding-top: 14px;
      border-top: 1px solid var(--border); font-weight: 700;
    }
    .book__total-label { color: var(--text-muted); font-size: 14px; font-weight: 600; }
    .book__total-val { font-size: 18px; color: var(--indigo-900); }
    .book__fee {
      display: flex; justify-content: space-between;
      font-size: 13px; color: var(--text-muted); margin-top: 6px;
    }
    .book__taken {
      margin-top: 16px; height: 52px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      background: var(--bg-soft); border: 1px solid var(--border);
      border-radius: var(--radius-md); color: var(--text-muted);
      font-weight: 600; font-size: 15px;
      .material-icons-outlined { font-size: 20px; }
    }

    @media (max-width: 980px) {
      .detail { padding: 22px 18px 60px; }
      .detail__layout { grid-template-columns: 1fr; }
      .detail__title { font-size: 28px; }
      .book { position: static; }
    }
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

  requestForm = this.fb.group({ message: [''] });

  get isOwner(): boolean {
    return !!this.offer && this.offer.ownerId === this.auth.getCurrentUserId();
  }

  get ownerInitials(): string {
    return this.offer ? initials(this.offer.ownerName) : '';
  }
  get ownerAvatarStyle(): string {
    return this.offer ? avatarStyle(this.offer.ownerName) : '';
  }
  get sessionIcon(): string {
    const map: Record<string, string> = { Online: 'videocam', OnSite: 'home', Hybrid: 'sync_alt' };
    return this.offer ? (map[this.offer.sessionType] ?? 'videocam') : 'videocam';
  }
  get subjectGradient(): string {
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
    if (!this.offer) return 'linear-gradient(135deg, var(--indigo-700) 0%, var(--indigo-500) 100%)';
    return gradients[this.offer.subjectName] ?? 'linear-gradient(135deg, var(--indigo-700) 0%, var(--indigo-500) 100%)';
  }

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
    this.requestsService.create({
      offerId: this.offer.id,
      message: this.requestForm.value.message || undefined
    }).subscribe({
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
