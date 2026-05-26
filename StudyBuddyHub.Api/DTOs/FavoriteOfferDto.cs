namespace StudyBuddyHub.Api.DTOs
{
    public class FavoriteOfferDto
    {
        public int FavoriteId { get; set; }
        public int OfferId { get; set; }
        public string OfferTitle { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public string OwnerName { get; set; } = string.Empty;
        public decimal Price { get; set; }
    }
}
