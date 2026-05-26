import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { StudyOffersService } from '../../../core/services/study-offers.service';
import { SubjectsService } from '../../../core/services/subjects.service';
import { Subject } from '../../../core/models/subject.models';

@Component({
  selector: 'app-offer-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatIconModule
  ],
  template: `
    <div class="form-container">
      <div class="page-header">
        <button mat-icon-button (click)="goBack()"><mat-icon>arrow_back</mat-icon></button>
        <h1>{{ isEditMode ? 'Editează oferta' : 'Publică ofertă nouă' }}</h1>
      </div>

      @if (loadingOffer) {
        <div class="spinner-container"><mat-progress-spinner mode="indeterminate" diameter="48"></mat-progress-spinner></div>
      } @else {
        <mat-card>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="submit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Titlu</mat-label>
                <input matInput formControlName="title" placeholder="ex: Meditații matematică clasa a 12-a">
                @if (form.get('title')?.touched && form.get('title')?.hasError('required')) {
                  <mat-error>Titlul este obligatoriu</mat-error>
                }
                @if (form.get('title')?.touched && form.get('title')?.hasError('minlength')) {
                  <mat-error>Titlul trebuie să aibă minim 3 caractere</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Descriere</mat-label>
                <textarea matInput formControlName="description" rows="4"
                          placeholder="Descrie ce oferi, metodele tale, disponibilitatea..."></textarea>
                @if (form.get('description')?.touched && form.get('description')?.hasError('required')) {
                  <mat-error>Descrierea este obligatorie</mat-error>
                }
                @if (form.get('description')?.touched && form.get('description')?.hasError('minlength')) {
                  <mat-error>Descrierea trebuie să aibă minim 10 caractere</mat-error>
                }
              </mat-form-field>

              <div class="row">
                <mat-form-field appearance="outline">
                  <mat-label>Materie</mat-label>
                  <mat-select formControlName="subjectId">
                    @for (s of subjects; track s.id) {
                      <mat-option [value]="s.id">{{ s.name }}</mat-option>
                    }
                  </mat-select>
                  @if (form.get('subjectId')?.touched && form.get('subjectId')?.hasError('required')) {
                    <mat-error>Selectează o materie</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Nivel</mat-label>
                  <mat-select formControlName="level">
                    <mat-option [value]="0">Începător</mat-option>
                    <mat-option [value]="1">Intermediar</mat-option>
                    <mat-option [value]="2">Avansat</mat-option>
                  </mat-select>
                  @if (form.get('level')?.touched && form.get('level')?.hasError('required')) {
                    <mat-error>Selectează nivelul</mat-error>
                  }
                </mat-form-field>
              </div>

              <div class="row">
                <mat-form-field appearance="outline">
                  <mat-label>Tip sesiune</mat-label>
                  <mat-select formControlName="sessionType">
                    <mat-option [value]="0">Online</mat-option>
                    <mat-option [value]="1">Față în față</mat-option>
                    <mat-option [value]="2">Hibrid</mat-option>
                  </mat-select>
                  @if (form.get('sessionType')?.touched && form.get('sessionType')?.hasError('required')) {
                    <mat-error>Selectează tipul sesiunii</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Preț (RON / sesiune)</mat-label>
                  <input matInput type="number" formControlName="price" min="0">
                  <mat-icon matSuffix>payments</mat-icon>
                  @if (form.get('price')?.touched && form.get('price')?.hasError('required')) {
                    <mat-error>Prețul este obligatoriu</mat-error>
                  }
                  @if (form.get('price')?.touched && form.get('price')?.hasError('min')) {
                    <mat-error>Prețul nu poate fi negativ</mat-error>
                  }
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Locație (opțional)</mat-label>
                <input matInput formControlName="location" placeholder="ex: Sector 1, București">
                <mat-icon matSuffix>location_on</mat-icon>
              </mat-form-field>

              @if (isEditMode) {
                <mat-slide-toggle formControlName="isActive" color="primary">
                  Ofertă activă
                </mat-slide-toggle>
              }

              <div class="form-actions">
                <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving">
                  @if (saving) {
                    <mat-progress-spinner diameter="20" mode="indeterminate"></mat-progress-spinner>
                  } @else {
                    {{ isEditMode ? 'Salvează modificările' : 'Publică oferta' }}
                  }
                </button>
                <button mat-button type="button" (click)="goBack()">Anulează</button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .form-container { max-width: 720px; margin: 0 auto; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-actions { display: flex; gap: 12px; margin-top: 24px; align-items: center; }
    mat-slide-toggle { margin-bottom: 16px; }
    @media (max-width: 600px) { .row { grid-template-columns: 1fr; } }
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
          subjectId: this.subjects.find(s => s.name === offer.subjectName)?.id ?? null,
          level: levelMap[offer.level] ?? 0,
          sessionType: sessionMap[offer.sessionType] ?? 0,
          price: offer.price,
          location: offer.location ?? '',
          isActive: offer.isActive
        });
        this.loadingOffer = false;
        // Re-patch subjectId after subjects might have loaded
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
