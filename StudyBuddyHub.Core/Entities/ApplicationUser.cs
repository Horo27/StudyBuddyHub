using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;

namespace StudyBuddyHub.Core.Entities
{
    public class ApplicationUser : IdentityUser
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Faculty { get; set; }
        public string? University { get; set; }
        public string? Bio { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<StudyOffer> StudyOffers { get; set; } = new List<StudyOffer>();
        public ICollection<StudyRequest> StudyRequests { get; set; } = new List<StudyRequest>();
        public ICollection<FavoriteOffer> FavoriteOffers { get; set; } = new List<FavoriteOffer>();
    }
}
