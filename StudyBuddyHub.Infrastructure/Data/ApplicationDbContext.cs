using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using StudyBuddyHub.Core.Entities;

namespace StudyBuddyHub.Infrastructure.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Subject> Subjects { get; set; }
        public DbSet<StudyOffer> StudyOffers { get; set; }
        public DbSet<StudyRequest> StudyRequests { get; set; }
        public DbSet<FavoriteOffer> FavoriteOffers { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<StudyOffer>()
                .HasOne(o => o.Owner)
                .WithMany(u => u.StudyOffers)
                .HasForeignKey(o => o.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<StudyRequest>()
                .HasOne(r => r.Requester)
                .WithMany(u => u.StudyRequests)
                .HasForeignKey(r => r.RequesterId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<StudyRequest>()
                .HasOne(r => r.Offer)
                .WithMany(o => o.StudyRequests)
                .HasForeignKey(r => r.OfferId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<FavoriteOffer>()
                .HasOne(f => f.User)
                .WithMany(u => u.FavoriteOffers)
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<FavoriteOffer>()
                .HasOne(f => f.Offer)
                .WithMany(o => o.FavoritedBy)
                .HasForeignKey(f => f.OfferId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<StudyRequest>()
                .HasIndex(r => new { r.RequesterId, r.OfferId })
                .IsUnique()
                .HasFilter("[Status] IN (0, 1)"); // Prevent multiple active requests
        }
    }
}
