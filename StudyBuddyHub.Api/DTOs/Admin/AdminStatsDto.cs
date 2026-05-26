namespace StudyBuddyHub.Api.DTOs.Admin
{
    public class AdminStatsDto
    {
        public int TotalUsers { get; set; }
        public int ActiveOffers { get; set; }
        public int PendingRequests { get; set; }
        public int TotalOffers { get; set; }
        public int TotalRequests { get; set; }
    }
}
