using Microsoft.EntityFrameworkCore;
using StudyBuddyHub.Core.Entities;
using StudyBuddyHub.Core.Interfaces;
using StudyBuddyHub.Infrastructure.Data;

namespace StudyBuddyHub.Infrastructure.Repositories
{
    public class FavoriteOfferRepository : IFavoriteOfferRepository
    {
        private readonly ApplicationDbContext _context;

        public FavoriteOfferRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<FavoriteOffer>> GetByUserIdAsync(string userId)
        {
            return await _context.FavoriteOffers
                .Include(f => f.Offer)
                    .ThenInclude(o => o.Subject)
                .Include(f => f.Offer)
                    .ThenInclude(o => o.Owner)
                .Where(f => f.UserId == userId)
                .ToListAsync();
        }

        public async Task<FavoriteOffer?> GetByUserAndOfferAsync(string userId, int offerId)
        {
            return await _context.FavoriteOffers
                .FirstOrDefaultAsync(f => f.UserId == userId && f.OfferId == offerId);
        }

        public async Task<FavoriteOffer> AddAsync(FavoriteOffer favorite)
        {
            _context.FavoriteOffers.Add(favorite);
            await _context.SaveChangesAsync();
            return favorite;
        }

        public async Task DeleteAsync(FavoriteOffer favorite)
        {
            _context.FavoriteOffers.Remove(favorite);
            await _context.SaveChangesAsync();
        }
    }
}
