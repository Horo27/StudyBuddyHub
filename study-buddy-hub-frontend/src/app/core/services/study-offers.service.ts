import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  OfferFilters,
  StudyOfferCreate,
  StudyOfferDetails,
  StudyOfferList,
  StudyOfferUpdate
} from '../models/study-offer.models';

@Injectable({ providedIn: 'root' })
export class StudyOffersService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/studyoffers`;

  getAll(filters?: OfferFilters): Observable<StudyOfferList[]> {
    let params = new HttpParams();
    if (filters?.subjectId) params = params.set('subjectId', filters.subjectId);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.minPrice != null) params = params.set('minPrice', filters.minPrice);
    if (filters?.maxPrice != null) params = params.set('maxPrice', filters.maxPrice);
    if (filters?.isActive != null) params = params.set('isActive', filters.isActive);
    return this.http.get<StudyOfferList[]>(this.base, { params });
  }

  getById(id: number): Observable<StudyOfferDetails> {
    return this.http.get<StudyOfferDetails>(`${this.base}/${id}`);
  }

  getMine(): Observable<StudyOfferList[]> {
    return this.http.get<StudyOfferList[]>(`${this.base}/mine`);
  }

  create(dto: StudyOfferCreate): Observable<StudyOfferDetails> {
    return this.http.post<StudyOfferDetails>(this.base, dto);
  }

  update(id: number, dto: StudyOfferUpdate): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
