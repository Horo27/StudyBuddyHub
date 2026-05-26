using StudyBuddyHub.Core.Enums;
using System.ComponentModel.DataAnnotations;

namespace StudyBuddyHub.Api.DTOs
{
    public class StudyRequestCreateDto
    {
        [Required]
        public int OfferId { get; set; }

        public string? Message { get; set; }
    }
}