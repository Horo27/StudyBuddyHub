using StudyBuddyHub.Core.Enums;

namespace StudyBuddyHub.Api.DTOs
{
    public class StudyOfferUpdateDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public Level? Level { get; set; }
        public SessionType? SessionType { get; set; }
        public decimal? Price { get; set; }
        public string? Location { get; set; }
        public bool? IsActive { get; set; }
        public int? SubjectId { get; set; }
    }
}