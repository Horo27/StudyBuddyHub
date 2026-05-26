using StudyBuddyHub.Core.Enums;
using System;

namespace StudyBuddyHub.Api.DTOs
{
    public class StudyOfferDetailsDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Level Level { get; set; }
        public SessionType SessionType { get; set; }
        public decimal Price { get; set; }
        public string? Location { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public string OwnerId { get; set; } = string.Empty;
        public string OwnerName { get; set; } = string.Empty;
        public string? OwnerEmail { get; set; }
    }
}