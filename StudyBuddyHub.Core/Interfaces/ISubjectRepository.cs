using StudyBuddyHub.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace StudyBuddyHub.Core.Interfaces
{
    public interface ISubjectRepository
    {
        Task<Subject?> GetByIdAsync(int id);
        Task<IEnumerable<Subject>> GetAllAsync();
    }
}