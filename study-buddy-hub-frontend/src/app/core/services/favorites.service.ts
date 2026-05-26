import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FavoriteOffer {
  favoriteId: number;
  offerId: number;
  offerTitle: string;
  subjectName: string;
  ownerName: string;
  price: number;
}

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/favorites`;

  getAll(): Observable<FavoriteOffer[]> {
    return this.http.get<FavoriteOffer[]>(this.base);
  }

  add(offerId: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${offerId}`, {});
  }

  remove(offerId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${offerId}`);
  }
}
