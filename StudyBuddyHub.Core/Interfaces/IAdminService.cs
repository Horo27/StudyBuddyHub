using StudyBuddyHub.Core.Entities;

namespace StudyBuddyHub.Core.Interfaces
{
    public interface IAdminService
    {
        Task<(int TotalUsers, int ActiveOffers, int PendingRequests, int TotalOffers, int TotalRequests)> GetStatsAsync();
        Task DeleteOfferAsync(int offerId);
        Task UpdateUserRoleAsync(string userId, string role);
        Task<IEnumerable<(ApplicationUser User, IList<string> Roles)>> GetAllUsersAsync();
    }
}
