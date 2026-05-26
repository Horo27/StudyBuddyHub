using Microsoft.Extensions.Logging;
using StudyBuddyHub.Core.Entities;
using StudyBuddyHub.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StudyBuddyHub.Infrastructure.Services
{
    public class StudyOfferService : IStudyOfferService
    {
        private readonly IStudyOfferRepository _offerRepository;
        private readonly ILogger<StudyOfferService> _logger;

        public StudyOfferService(IStudyOfferRepository offerRepository, ILogger<StudyOfferService> logger)
        {
            _offerRepository = offerRepository;
            _logger = logger;
        }

        public async Task<IEnumerable<StudyOffer>> GetAllOffersAsync(int? subjectId, string? search, decimal? minPrice, decimal? maxPrice, bool? isActive = true)
        {
            var offers = await _offerRepository.GetAllAsync();
            var query = offers.AsQueryable();

            if (isActive.HasValue)
            {
                query = query.Where(o => o.IsActive == isActive.Value);
            }

            if (subjectId.HasValue)
            {
                query = query.Where(o => o.SubjectId == subjectId.Value);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(o => o.Title.Contains(search, StringComparison.OrdinalIgnoreCase) || 
                                         o.Description.Contains(search, StringComparison.OrdinalIgnoreCase));
            }

            if (minPrice.HasValue)
            {
                query = query.Where(o => o.Price >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(o => o.Price <= maxPrice.Value);
            }

            return query.ToList();
        }

        public async Task<StudyOffer?> GetOfferByIdAsync(int id)
        {
            return await _offerRepository.GetByIdAsync(id);
        }

        public async Task<StudyOffer> CreateOfferAsync(StudyOffer offer, string userId)
        {
            offer.OwnerId = userId;
            offer.CreatedAt = DateTime.UtcNow;
            offer.IsActive = true;
            var created = await _offerRepository.AddAsync(offer);
            _logger.LogInformation("User {UserId} created offer {OfferId}", userId, created.Id);
            return created;
        }

        public async Task UpdateOfferAsync(int id, StudyOffer updatedOffer, string userId, bool isAdmin)
        {
            var existingOffer = await _offerRepository.GetByIdAsync(id);
            if (existingOffer == null)
            {
                throw new KeyNotFoundException($"Offer with id {id} not found.");
            }

            if (existingOffer.OwnerId != userId && !isAdmin)
            {
                _logger.LogWarning("User {UserId} unauthorized to update offer {OfferId}", userId, id);
                throw new UnauthorizedAccessException("You are not authorized to update this offer.");
            }

            existingOffer.Title = updatedOffer.Title ?? existingOffer.Title;
            existingOffer.Description = updatedOffer.Description ?? existingOffer.Description;
            existingOffer.Level = updatedOffer.Level;
            existingOffer.SessionType = updatedOffer.SessionType;
            existingOffer.Price = updatedOffer.Price;
            existingOffer.Location = updatedOffer.Location ?? existingOffer.Location;
            existingOffer.IsActive = updatedOffer.IsActive;
            existingOffer.SubjectId = updatedOffer.SubjectId > 0 ? updatedOffer.SubjectId : existingOffer.SubjectId;
            existingOffer.UpdatedAt = DateTime.UtcNow;

            await _offerRepository.UpdateAsync(existingOffer);
        }

        public async Task DeleteOfferAsync(int id, string userId, bool isAdmin)
        {
            var offer = await _offerRepository.GetByIdAsync(id);
            if (offer == null)
            {
                throw new KeyNotFoundException($"Offer with id {id} not found.");
            }

            if (offer.OwnerId != userId && !isAdmin)
            {
                _logger.LogWarning("User {UserId} unauthorized to delete offer {OfferId}", userId, id);
                throw new UnauthorizedAccessException("You are not authorized to delete this offer.");
            }

            await _offerRepository.DeleteAsync(offer);
            _logger.LogInformation("Offer {OfferId} deleted by user {UserId}", id, userId);
        }

        public async Task<IEnumerable<StudyOffer>> GetMyOffersAsync(string userId)
        {
            var offers = await _offerRepository.GetAllAsync();
            return offers.Where(o => o.OwnerId == userId).ToList();
        }
    }
}