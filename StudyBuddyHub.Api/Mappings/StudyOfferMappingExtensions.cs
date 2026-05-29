using StudyBuddyHub.Core.Entities;
using StudyBuddyHub.Api.DTOs;
using System;

namespace StudyBuddyHub.Api.Mappings
{
    public static class StudyOfferMappingExtensions
    {
        public static StudyOfferListDto ToListDto(this StudyOffer offer)
        {
            return new StudyOfferListDto
            {
                Id = offer.Id,
                Title = offer.Title,
                Level = offer.Level,
                SessionType = offer.SessionType,
                Price = offer.Price,
                Location = offer.Location,
                SubjectName = offer.Subject?.Name ?? "Unknown",
                OwnerName = offer.Owner != null ? $"{offer.Owner.FirstName} {offer.Owner.LastName}".Trim() : "Unknown",
                SubjectImageUrl = offer.Subject?.ImageUrl,
                SubjectImageUrl2 = offer.Subject?.ImageUrl2,
                IsActive = offer.IsActive
            };
        }

        public static StudyOfferDetailsDto ToDetailsDto(this StudyOffer offer)
        {
            return new StudyOfferDetailsDto
            {
                Id = offer.Id,
                Title = offer.Title,
                Description = offer.Description,
                Level = offer.Level,
                SessionType = offer.SessionType,
                Price = offer.Price,
                Location = offer.Location,
                IsActive = offer.IsActive,
                CreatedAt = offer.CreatedAt,
                UpdatedAt = offer.UpdatedAt,
                SubjectName = offer.Subject?.Name ?? "Unknown",
                OwnerId = offer.OwnerId,
                OwnerName = offer.Owner != null ? $"{offer.Owner.FirstName} {offer.Owner.LastName}".Trim() : "Unknown",
                OwnerEmail = offer.Owner?.Email,
                SubjectImageUrl = offer.Subject?.ImageUrl
            };
        }
    }
}