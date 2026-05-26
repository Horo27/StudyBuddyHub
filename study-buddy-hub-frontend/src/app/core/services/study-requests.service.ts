import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StudyRequest, StudyRequestCreate } from '../models/study-request.models';

@Injectable({ providedIn: 'root' })
export class StudyRequestsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/studyrequests`;

  getSent(): Observable<StudyRequest[]> {
    return this.http.get<StudyRequest[]>(`${this.base}/sent`);
  }

  getReceived(): Observable<StudyRequest[]> {
    return this.http.get<StudyRequest[]>(`${this.base}/received`);
  }

  create(dto: StudyRequestCreate): Observable<StudyRequest> {
    return this.http.post<StudyRequest>(this.base, dto);
  }

  accept(id: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/accept`, {});
  }

  reject(id: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/reject`, {});
  }

  cancel(id: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/cancel`, {});
  }
}
