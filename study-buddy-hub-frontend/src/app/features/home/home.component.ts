import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudyOffersService } from '../../core/services/study-offers.service';
import { SubjectsService } from '../../core/services/subjects.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { AuthService } from '../../core/services/auth.service';
import { StudyOfferList } from '../../core/models/study-offer.models';
import { Subject } from '../../core/models/subject.models';
import { OfferCardComponent } from '../../shared/components/offer-card/offer-card.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

const SUBJECT_ICONS: Record<string, string> = {
  'Matematică':  'calculate',
  'Informatică': 'code',
  'Fizică':      'science',
  'Chimie':      'biotech',
  'Engleză':     'translate',
  'Biologie':    'eco',
  'Lb. Română':  'menu_book',
  'Istorie':     'history_edu',
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, OfferCardComponent, MatSnackBarModule],
  template: `
    <!-- ===================== HERO ===================== -->
    <section class="hero">
      <div class="hero__inner">
        <div>
          <span class="hero__eyebrow">
            <span class="hero__eyebrow-dot">
              <span class="material-icons-outlined">check</span>
            </span>
            Peste 2.400 de tutori verificați
          </span>
          <h1>Găsește tutorul <em>perfect</em><br>pentru tine.</h1>
          <p class="hero__sub">
            Profesori verificați pentru matematică, informatică, fizică și multe altele.
            Lecții online sau față în față, oricând ai nevoie.
          </p>

          <div class="hero__search">
            <span class="material-icons-outlined">search</span>
            <input
              type="text"
              placeholder="Caută materie, profesor sau nivel..."
              [(ngModel)]="query"
              (ngModelChange)="onQueryChange()"
            >
            <button class="hero__filter-btn" title="Filtre" (click)="showFilters = !showFilters">
              <span class="material-icons-outlined">tune</span>
            </button>
            <button class="sbh-btn sbh-btn--accent sbh-btn--sm" (click)="applySearch()">Caută</button>
          </div>

          <div class="hero__chips">
            <span class="sbh-chip sbh-chip--outline">Cele mai cerute:</span>
            @for (tag of quickTags; track tag) {
              <span class="sbh-chip sbh-chip--coral" style="cursor:pointer" (click)="query = tag; onQueryChange()">
                {{ tag }}
              </span>
            }
          </div>

          <div class="hero__stats">
            <div>
              <div class="hero__stat-num">{{ offers().length }}+</div>
              <div class="hero__stat-label">oferte active</div>
            </div>
            <div>
              <div class="hero__stat-num">18K+</div>
              <div class="hero__stat-label">elevi mulțumiți</div>
            </div>
            <div>
              <div class="hero__stat-num">4.9★</div>
              <div class="hero__stat-label">rating mediu</div>
            </div>
          </div>
        </div>

        <!-- Hero visual collage -->
        <div class="hero__visual">
          <div class="hero__tile hero__tile--a">
            <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&auto=format&fit=crop&q=80" alt="" loading="lazy">
          </div>
          <div class="hero__tile hero__tile--b">
            <img src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&auto=format&fit=crop&q=80" alt="" loading="lazy">
          </div>
          <div class="hero__tile hero__tile--c">
            <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=80" alt="" loading="lazy">
          </div>
          <div class="hero__tile hero__tile--d">
            <img src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=500&auto=format&fit=crop&q=80" alt="" loading="lazy">
          </div>
          <!-- Floating badges -->
          <div class="hero__badge hero__badge--top">
            <span class="hero__badge-icon hero__badge-icon--coral">
              <span class="material-icons-outlined">verified</span>
            </span>
            <div>
              <div class="hero__badge-num">4.9★</div>
              <div class="hero__badge-lbl">rating mediu</div>
            </div>
          </div>
          <div class="hero__badge hero__badge--bottom">
            <span class="hero__badge-icon">
              <span class="material-icons-outlined">groups</span>
            </span>
            <div>
              <div class="hero__badge-num">2.4K+</div>
              <div class="hero__badge-lbl">tutori activi</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============= SUBJECT RAIL + OFFER LISTING ============= -->
    <div class="sbh-section">

      <div class="sbh-section__head">
        <div>
          <h2 class="sbh-section__title">Explorează după materie</h2>
          <p class="sbh-section__sub">Alege un domeniu și descoperă tutori potriviți pentru obiectivul tău.</p>
        </div>
        @if (auth.isLoggedIn()) {
          <a routerLink="/offers/create" class="sbh-btn sbh-btn--raised sbh-btn--sm">
            <span class="material-icons-outlined">add</span> Publică ofertă
          </a>
        }
      </div>

      <!-- Subject pills rail -->
      <div class="subject-rail">
        <button class="subject-pill" [class.subject-pill--active]="activeSubjectId() === null"
                (click)="setSubject(null)">
          <span class="subject-pill__icon"><span class="material-icons-outlined">apps</span></span>
          Toate
        </button>
        @for (s of subjects; track s.id) {
          <button class="subject-pill" [class.subject-pill--active]="activeSubjectId() === s.id"
                  (click)="setSubject(s.id)">
            <span class="subject-pill__icon">
              <span class="material-icons-outlined">{{ subjectIcon(s.name) }}</span>
            </span>
            {{ s.name }}
          </button>
        }
      </div>

      <!-- Filter row -->
      @if (showFilters) {
        <div class="filter-row">
          <label class="filter-label">Nivel:</label>
          <div class="filter-chips">
            @for (opt of levelOptions; track opt.id) {
              <button class="sbh-chip sbh-chip--outline filter-chip"
                      [class.filter-chip--active]="activeLevel() === opt.id"
                      (click)="activeLevel.set(opt.id); reload()">
                {{ opt.label }}
              </button>
            }
          </div>
          <label class="filter-label" style="margin-left:16px">Preț max:</label>
          <div class="price-inputs">
            <input type="number" class="price-input" placeholder="Min" [(ngModel)]="minPrice" (change)="reload()">
            <span style="color:var(--text-muted)">—</span>
            <input type="number" class="price-input" placeholder="Max" [(ngModel)]="maxPrice" (change)="reload()">
          </div>
        </div>
      }

      <!-- Results count -->
      <div class="results-row">
        <span class="results-count">
          <strong>{{ filteredOffers().length }}</strong> oferte găsite
        </span>
      </div>

      <!-- Offers grid -->
      @if (loading()) {
        <div class="spinner-container">
          <div class="sbh-spinner"></div>
        </div>
      } @else if (filteredOffers().length === 0) {
        <div class="empty-state">
          <span class="material-icons-outlined">search_off</span>
          <h3>Niciun rezultat</h3>
          <p>Încearcă altă materie sau resetează filtrele.</p>
        </div>
      } @else {
        <div class="sbh-offers-grid">
          @for (offer of filteredOffers(); track offer.id) {
            <app-offer-card
              [offer]="offer"
              [showFavButton]="auth.isLoggedIn()"
              [isFavorite]="favoriteIds().has(offer.id)"
              (favToggle)="toggleFavorite($event)"
            ></app-offer-card>
          }
        </div>
      }
    </div>

    <!-- ============= HOW IT WORKS ============= -->
    <div style="background: var(--bg-soft); border-top: 1px solid var(--border);">
      <div class="sbh-section">
        <div class="sbh-section__head">
          <div>
            <h2 class="sbh-section__title">Cum funcționează</h2>
            <p class="sbh-section__sub">Trei pași simpli până la prima lecție.</p>
          </div>
        </div>
        <div class="how">
          <div class="how__step">
            <span class="how__num">1</span>
            <h3>Caută &amp; filtrează</h3>
            <p>Alege materia, nivelul și formatul preferat. Vezi profilurile complete și rating-uri de la elevi reali.</p>
          </div>
          <div class="how__step">
            <span class="how__num how__num--coral">2</span>
            <h3>Programează o lecție</h3>
            <p>Trimite o cerere tutorului ales. Confirmare rapidă, fără apeluri sau agenți intermediari.</p>
          </div>
          <div class="how__step">
            <span class="how__num">3</span>
            <h3>Învață cu încredere</h3>
            <p>Conectează-te online sau întâlnește-te față în față. Platforma ta de tutoriat — simplă și eficientă.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ============= FOOTER ============= -->
    <footer class="footer">
      <div class="footer__inner">
        <div>
          <div class="footer__logo">
            <span class="nav__logo-mark">
              <span class="material-icons-outlined">auto_stories</span>
            </span>
            StudyBuddy Hub
          </div>
          <p>Marketplace-ul de tutoriat care conectează elevi și studenți cu cei mai buni profesori din România.</p>
        </div>
        <div>
          <h4>Platformă</h4>
          <ul>
            <li><a routerLink="/">Explorează tutori</a></li>
            <li><a routerLink="/offers/create">Devino tutor</a></li>
          </ul>
        </div>
        <div>
          <h4>Cont</h4>
          <ul>
            @if (!auth.isLoggedIn()) {
              <li><a routerLink="/login">Autentificare</a></li>
              <li><a routerLink="/register">Înregistrare</a></li>
            } @else {
              <li><a routerLink="/profile">Profilul meu</a></li>
              <li><a routerLink="/dashboard/my-offers">Ofertele mele</a></li>
            }
          </ul>
        </div>
        <div>
          <h4>Legal</h4>
          <ul>
            <li>Termeni și condiții</li>
            <li>Politică de confidențialitate</li>
          </ul>
        </div>
      </div>
      <div class="footer__bottom">
        <span>© 2026 StudyBuddy Hub. Toate drepturile rezervate.</span>
        <span>Proiect universitar DAW</span>
      </div>
    </footer>
  `,
  styles: [`
    /* ---------- Hero ---------- */
    .hero {
      position: relative;
      background:
        radial-gradient(1200px 500px at 85% -20%, rgba(255,107,53,.14), transparent 60%),
        radial-gradient(900px 600px at -10% 110%, rgba(26,31,94,.10), transparent 60%),
        linear-gradient(180deg, #fbf8f3 0%, #f8f9ff 100%);
      border-bottom: 1px solid var(--border);
      overflow: hidden;
    }
    .hero__inner {
      max-width: 1280px; margin: 0 auto;
      padding: 72px 32px 56px;
      display: grid; grid-template-columns: 1.1fr .9fr; gap: 56px;
      align-items: center;
    }
    .hero__eyebrow {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 6px 12px 6px 8px;
      background: white; border: 1px solid var(--border);
      border-radius: 999px; box-shadow: var(--shadow-xs);
      font-size: 13px; font-weight: 600; color: var(--text-muted);
    }
    .hero__eyebrow-dot {
      width: 18px; height: 18px; border-radius: 999px;
      background: var(--success);
      display: grid; place-items: center; color: white;
      .material-icons-outlined { font-size: 12px; }
    }
    .hero h1 {
      font-size: clamp(40px, 5.4vw, 64px); line-height: 1.02;
      font-weight: 800; letter-spacing: -.035em;
      margin: 18px 0 14px; color: var(--indigo-900);
    }
    .hero h1 em {
      font-style: normal;
      background: linear-gradient(110deg, var(--coral-600) 0%, var(--coral-700) 80%);
      -webkit-background-clip: text; background-clip: text; color: transparent;
    }
    .hero__sub {
      font-size: 18px; line-height: 1.55; color: var(--text-muted);
      max-width: 540px; margin: 0 0 28px;
    }
    .hero__search {
      display: flex; align-items: center; gap: 8px;
      background: white; border: 1px solid var(--border);
      border-radius: 999px; padding: 8px 8px 8px 22px;
      box-shadow: var(--shadow-lg); max-width: 560px;
      .material-icons-outlined { color: var(--text-soft); font-size: 22px; flex-shrink: 0; }
      input {
        flex: 1; border: 0; outline: 0; background: transparent;
        font: inherit; font-size: 15.5px; color: var(--text);
        padding: 12px 4px;
        &::placeholder { color: var(--text-soft); }
      }
    }
    .hero__filter-btn {
      height: 44px; width: 44px; border-radius: 999px;
      background: var(--indigo-50); color: var(--indigo-700);
      border: 0; display: grid; place-items: center; margin-right: 4px;
      transition: background .15s; cursor: pointer; flex-shrink: 0;
      .material-icons-outlined { font-size: 20px; }
      &:hover { background: var(--indigo-100); }
    }
    .hero__chips {
      display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px;
    }
    .hero__stats {
      display: flex; gap: 28px; margin-top: 36px;
      padding-top: 24px; border-top: 1px solid var(--border);
    }
    .hero__stat-num {
      font-size: 26px; font-weight: 800; letter-spacing: -.02em;
      color: var(--indigo-900); line-height: 1;
    }
    .hero__stat-label { font-size: 13px; color: var(--text-muted); margin-top: 6px; }

    /* Hero visual */
    .hero__visual { position: relative; height: 480px; }
    .hero__tile {
      position: absolute; border-radius: var(--radius-lg);
      overflow: hidden; box-shadow: var(--shadow-xl); background: var(--indigo-50);
      img { width: 100%; height: 100%; object-fit: cover; display: block; }
    }
    .hero__tile--a { top: 0; left: 40px; width: 240px; height: 300px; transform: rotate(-4deg); }
    .hero__tile--b { top: 50px; right: 0; width: 260px; height: 200px; transform: rotate(3deg); }
    .hero__tile--c { bottom: 0; left: 0; width: 220px; height: 200px; transform: rotate(2deg); }
    .hero__tile--d { bottom: 30px; right: 40px; width: 230px; height: 240px; transform: rotate(-3deg); }
    .hero__badge {
      position: absolute; background: white;
      border: 1px solid var(--border); border-radius: 14px;
      padding: 12px 14px; box-shadow: var(--shadow-lg);
      display: flex; align-items: center; gap: 10px;
      font-size: 13px; font-weight: 600;
    }
    .hero__badge--top    { top: 130px; right: -20px; }
    .hero__badge--bottom { bottom: 80px; left: -10px; }
    .hero__badge-icon {
      width: 36px; height: 36px; border-radius: 10px;
      background: var(--indigo-50); color: var(--indigo-700);
      display: grid; place-items: center;
      .material-icons-outlined { font-size: 20px; }
    }
    .hero__badge-icon--coral { background: var(--coral-50); color: var(--coral-700); }
    .hero__badge-num { font-size: 18px; color: var(--indigo-700); font-weight: 800; }
    .hero__badge-lbl { font-size: 11px; color: var(--text-muted); font-weight: 500; }

    /* ---------- Subject rail ---------- */
    .subject-rail {
      display: flex; gap: 12px; overflow-x: auto;
      padding-bottom: 4px; margin-bottom: 28px;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }
    }
    .subject-pill {
      display: inline-flex; align-items: center; gap: 10px;
      padding: 10px 18px 10px 12px;
      background: white; border: 1px solid var(--border);
      border-radius: 999px;
      font-weight: 600; font-size: 14px; color: var(--text);
      cursor: pointer; font-family: inherit;
      transition: border-color .15s, transform .15s, box-shadow .15s;
      flex-shrink: 0;
      &:hover { border-color: var(--indigo-700); transform: translateY(-1px); box-shadow: var(--shadow-sm); }
    }
    .subject-pill--active {
      background: var(--indigo-700); color: white; border-color: var(--indigo-700);
      .subject-pill__icon { background: rgba(255,255,255,.18); color: white; }
    }
    .subject-pill__icon {
      width: 28px; height: 28px; border-radius: 999px;
      background: var(--indigo-50); color: var(--indigo-700);
      display: grid; place-items: center;
      .material-icons-outlined { font-size: 16px; }
    }

    /* ---------- Filter row ---------- */
    .filter-row {
      display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
      margin-bottom: 20px; padding: 16px 20px;
      background: white; border: 1px solid var(--border);
      border-radius: var(--radius-lg);
    }
    .filter-label { font-size: 13px; font-weight: 700; color: var(--text-muted); white-space: nowrap; }
    .filter-chips { display: flex; gap: 8px; flex-wrap: wrap; }
    .filter-chip {
      cursor: pointer; transition: background .12s, color .12s, border-color .12s;
      font-family: inherit; height: 34px;
    }
    .filter-chip--active {
      background: var(--indigo-700); color: white; border-color: var(--indigo-700);
    }
    .price-inputs {
      display: flex; align-items: center; gap: 8px;
    }
    .price-input {
      width: 80px; height: 34px; padding: 0 10px;
      border: 1.5px solid var(--border-strong); border-radius: 8px;
      font: inherit; font-size: 14px; outline: none;
      &:focus { border-color: var(--indigo-700); }
    }

    .results-row { margin-bottom: 20px; }
    .results-count { font-size: 14px; color: var(--text-muted);
      strong { color: var(--indigo-900); }
    }

    /* ---------- Spinner ---------- */
    .sbh-spinner {
      width: 40px; height: 40px; border-radius: 999px;
      border: 3px solid var(--indigo-100);
      border-top-color: var(--indigo-700);
      animation: spin .8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ---------- How it works ---------- */
    .how {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
    }
    .how__step {
      background: white; border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 28px;
      h3 { font-size: 18px; font-weight: 700; margin: 0 0 6px; letter-spacing: -.015em; }
      p  { color: var(--text-muted); font-size: 14.5px; line-height: 1.55; margin: 0; }
    }
    .how__num {
      display: inline-grid; place-items: center;
      width: 44px; height: 44px; border-radius: 12px;
      background: var(--indigo-50); color: var(--indigo-700);
      font-weight: 800; font-size: 18px; margin-bottom: 16px;
    }
    .how__num--coral { background: var(--coral-50); color: var(--coral-700); }

    /* ---------- Footer ---------- */
    .footer {
      background: var(--indigo-900); color: rgba(255,255,255,.7);
      padding: 56px 32px 28px;
    }
    .footer__inner {
      max-width: 1280px; margin: 0 auto;
      display: grid; grid-template-columns: 1.4fr repeat(3, 1fr); gap: 40px;
    }
    .footer__logo {
      display: flex; align-items: center; gap: 10px;
      color: white; font-weight: 800; font-size: 19px;
    }
    .nav__logo-mark {
      width: 32px; height: 32px; border-radius: 9px;
      background: white; color: var(--indigo-700);
      display: grid; place-items: center;
      .material-icons-outlined { font-size: 19px; }
    }
    .footer p { font-size: 14px; line-height: 1.6; margin: 12px 0 16px; max-width: 320px; }
    .footer h4 { color: white; font-size: 14px; font-weight: 700; margin: 0 0 14px; }
    .footer ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
    .footer li { font-size: 14px; color: rgba(255,255,255,.7); cursor: pointer;
      a { color: inherit; text-decoration: none; }
      &:hover { color: white; }
    }
    .footer__bottom {
      max-width: 1280px; margin: 32px auto 0;
      padding-top: 20px; border-top: 1px solid rgba(255,255,255,.1);
      display: flex; justify-content: space-between;
      font-size: 13px; color: rgba(255,255,255,.55);
    }

    /* ---------- Responsive ---------- */
    @media (max-width: 980px) {
      .hero__inner { grid-template-columns: 1fr; padding: 48px 22px 36px; gap: 36px; }
      .hero__visual { height: 320px; }
      .hero__tile--a { width: 180px; height: 220px; }
      .hero__tile--b { width: 200px; height: 150px; }
      .hero__tile--c { width: 170px; height: 150px; }
      .hero__tile--d { width: 180px; height: 180px; }
      .how { grid-template-columns: 1fr; }
      .footer__inner { grid-template-columns: 1fr 1fr; gap: 28px; }
    }
    @media (max-width: 560px) {
      .hero__visual { display: none; }
      .hero__stats { gap: 18px; }
      .footer__inner { grid-template-columns: 1fr; }
      .footer__bottom { flex-direction: column; gap: 8px; }
    }
  `]
})
export class HomeComponent implements OnInit {
  private readonly offersService = inject(StudyOffersService);
  private readonly subjectsService = inject(SubjectsService);
  private readonly favoritesService = inject(FavoritesService);
  readonly auth = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  readonly offers = signal<StudyOfferList[]>([]);
  readonly loading = signal(false);
  readonly activeSubjectId = signal<number | null>(null);
  readonly activeLevel = signal<string>('');
  readonly favoriteIds = signal<Set<number>>(new Set());

