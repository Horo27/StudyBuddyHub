import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Înregistrare</mat-card-title>
          <mat-card-subtitle>Creează un cont nou pe StudyBuddyHub</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="row">
              <mat-form-field appearance="outline">
                <mat-label>Prenume</mat-label>
                <input matInput formControlName="firstName">
                @if (form.get('firstName')?.touched && form.get('firstName')?.hasError('required')) {
                  <mat-error>Prenumele este obligatoriu</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Nume</mat-label>
                <input matInput formControlName="lastName">
                @if (form.get('lastName')?.touched && form.get('lastName')?.hasError('required')) {
                  <mat-error>Numele este obligatoriu</mat-error>
                }
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email">
              <mat-icon matSuffix>email</mat-icon>
              @if (form.get('email')?.touched && form.get('email')?.hasError('required')) {
                <mat-error>Email-ul este obligatoriu</mat-error>
              }
              @if (form.get('email')?.touched && form.get('email')?.hasError('email')) {
                <mat-error>Email invalid</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Parolă</mat-label>
              <input matInput [type]="showPassword ? 'text' : 'password'" formControlName="password" autocomplete="new-password">
              <button type="button" mat-icon-button matSuffix (click)="showPassword = !showPassword">
                <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('password')?.touched && form.get('password')?.hasError('required')) {
                <mat-error>Parola este obligatorie</mat-error>
              }
              @if (form.get('password')?.touched && form.get('password')?.hasError('minlength')) {
                <mat-error>Parola trebuie să aibă minim 6 caractere</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Facultate (opțional)</mat-label>
              <input matInput formControlName="faculty">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Universitate (opțional)</mat-label>
              <input matInput formControlName="university">
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" class="full-width submit-btn"
                    [disabled]="form.invalid || loading">
              @if (loading) {
                <mat-progress-spinner diameter="20" mode="indeterminate"></mat-progress-spinner>
              } @else {
                Creează cont
              }
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions>
          <p class="text-center">
            Ai deja cont? <a routerLink="/login">Autentifică-te</a>
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; justify-content: center; padding: 32px 16px; }
    .auth-card { width: 100%; max-width: 480px; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .submit-btn { margin-top: 8px; height: 48px; }
    .text-center { text-align: center; width: 100%; }
    mat-card-content { padding-top: 16px; }
  `]
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  showPassword = false;
  loading = false;

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    faculty: [''],
    university: ['']
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const { email, password, firstName, lastName, faculty, university } = this.form.value;
    this.auth.register({
      email: email!,
      password: password!,
      firstName: firstName!,
      lastName: lastName!,
      faculty: faculty || undefined,
      university: university || undefined
    }).subscribe({
      next: () => this.router.navigate(['/']),
      error: err => {
        this.loading = false;
        const errors = err.error?.errors;
        const msg = errors
          ? Object.values(errors).flat().join(' ')
          : (err.error?.message ?? 'Înregistrarea a eșuat');
        this.snackBar.open(msg, 'OK', { duration: 5000 });
      }
    });
  }
}
