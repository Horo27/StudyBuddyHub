using StudyBuddyHub.Core.Entities;
using StudyBuddyHub.Api.DTOs;

namespace StudyBuddyHub.Api.Mappings
{
    public static class StudyRequestMappingExtensions
    {
        public static StudyRequestListDto ToListDto(this StudyRequest request)
        {
            return new StudyRequestListDto
            {
                Id = request.Id,
                Message = request.Message,
                Status = request.Status,
                CreatedAt = request.CreatedAt,
                OfferId = request.OfferId,
                OfferTitle = request.Offer?.Title ?? "Unknown",
                OfferSubject = request.Offer?.Subject?.Name ?? "Unknown",
                RequesterId = request.RequesterId,
                RequesterName = request.Requester != null ? $"{request.Requester.FirstName} {request.Requester.LastName}".Trim() : "Unknown"
            };
        }
    }
}