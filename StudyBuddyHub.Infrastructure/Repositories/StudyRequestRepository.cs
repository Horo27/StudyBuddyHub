using Microsoft.EntityFrameworkCore;
using StudyBuddyHub.Core.Entities;
using StudyBuddyHub.Core.Interfaces;
using StudyBuddyHub.Infrastructure.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StudyBuddyHub.Infrastructure.Repositories
{
    public class StudyRequestRepository : IStudyRequestRepository
    {
        private readonly ApplicationDbContext _context;

        public StudyRequestRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<StudyRequest?> GetByIdAsync(int id)
        {
            return await _context.StudyRequests
                .Include(r => r.Offer)
                .ThenInclude(o => o.Owner)
                .Include(r => r.Requester)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<IEnumerable<StudyRequest>> GetAllAsync()
        {
            return await _context.StudyRequests
                .Include(r => r.Offer)
                .Include(r => r.Requester)
                .ToListAsync();
        }

        public async Task<IEnumerable<StudyRequest>> GetByRequesterIdAsync(string requesterId)
        {
            return await _context.StudyRequests
                .Include(r => r.Offer)
                .ThenInclude(o => o.Subject)
                .Include(r => r.Requester)
                .Where(r => r.RequesterId == requesterId)
                .ToListAsync();
        }

        public async Task<IEnumerable<StudyRequest>> GetByOfferOwnerIdAsync(string ownerId)
        {
            return await _context.StudyRequests
                .Include(r => r.Offer)
                .ThenInclude(o => o.Subject)
                .Include(r => r.Requester)
                .Where(r => r.Offer.OwnerId == ownerId)
                .ToListAsync();
        }

        public async Task<IEnumerable<StudyRequest>> GetByOfferIdAsync(int offerId)
        {
            return await _context.StudyRequests
                .Include(r => r.Offer)
                .ThenInclude(o => o.Subject)
                .Include(r => r.Requester)
                .Where(r => r.OfferId == offerId)
                .ToListAsync();
        }

        public async Task<StudyRequest> AddAsync(StudyRequest entity)
        {
            _context.StudyRequests.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task UpdateAsync(StudyRequest entity)
        {
            _context.StudyRequests.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(StudyRequest entity)
        {
            _context.StudyRequests.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}