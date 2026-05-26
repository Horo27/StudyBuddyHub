using System;

namespace StudyBuddyHub.Api.DTOs
{
    public class UserProfileDto
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Faculty { get; set; }
        public string? University { get; set; }
        public string? Bio { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}