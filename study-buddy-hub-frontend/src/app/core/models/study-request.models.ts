export type RequestStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled';
export type PaymentStatus = 'Unpaid' | 'Paid' | 'Refunded';

export interface StudyRequest {
  id: number;
  message?: string;
  status: RequestStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  offerId: number;
  offerTitle: string;
  offerSubject: string;
  requesterId: string;
  requesterName: string;
}

export interface StudyRequestCreate {
  offerId: number;
  message?: string;
}
