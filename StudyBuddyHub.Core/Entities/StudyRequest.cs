using StudyBuddyHub.Core.Enums;
using System;

namespace StudyBuddyHub.Core.Entities
{
    public class StudyRequest
    {
        public int Id { get; set; }
        public string? Message { get; set; }
        public RequestStatus Status { get; set; } = RequestStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int OfferId { get; set; }
        public StudyOffer Offer { get; set; } = null!;

        public string RequesterId { get; set; } = string.Empty;
        public ApplicationUser Requester { get; set; } = null!;
    }
}
