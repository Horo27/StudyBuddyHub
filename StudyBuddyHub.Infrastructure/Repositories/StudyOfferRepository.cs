using Microsoft.EntityFrameworkCore;
using StudyBuddyHub.Core.Entities;
using StudyBuddyHub.Core.Interfaces;
using StudyBuddyHub.Infrastructure.Data;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace StudyBuddyHub.Infrastructure.Repositories
{
    public class StudyOfferRepository : IStudyOfferRepository
    {
        private readonly ApplicationDbContext _context;

        public StudyOfferRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<StudyOffer?> GetByIdAsync(int id)
        {
            return await _context.StudyOffers
                .Include(o => o.Subject)
                .Include(o => o.Owner)
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task<IEnumerable<StudyOffer>> GetAllAsync()
        {
            return await _context.StudyOffers
                .Include(o => o.Subject)
                .Include(o => o.Owner)
                .ToListAsync();
        }

        public async Task<StudyOffer> AddAsync(StudyOffer entity)
        {
            _context.StudyOffers.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task UpdateAsync(StudyOffer entity)
        {
            _context.StudyOffers.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(StudyOffer entity)
        {
            _context.StudyOffers.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}