using System.Threading.Tasks;

namespace StudyBuddyHub.Core.Interfaces
{
    public interface INotificationService
    {
        Task NotifyUserAsync(string userId, string type, string message, object? payload = null);
    }
}
