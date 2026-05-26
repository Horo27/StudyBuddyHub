using System.Collections.Generic;

namespace StudyBuddyHub.Core.Entities
{
    public class Subject
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }

        public ICollection<StudyOffer> StudyOffers { get; set; } = new List<StudyOffer>();
    }
}
