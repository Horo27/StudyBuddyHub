using StudyBuddyHub.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace StudyBuddyHub.Core.Interfaces
{
    public interface IStudyRequestService
    {
        Task<StudyRequest> CreateRequestAsync(StudyRequest request, string userId);
        Task<IEnumerable<StudyRequest>> GetSentRequestsAsync(string userId);
        Task<IEnumerable<StudyRequest>> GetReceivedRequestsAsync(string ownerId);
        Task AcceptRequestAsync(int id, string ownerId);
        Task RejectRequestAsync(int id, string ownerId);
        Task CancelRequestAsync(int id, string requesterId);
    }
}