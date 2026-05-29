using System.Threading.Tasks;

namespace StudyBuddyHub.Core.Interfaces
{
    public interface IPaymentService
    {
        Task<string> CreateCheckoutSessionAsync(int requestId, string studentId);
        Task HandleWebhookAsync(string payload, string stripeSignature);
    }
}
