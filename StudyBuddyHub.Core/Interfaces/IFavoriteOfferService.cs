using StudyBuddyHub.Core.Entities;

namespace StudyBuddyHub.Core.Interfaces
{
    public interface IFavoriteOfferService
    {
        Task<IEnumerable<FavoriteOffer>> GetFavoritesAsync(string userId);
        Task AddFavoriteAsync(string userId, int offerId);
        Task RemoveFavoriteAsync(string userId, int offerId);
    }
}
