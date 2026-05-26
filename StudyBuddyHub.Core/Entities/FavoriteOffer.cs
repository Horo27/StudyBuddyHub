namespace StudyBuddyHub.Core.Entities
{
    public class FavoriteOffer
    {
        public int Id { get; set; }

        public string UserId { get; set; } = string.Empty;
        public ApplicationUser User { get; set; } = null!;

        public int OfferId { get; set; }
        public StudyOffer Offer { get; set; } = null!;
    }
}
