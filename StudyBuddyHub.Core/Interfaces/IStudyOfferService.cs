using StudyBuddyHub.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace StudyBuddyHub.Core.Interfaces
{
    public interface IStudyOfferService
    {
        Task<IEnumerable<StudyOffer>> GetAllOffersAsync(int? subjectId, string? search, decimal? minPrice, decimal? maxPrice, bool? isActive = true);
        Task<StudyOffer?> GetOfferByIdAsync(int id);
        Task<StudyOffer> CreateOfferAsync(StudyOffer offer, string userId);
        Task UpdateOfferAsync(int id, StudyOffer updatedOffer, string userId, bool isAdmin);
        Task DeleteOfferAsync(int id, string userId, bool isAdmin);
        Task<IEnumerable<StudyOffer>> GetMyOffersAsync(string userId);
    }
}