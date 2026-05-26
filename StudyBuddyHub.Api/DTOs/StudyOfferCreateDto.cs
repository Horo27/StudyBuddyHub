using StudyBuddyHub.Core.Enums;
using System.ComponentModel.DataAnnotations;

namespace StudyBuddyHub.Api.DTOs
{
    public class StudyOfferCreateDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public Level Level { get; set; }

        [Required]
        public SessionType SessionType { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }

        public string? Location { get; set; }

        [Required]
        public int SubjectId { get; set; }
    }
}