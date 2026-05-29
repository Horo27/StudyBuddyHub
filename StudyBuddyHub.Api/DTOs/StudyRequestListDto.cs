using StudyBuddyHub.Core.Enums;
using System;

namespace StudyBuddyHub.Api.DTOs
{
    public class StudyRequestListDto
    {
        public int Id { get; set; }
        public string? Message { get; set; }
        public RequestStatus Status { get; set; }
        public PaymentStatus PaymentStatus { get; set; }
        public DateTime CreatedAt { get; set; }

        public int OfferId { get; set; }
        public string OfferTitle { get; set; } = string.Empty;
        public string OfferSubject { get; set; } = string.Empty;

        public string RequesterId { get; set; } = string.Empty;
        public string RequesterName { get; set; } = string.Empty;
    }
}