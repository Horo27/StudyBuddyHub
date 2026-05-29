import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'offers/create',
    loadComponent: () => import('./features/offers/offer-form/offer-form.component').then(m => m.OfferFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'offers/:id/edit',
    loadComponent: () => import('./features/offers/offer-form/offer-form.component').then(m => m.OfferFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'offers/:id',
    loadComponent: () => import('./features/offers/offer-details/offer-details.component').then(m => m.OfferDetailsComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard/my-offers',
    loadComponent: () => import('./features/dashboard/my-offers/my-offers.component').then(m => m.MyOffersComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard/my-requests',
    loadComponent: () => import('./features/dashboard/my-requests/my-requests.component').then(m => m.MyRequestsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'payment/success',
    loadComponent: () => import('./features/payment/payment-success.component').then(m => m.PaymentSuccessComponent)
  },
  {
    path: 'payment/cancel',
    loadComponent: () => import('./features/payment/payment-cancel.component').then(m => m.PaymentCancelComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
