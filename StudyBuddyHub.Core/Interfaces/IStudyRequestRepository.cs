using StudyBuddyHub.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace StudyBuddyHub.Core.Interfaces
{
    public interface IStudyRequestRepository
    {
        Task<StudyRequest?> GetByIdAsync(int id);
        Task<IEnumerable<StudyRequest>> GetAllAsync();
        Task<IEnumerable<StudyRequest>> GetByRequesterIdAsync(string requesterId);
        Task<IEnumerable<StudyRequest>> GetByOfferOwnerIdAsync(string ownerId);
        Task<StudyRequest> AddAsync(StudyRequest entity);
        Task UpdateAsync(StudyRequest entity);
        Task DeleteAsync(StudyRequest entity);
    }
}