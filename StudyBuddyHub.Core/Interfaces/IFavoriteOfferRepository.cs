using StudyBuddyHub.Core.Entities;

namespace StudyBuddyHub.Core.Interfaces
{
    public interface IFavoriteOfferRepository
    {
        Task<IEnumerable<FavoriteOffer>> GetByUserIdAsync(string userId);
        Task<FavoriteOffer?> GetByUserAndOfferAsync(string userId, int offerId);
        Task<FavoriteOffer> AddAsync(FavoriteOffer favorite);
        Task DeleteAsync(FavoriteOffer favorite);
    }
}
