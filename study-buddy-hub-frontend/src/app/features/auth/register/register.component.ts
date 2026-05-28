import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { avatarStyle, initials } from '../../../shared/utils/avatar.utils';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MatSnackBarModule],
  template: `
    <div class="auth">
      <!-- LEFT VISUAL -->
      <div class="auth__visual">
        <div class="auth__visual-logo">
          <span class="nav__logo-mark">
            <span class="material-icons-outlined">auto_stories</span>
          </span>
          StudyBuddy Hub
        </div>

        <div class="auth__quote">
          <h2 class="auth__quote-lead">Începe să <em>înveți</em> cu tutori reali.</h2>
          <p class="auth__quote-body">
            Alătură-te comunității cu peste 18.000 de elevi și 2.400 de tutori verificați din toată România.
          </p>
          <div class="auth__quote-by">
            <span class="sbh-avatar sbh-avatar--md" [style.background]="testimonialAvatar">
              {{ testimonialInitials }}
            </span>
            <div>
              <div class="auth__quote-by-name">Andreea, elevă liceu</div>
              <div class="auth__quote-by-meta">"În două luni am trecut de la 6 la 9 la matematică."</div>
            </div>
          </div>
        </div>

        <div class="auth__visual-stats">
          <div><div class="num">2.4K+</div><div class="lbl">tutori verificați</div></div>
          <div><div class="num">18K+</div><div class="lbl">elevi activi</div></div>
          <div><div class="num">4.9★</div><div class="lbl">rating mediu</div></div>
        </div>
      </div>

      <!-- RIGHT FORM -->
      <div class="auth__form">
        <div class="auth__card">
          <!-- Toggle -->
          <div class="auth__toggle">
            <button routerLink="/login">Autentificare</button>
            <button [class.auth__toggle--active]="true">Creează cont</button>
          </div>

          <h1 class="auth__h1">Creează un cont</h1>
          <p class="auth__sub">Câteva detalii și ești gata să începi.</p>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <!-- Name row -->
            <div class="name-row">
              <div class="sbh-field">
                <label class="sbh-field__label">Prenume</label>
                <div class="sbh-field__input">
                  <input type="text" formControlName="firstName" placeholder="ex. Andrei">
                </div>
                @if (fieldInvalid('firstName')) {
                  <div class="sbh-field__error">
                    <span class="material-icons-outlined">error_outline</span> Obligatoriu
                  </div>
                }
              </div>
              <div class="sbh-field">
                <label class="sbh-field__label">Nume</label>
                <div class="sbh-field__input">
                  <input type="text" formControlName="lastName" placeholder="ex. Marin">
                </div>
                @if (fieldInvalid('lastName')) {
                  <div class="sbh-field__error">
                    <span class="material-icons-outlined">error_outline</span> Obligatoriu
                  </div>
                }
              </div>
            </div>

            <div class="sbh-field">
              <label class="sbh-field__label">Email</label>
              <div class="sbh-field__input">
                <span class="material-icons-outlined">mail</span>
                <input type="email" formControlName="email"
                       placeholder="nume@exemplu.ro" autocomplete="email">
              </div>
              @if (fieldInvalid('email')) {
                <div class="sbh-field__error">
                  <span class="material-icons-outlined">error_outline</span> Email invalid
                </div>
              }
            </div>

            <div class="sbh-field">
              <label class="sbh-field__label">Parolă</label>
              <div class="sbh-field__input">
                <span class="material-icons-outlined">lock</span>
                <input [type]="showPw ? 'text' : 'password'" formControlName="password"
                       placeholder="Cel puțin 6 caractere" autocomplete="new-password">
                <span class="material-icons-outlined toggle-eye"
                      (click)="showPw = !showPw">
                  {{ showPw ? 'visibility' : 'visibility_off' }}
                </span>
              </div>
              @if (fieldInvalid('password')) {
                <div class="sbh-field__error">
                  <span class="material-icons-outlined">error_outline</span>
                  Minim 6 caractere
                </div>
              }
            </div>

            <div class="sbh-field">
              <label class="sbh-field__label">Facultate <span style="color:var(--text-soft);font-weight:400">(opțional)</span></label>
              <div class="sbh-field__input">
                <span class="material-icons-outlined">school</span>
                <input type="text" formControlName="faculty" placeholder="ex. Informatică">
              </div>
            </div>

            <div class="sbh-field">
              <label class="sbh-field__label">Universitate <span style="color:var(--text-soft);font-weight:400">(opțional)</span></label>
              <div class="sbh-field__input">
                <span class="material-icons-outlined">account_balance</span>
                <input type="text" formControlName="university" placeholder="ex. Universitatea din București">
              </div>
            </div>

            @if (error) {
              <div class="sbh-field__error" style="margin-bottom:14px">
                <span class="material-icons-outlined">error_outline</span>
                {{ error }}
              </div>
            }

            <button type="submit" class="sbh-btn sbh-btn--raised sbh-btn--lg sbh-btn--full"
                    [disabled]="form.invalid || loading">
              @if (loading) {
                <span class="auth-spinner"></span>
              } @else {
                Creează contul
              }
            </button>
          </form>

          <div class="auth__foot">
            Ai deja un cont? <a routerLink="/login">Conectează-te</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .auth {
      min-height: calc(100vh - 65px);
      display: grid; grid-template-columns: 1fr 1fr;
    }
    .auth__visual {
      position: relative;
      background:
        radial-gradient(800px 600px at 30% 20%, rgba(255,107,53,.28), transparent 60%),
        radial-gradient(700px 500px at 80% 90%, rgba(255,255,255,.1), transparent 50%),
        linear-gradient(135deg, var(--indigo-700) 0%, var(--indigo-900) 100%);
      color: white; padding: 56px;
      display: flex; flex-direction: column; justify-content: space-between;
      overflow: hidden;
      &::before {
        content: ''; position: absolute; inset: 0;
        background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,.08) 1px, transparent 0);
        background-size: 28px 28px; opacity: .5; pointer-events: none;
      }
    }
    .nav__logo-mark {
      width: 32px; height: 32px; border-radius: 9px;
      background: white; color: var(--indigo-700);
      display: grid; place-items: center; flex-shrink: 0;
      .material-icons-outlined { font-size: 19px; }
    }
    .auth__visual-logo {
      display: flex; align-items: center; gap: 10px;
      font-weight: 800; font-size: 19px;
      z-index: 1; position: relative;
    }
    .auth__quote { z-index: 1; position: relative; max-width: 480px; }
    .auth__quote-lead {
      font-size: clamp(28px, 3vw, 40px);
      font-weight: 800; line-height: 1.1; letter-spacing: -.025em; margin: 0 0 16px;
      em {
        font-style: normal;
        background: linear-gradient(90deg, var(--coral-500), #ffd29a);
        -webkit-background-clip: text; background-clip: text; color: transparent;
      }
    }
    .auth__quote-body { font-size: 16px; line-height: 1.6; color: rgba(255,255,255,.82); margin: 0; }
    .auth__quote-by { margin-top: 22px; display: flex; align-items: center; gap: 12px; }
    .auth__quote-by-name { font-weight: 700; font-size: 14px; }
    .auth__quote-by-meta { font-size: 12.5px; color: rgba(255,255,255,.65); }
    .auth__visual-stats {
      z-index: 1; position: relative;
      display: flex; gap: 36px;
      padding-top: 26px; border-top: 1px solid rgba(255,255,255,.16);
      .num { font-size: 26px; font-weight: 800; letter-spacing: -.02em; }
      .lbl { font-size: 12.5px; color: rgba(255,255,255,.7); margin-top: 4px; }
    }
    .auth__form {
      display: grid; place-items: center;
      padding: 32px 56px; background: white;
      overflow-y: auto;
    }
    .auth__card { width: 100%; max-width: 420px; padding: 24px 0; }
    .auth__toggle {
      display: inline-flex; padding: 4px;
      background: var(--indigo-50); border-radius: 999px; margin-bottom: 26px;
      button {
        border: 0; background: transparent;
        height: 36px; padding: 0 18px; border-radius: 999px;
        font-weight: 600; font-size: 13.5px; color: var(--text-muted);
        cursor: pointer; font-family: inherit; transition: background .15s, color .15s;
      }
    }
    .auth__toggle--active { background: white !important; color: var(--indigo-700) !important; box-shadow: var(--shadow-sm); }
    .auth__h1 { font-size: 30px; font-weight: 800; letter-spacing: -.025em; margin: 0 0 6px; }
    .auth__sub { color: var(--text-muted); margin: 0 0 28px; font-size: 15px; }
    .auth__foot {
      margin-top: 22px; font-size: 14px; color: var(--text-muted); text-align: center;
      a { color: var(--indigo-700); font-weight: 700;
        &:hover { text-decoration: underline; }
      }
    }
    .name-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .toggle-eye { cursor: pointer; color: var(--text-soft); font-size: 20px;
      &:hover { color: var(--indigo-700); }
    }
    .auth-spinner {
      width: 20px; height: 20px; border-radius: 999px;
      border: 2.5px solid rgba(255,255,255,.3); border-top-color: white;
      animation: spin .8s linear infinite; display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 980px) {
      .auth { grid-template-columns: 1fr; }
      .auth__visual { display: none; }
      .auth__form { padding: 32px 22px; }
    }
  `]
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  showPw = false;
  loading = false;
  error = '';

  readonly testimonialAvatar = avatarStyle('Andreea Tudor');
  readonly testimonialInitials = initials('Andreea Tudor');

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    faculty: [''],
    university: ['']
  });

  fieldInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c?.touched && c.invalid);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';
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
        this.error = errors
          ? Object.values(errors).flat().join(' ')
          : (err.error?.message ?? 'Înregistrarea a eșuat');
      }
    });
  }
}
