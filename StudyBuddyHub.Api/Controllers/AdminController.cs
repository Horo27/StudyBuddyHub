using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudyBuddyHub.Api.DTOs.Admin;
using StudyBuddyHub.Core.Interfaces;

namespace StudyBuddyHub.Api.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var (totalUsers, activeOffers, pendingRequests, totalOffers, totalRequests) = await _adminService.GetStatsAsync();

            return Ok(new AdminStatsDto
            {
                TotalUsers = totalUsers,
                ActiveOffers = activeOffers,
                PendingRequests = pendingRequests,
                TotalOffers = totalOffers,
                TotalRequests = totalRequests
            });
        }

        [HttpDelete("offers/{id}")]
        public async Task<IActionResult> DeleteOffer(int id)
        {
            await _adminService.DeleteOfferAsync(id);
            return NoContent();
        }

        [HttpPatch("users/{id}/role")]
        public async Task<IActionResult> UpdateUserRole(string id, [FromBody] UpdateUserRoleDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await _adminService.UpdateUserRoleAsync(id, dto.Role);
            return NoContent();
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _adminService.GetAllUsersAsync();

            var result = users.Select(u => new AdminUserDto
            {
                Id = u.User.Id,
                Email = u.User.Email ?? string.Empty,
                FirstName = u.User.FirstName ?? string.Empty,
                LastName = u.User.LastName ?? string.Empty,
                Faculty = u.User.Faculty,
                University = u.User.University,
                CreatedAt = u.User.CreatedAt,
                Roles = u.Roles
            });

            return Ok(result);
        }
    }
}
