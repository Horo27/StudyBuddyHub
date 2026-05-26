using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using StudyBuddyHub.Core.Entities;
using StudyBuddyHub.Core.Interfaces;
using StudyBuddyHub.Infrastructure.Data;

namespace StudyBuddyHub.Infrastructure.Services
{
    public class AdminService : IAdminService
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<AdminService> _logger;

        public AdminService(ApplicationDbContext context, UserManager<ApplicationUser> userManager, ILogger<AdminService> logger)
        {
            _context = context;
            _userManager = userManager;
            _logger = logger;
        }

        public async Task<(int TotalUsers, int ActiveOffers, int PendingRequests, int TotalOffers, int TotalRequests)> GetStatsAsync()
        {
            var totalUsers = await _userManager.Users.CountAsync();
            var activeOffers = await _context.StudyOffers.CountAsync(o => o.IsActive);
            var pendingRequests = await _context.StudyRequests.CountAsync(r => r.Status == Core.Enums.RequestStatus.Pending);
            var totalOffers = await _context.StudyOffers.CountAsync();
            var totalRequests = await _context.StudyRequests.CountAsync();

            return (totalUsers, activeOffers, pendingRequests, totalOffers, totalRequests);
        }

        public async Task DeleteOfferAsync(int offerId)
        {
            var offer = await _context.StudyOffers.FindAsync(offerId);
            if (offer == null)
            {
                throw new KeyNotFoundException($"Offer with id {offerId} not found.");
            }

            _context.StudyOffers.Remove(offer);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Admin deleted offer {OfferId}", offerId);
        }

        public async Task UpdateUserRoleAsync(string userId, string role)
        {
            var validRoles = new[] { "Admin", "Student" };
            if (!validRoles.Contains(role))
            {
                throw new InvalidOperationException($"Invalid role '{role}'. Valid roles are: {string.Join(", ", validRoles)}.");
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with id {userId} not found.");
            }

            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
            await _userManager.AddToRoleAsync(user, role);

            _logger.LogInformation("Admin changed role of user {UserId} to {Role}", userId, role);
        }

        public async Task<IEnumerable<(ApplicationUser User, IList<string> Roles)>> GetAllUsersAsync()
        {
            var users = await _userManager.Users.ToListAsync();
            var result = new List<(ApplicationUser, IList<string>)>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                result.Add((user, roles));
            }

            return result;
        }
    }
}
