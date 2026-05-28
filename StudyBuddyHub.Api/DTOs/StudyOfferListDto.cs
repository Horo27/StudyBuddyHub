using StudyBuddyHub.Core.Enums;

namespace StudyBuddyHub.Api.DTOs
{
    public class StudyOfferListDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public Level Level { get; set; }
        public SessionType SessionType { get; set; }
        public decimal Price { get; set; }
        public string? Location { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public string OwnerName { get; set; } = string.Empty;
        public string? SubjectImageUrl { get; set; }
        public string? SubjectImageUrl2 { get; set; }
    }
}