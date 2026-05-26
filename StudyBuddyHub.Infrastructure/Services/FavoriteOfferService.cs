using Microsoft.Extensions.Logging;
using StudyBuddyHub.Core.Entities;
using StudyBuddyHub.Core.Interfaces;

namespace StudyBuddyHub.Infrastructure.Services
{
    public class FavoriteOfferService : IFavoriteOfferService
    {
        private readonly IFavoriteOfferRepository _favoriteRepository;
        private readonly IStudyOfferRepository _offerRepository;
        private readonly ILogger<FavoriteOfferService> _logger;

        public FavoriteOfferService(IFavoriteOfferRepository favoriteRepository, IStudyOfferRepository offerRepository, ILogger<FavoriteOfferService> logger)
        {
            _favoriteRepository = favoriteRepository;
            _offerRepository = offerRepository;
            _logger = logger;
        }

        public async Task<IEnumerable<FavoriteOffer>> GetFavoritesAsync(string userId)
        {
            return await _favoriteRepository.GetByUserIdAsync(userId);
        }

        public async Task AddFavoriteAsync(string userId, int offerId)
        {
            var offer = await _offerRepository.GetByIdAsync(offerId);
            if (offer == null)
            {
                throw new KeyNotFoundException($"Offer with id {offerId} not found.");
            }

            var existing = await _favoriteRepository.GetByUserAndOfferAsync(userId, offerId);
            if (existing != null)
            {
                throw new InvalidOperationException("Offer is already in favorites.");
            }

            var favorite = new FavoriteOffer { UserId = userId, OfferId = offerId };
            await _favoriteRepository.AddAsync(favorite);
            _logger.LogInformation("User {UserId} added offer {OfferId} to favorites", userId, offerId);
        }

        public async Task RemoveFavoriteAsync(string userId, int offerId)
        {
            var favorite = await _favoriteRepository.GetByUserAndOfferAsync(userId, offerId);
            if (favorite == null)
            {
                throw new KeyNotFoundException("Favorite not found.");
            }

            await _favoriteRepository.DeleteAsync(favorite);
            _logger.LogInformation("User {UserId} removed offer {OfferId} from favorites", userId, offerId);
        }
    }
}
