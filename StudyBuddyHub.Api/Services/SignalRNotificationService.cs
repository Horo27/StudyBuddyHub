using Microsoft.AspNetCore.SignalR;
using StudyBuddyHub.Api.Hubs;
using StudyBuddyHub.Core.Interfaces;
using System;
using System.Threading.Tasks;

namespace StudyBuddyHub.Api.Services
{
    public class SignalRNotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;

        public SignalRNotificationService(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task NotifyUserAsync(string userId, string type, string message, object? payload = null)
        {
            await _hubContext.Clients.Group(userId).SendAsync("ReceiveNotification", new
            {
                type,
                message,
                payload,
                createdAt = DateTime.UtcNow
            });
        }
    }
}
