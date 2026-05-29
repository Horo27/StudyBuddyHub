import { Injectable, inject, OnDestroy } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppNotification } from '../models/notification.models';
import { AuthService } from './auth.service';

const MAX_NOTIFICATIONS = 20;

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private readonly authService = inject(AuthService);
  private connection: signalR.HubConnection | null = null;

  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  async connect(): Promise<void> {
    if (this.connection) {
      await this.disconnect();
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.hubUrl}/notifications`, {
        accessTokenFactory: () => this.authService.getToken() ?? ''
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.connection.on('ReceiveNotification', (data: Omit<AppNotification, 'id' | 'read'>) => {
      const notification: AppNotification = {
        ...data,
        id: crypto.randomUUID(),
        read: false
      };
      const current = this.notificationsSubject.value;
      const updated = [notification, ...current].slice(0, MAX_NOTIFICATIONS);
      this.notificationsSubject.next(updated);
      this.unreadCountSubject.next(updated.filter(n => !n.read).length);
    });

    this.connection.start().catch(err => console.error('SignalR connection error:', err));
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
    this.notificationsSubject.next([]);
    this.unreadCountSubject.next(0);
  }

  markAllRead(): void {
    const updated = this.notificationsSubject.value.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(updated);
    this.unreadCountSubject.next(0);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
