using StudyBuddyHub.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace StudyBuddyHub.Core.Interfaces
{
    public interface IStudyOfferRepository
    {
        Task<StudyOffer?> GetByIdAsync(int id);
        Task<IEnumerable<StudyOffer>> GetAllAsync();
        Task<StudyOffer> AddAsync(StudyOffer entity);
        Task UpdateAsync(StudyOffer entity);
        Task DeleteAsync(StudyOffer entity);
    }
}