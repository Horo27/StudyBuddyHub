using StudyBuddyHub.Core.Enums;
using System;
using System.Collections.Generic;

namespace StudyBuddyHub.Core.Entities
{
    public class StudyOffer
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Level Level { get; set; }
        public SessionType SessionType { get; set; }
        public decimal Price { get; set; }
        public string? Location { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public string OwnerId { get; set; } = string.Empty;
        public ApplicationUser Owner { get; set; } = null!;

        public int SubjectId { get; set; }
        public Subject Subject { get; set; } = null!;

        public ICollection<StudyRequest> StudyRequests { get; set; } = new List<StudyRequest>();
        public ICollection<FavoriteOffer> FavoritedBy { get; set; } = new List<FavoriteOffer>();
    }
}
