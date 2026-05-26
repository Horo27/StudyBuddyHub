export type RequestStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled';

export interface StudyRequest {
  id: number;
  message?: string;
  status: RequestStatus;
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
