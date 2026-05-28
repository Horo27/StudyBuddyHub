export interface AppNotification {
  id: string;
  type: 'request_received' | 'request_accepted' | 'request_rejected' | 'request_cancelled';
  message: string;
  payload?: Record<string, unknown>;
  createdAt: string;
  read: boolean;
}
