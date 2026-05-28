import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { StudyOffersService } from '../../../core/services/study-offers.service';
import { SubjectsService } from '../../../core/services/subjects.service';
import { Subject } from '../../../core/models/subject.models';

@Component({
  selector: 'app-offer-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MatSnackBarModule, MatSlideToggleModule],
  template: `
    <div class="form-page">
      <div class="form-page__header">
        <button class="sbh-icon-btn" (click)="goBack()" title="Înapoi">
          <span class="material-icons-outlined">arrow_back</span>
        </button>
        <div>
          <h1>{{ isEditMode ? 'Editează oferta' : 'Publică ofertă nouă' }}</h1>
          <p>{{ isEditMode ? 'Modifică detaliile ofertei tale.' : 'Completează informațiile pentru a publica o ofertă de meditații.' }}</p>
        </div>
      </div>

      @if (loadingOffer) {
        <div class="spinner-container"><div class="sbh-spinner"></div></div>
      } @else {
        <div class="form-card">
          <form [formGroup]="form" (ngSubmit)="submit()">
            <!-- Title -->
            <div class="sbh-field">
              <label class="sbh-field__label">Titlu *</label>
              <div class="sbh-field__input" [class.field-error]="fieldInvalid('title')">
                <span class="material-icons-outlined">title</span>
                <input type="text" formControlName="title"
                       placeholder="ex: Meditații matematică clasa a 12-a">
              </div>
              @if (fieldInvalid('title')) {
                <div class="sbh-field__error">
                  <span class="material-icons-outlined">error_outline</span>
                  Titlul este obligatoriu (minim 3 caractere)
                </div>
              }
            </div>

            <!-- Description -->
            <div class="sbh-field">
              <label class="sbh-field__label">Descriere *</label>
              <div class="sbh-field__input field-textarea" [class.field-error]="fieldInvalid('description')">
                <textarea formControlName="description" rows="5"
                          placeholder="Descrie ce oferi, metodele tale, disponibilitatea..."></textarea>
              </div>
              @if (fieldInvalid('description')) {
                <div class="sbh-field__error">
                  <span class="material-icons-outlined">error_outline</span>
                  Descrierea este obligatorie (minim 10 caractere)
                </div>
              }
            </div>

            <!-- Subject + Level -->
            <div class="form-row">
              <div class="sbh-field">
                <label class="sbh-field__label">Materie *</label>
                <div class="sbh-select-wrap">
                  <select formControlName="subjectId" class="sbh-select">
                    <option [value]="null" disabled>Selectează materia</option>
                    @for (s of subjects; track s.id) {
                      <option [value]="s.id">{{ s.name }}</option>
                    }
                  </select>
                  <span class="material-icons-outlined sbh-select-arrow">expand_more</span>
                </div>
                @if (fieldInvalid('subjectId')) {
                  <div class="sbh-field__error">
                    <span class="material-icons-outlined">error_outline</span> Obligatoriu
                  </div>
                }
              </div>

              <div class="sbh-field">
                <label class="sbh-field__label">Nivel *</label>
                <div class="sbh-select-wrap">
                  <select formControlName="level" class="sbh-select">
                    <option [value]="null" disabled>Selectează nivelul</option>
                    <option [value]="0">Începător</option>
                    <option [value]="1">Intermediar</option>
                    <option [value]="2">Avansat</option>
                  </select>
                  <span class="material-icons-outlined sbh-select-arrow">expand_more</span>
                </div>
                @if (fieldInvalid('level')) {
                  <div class="sbh-field__error">
                    <span class="material-icons-outlined">error_outline</span> Obligatoriu
                  </div>
                }
              </div>
            </div>

            <!-- Session type + Price -->
            <div class="form-row">
              <div class="sbh-field">
                <label class="sbh-field__label">Tip sesiune *</label>
                <div class="sbh-select-wrap">
                  <select formControlName="sessionType" class="sbh-select">
                    <option [value]="null" disabled>Selectează tipul</option>
                    <option [value]="0">Online</option>
                    <option [value]="1">Față în față</option>
                    <option [value]="2">Hibrid</option>
                  </select>
                  <span class="material-icons-outlined sbh-select-arrow">expand_more</span>
                </div>
              </div>

              <div class="sbh-field">
                <label class="sbh-field__label">Preț (RON / sesiune) *</label>
                <div class="sbh-field__input" [class.field-error]="fieldInvalid('price')">
                  <span class="material-icons-outlined">payments</span>
                  <input type="number" formControlName="price" min="0" placeholder="ex: 80">
                </div>
                @if (fieldInvalid('price')) {
                  <div class="sbh-field__error">
                    <span class="material-icons-outlined">error_outline</span>
                    Prețul este obligatoriu
                  </div>
                }
              </div>
            </div>

            <!-- Location -->
            <div class="sbh-field">
              <label class="sbh-field__label">Locație <span style="color:var(--text-soft);font-weight:400">(opțional)</span></label>
              <div class="sbh-field__input">
                <span class="material-icons-outlined">location_on</span>
                <input type="text" formControlName="location" placeholder="ex: Sector 1, București">
              </div>
            </div>

            @if (isEditMode) {
              <div class="active-toggle">
                <mat-slide-toggle formControlName="isActive" color="primary">
                  Ofertă activă
                </mat-slide-toggle>
              </div>
            }

            <div class="form-actions">
              <button type="submit" class="sbh-btn sbh-btn--raised sbh-btn--lg"
                      [disabled]="form.invalid || saving">
                @if (saving) {
                  <span class="sbh-spin-sm"></span>
                } @else {
                  {{ isEditMode ? 'Salvează modificările' : 'Publică oferta' }}
                }
              </button>
              <button type="button" class="sbh-btn sbh-btn--flat" (click)="goBack()">Anulează</button>
            </div>
          </form>
        </div>
      }
    </div>
  `,
  styles: [`
    .form-page {
      max-width: 720px; margin: 0 auto; padding: 32px 32px 80px;
    }
    .form-page__header {
      display: flex; align-items: flex-start; gap: 16px; margin-bottom: 32px;
      h1 { font-size: 28px; font-weight: 800; letter-spacing: -.025em; color: var(--indigo-900); margin: 0 0 4px; }
      p  { color: var(--text-muted); font-size: 15px; margin: 0; }
    }
    .form-card {
      background: white; border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 32px;
      box-shadow: var(--shadow-sm);
    }
    .form-row {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
    }
    .sbh-select-wrap {
      position: relative;
    }
    .sbh-select {
      width: 100%; height: 52px; padding: 0 40px 0 16px;
      border: 1.5px solid var(--border-strong); border-radius: 12px;
      background: white; font: inherit; font-size: 15px; color: var(--text);
      appearance: none; outline: none; cursor: pointer;
      transition: border-color .15s, box-shadow .15s;
      &:focus { border-color: var(--indigo-700); box-shadow: 0 0 0 4px rgba(26,31,94,.08); }
    }
    .sbh-select-arrow {
      position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
      font-size: 20px; color: var(--text-soft); pointer-events: none;
    }
    .field-textarea {
      height: auto !important; padding: 14px 16px !important;
      align-items: flex-start !important;
      textarea {
        flex: 1; border: 0; outline: 0; background: transparent;
        font: inherit; font-size: 15px; color: var(--text);
        resize: vertical; min-height: 80px;
        &::placeholder { color: var(--text-soft); }
      }
    }
    .field-error { border-color: #d94343 !important; }
    .active-toggle { margin-bottom: 24px; }
    .form-actions {
      display: flex; gap: 12px; align-items: center; margin-top: 32px;
    }
    .sbh-spinner {
      width: 40px; height: 40px; border-radius: 999px;
      border: 3px solid var(--indigo-100); border-top-color: var(--indigo-700);
      animation: spin .8s linear infinite;
    }
    .sbh-spin-sm {
      width: 20px; height: 20px; border-radius: 999px;
      border: 2.5px solid rgba(255,255,255,.3); border-top-color: white;
      animation: spin .8s linear infinite; display: inline-block;
    }
    .spinner-container { display: flex; justify-content: center; padding: 60px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 600px) {
      .form-page { padding: 20px 18px 60px; }
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class OfferFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly offersService = inject(StudyOffersService);
  private readonly subjectsService = inject(SubjectsService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  subjects: Subject[] = [];
  isEditMode = false;
  offerId: number | null = null;
  loadingOffer = false;
  saving = false;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    subjectId: [null as number | null, Validators.required],
    level: [null as number | null, Validators.required],
    sessionType: [null as number | null, Validators.required],
    price: [null as number | null, [Validators.required, Validators.min(0)]],
    location: [''],
    isActive: [true]
  });

  ngOnInit(): void {
    this.subjectsService.getAll().subscribe(s => this.subjects = s);
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.offerId = Number(id);
      this.loadOffer();
    }
  }

  fieldInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c?.touched && c.invalid);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const { title, description, subjectId, level, sessionType, price, location, isActive } = this.form.value;

    if (this.isEditMode && this.offerId) {
      this.offersService.update(this.offerId, {
        title: title!, description: description!,
        subjectId: subjectId!, level: level!, sessionType: sessionType!,
        price: price!, location: location || undefined, isActive: isActive!
      }).subscribe({
        next: () => {
          this.snackBar.open('Ofertă actualizată!', 'OK', { duration: 3000 });
          this.router.navigate(['/offers', this.offerId]);
        },
        error: err => { this.saving = false; this.snackBar.open(err.error?.message ?? 'Eroare', 'OK', { duration: 4000 }); }
      });
    } else {
      this.offersService.create({
        title: title!, description: description!,
        subjectId: subjectId!, level: level!, sessionType: sessionType!,
        price: price!, location: location || undefined
      }).subscribe({
        next: offer => {
          this.snackBar.open('Ofertă publicată!', 'OK', { duration: 3000 });
          this.router.navigate(['/offers', offer.id]);
        },
        error: err => { this.saving = false; this.snackBar.open(err.error?.message ?? 'Eroare', 'OK', { duration: 4000 }); }
      });
    }
  }

  goBack(): void {
    if (this.isEditMode && this.offerId) {
      this.router.navigate(['/offers', this.offerId]);
    } else {
      this.router.navigate(['/dashboard/my-offers']);
    }
  }

  private loadOffer(): void {
    this.loadingOffer = true;
    this.offersService.getById(this.offerId!).subscribe({
      next: offer => {
        const levelMap: Record<string, number> = { Beginner: 0, Intermediate: 1, Advanced: 2 };
        const sessionMap: Record<string, number> = { Online: 0, OnSite: 1, Hybrid: 2 };
        this.form.patchValue({
          title: offer.title,
          description: offer.description,
          level: levelMap[offer.level] ?? 0,
          sessionType: sessionMap[offer.sessionType] ?? 0,
          price: offer.price,
          location: offer.location ?? '',
          isActive: offer.isActive
        });
        this.loadingOffer = false;
        this.subjectsService.getAll().subscribe(subjects => {
          this.subjects = subjects;
          const subjectId = subjects.find(s => s.name === offer.subjectName)?.id ?? null;
          this.form.patchValue({ subjectId });
        });
      },
      error: () => { this.loadingOffer = false; this.router.navigate(['/']); }
    });
  }
}