  subjects: Subject[] = [];
  query = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  showFilters = false;

  readonly quickTags = ['Bac matematică', 'Informatică C++', 'Engleză IELTS', 'Fizică liceu'];

  readonly levelOptions = [
    { id: '', label: 'Orice' },
    { id: 'Beginner', label: 'Începător' },
    { id: 'Intermediate', label: 'Intermediar' },
    { id: 'Advanced', label: 'Avansat' },
  ];

  readonly filteredOffers = computed(() => {
    const q = this.query.trim().toLowerCase();
    if (!q) return this.offers();
    return this.offers().filter(o =>
      o.title.toLowerCase().includes(q) ||
      o.ownerName.toLowerCase().includes(q) ||
      o.subjectName.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.subjectsService.getAll().subscribe(s => this.subjects = s);
    this.loadOffers();
    if (this.auth.isLoggedIn()) this.loadFavorites();
  }

  onQueryChange(): void { /* filteredOffers is computed */ }

  applySearch(): void { this.reload(); }

  setSubject(id: number | null): void {
    this.activeSubjectId.set(id);
    this.reload();
  }

  reload(): void {
    this.loadOffers();
  }

  toggleFavorite(offerId: number): void {
    if (!this.auth.isLoggedIn()) {
      this.snackBar.open('Autentifică-te pentru a salva favorite', 'Login', { duration: 3000 });
      return;
    }
    const current = this.favoriteIds();
    const isFav = current.has(offerId);
    const action = isFav
      ? this.favoritesService.remove(offerId)
      : this.favoritesService.add(offerId);
    action.subscribe({
      next: () => {
        const next = new Set(current);
        isFav ? next.delete(offerId) : next.add(offerId);
        this.favoriteIds.set(next);
        this.snackBar.open(isFav ? 'Eliminat din favorite' : 'Adăugat la favorite', 'OK', { duration: 2000 });
      },
      error: err => this.snackBar.open(err.error?.message ?? 'Eroare', 'OK', { duration: 3000 })
    });
  }

  subjectIcon(name: string): string {
    return SUBJECT_ICONS[name] ?? 'school';
  }

  private loadOffers(): void {
    this.loading.set(true);
    this.offersService.getAll({
      subjectId: this.activeSubjectId() ?? undefined,
      minPrice: this.minPrice ?? undefined,
      maxPrice: this.maxPrice ?? undefined,
      isActive: true
    }).subscribe({
      next: data => { this.offers.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  private loadFavorites(): void {
    this.favoritesService.getAll().subscribe(favs => {
      this.favoriteIds.set(new Set(favs.map(f => f.offerId)));
    });
  }
}
