import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/payments`;

  createCheckout(requestId: number): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(`${this.base}/create-checkout`, { requestId });
  }
}
