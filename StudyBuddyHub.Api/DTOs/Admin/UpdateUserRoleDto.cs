using System.ComponentModel.DataAnnotations;

namespace StudyBuddyHub.Api.DTOs.Admin
{
    public class UpdateUserRoleDto
    {
        [Required]
        public string Role { get; set; } = string.Empty;
    }
}
