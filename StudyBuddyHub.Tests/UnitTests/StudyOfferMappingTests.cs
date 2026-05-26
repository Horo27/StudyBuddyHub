using StudyBuddyHub.Api.Mappings;
using StudyBuddyHub.Core.Entities;
using Xunit;

namespace StudyBuddyHub.Tests.UnitTests
{
    public class StudyOfferMappingTests
    {
        [Fact]
        public void ToListDto_MapsPropertiesCorrectly()
        {
            var offer = new StudyOffer
            {
                Id = 1,
                Title = "Test",
                Price = 100,
                Subject = new Subject { Name = "Math" },
                Owner = new ApplicationUser { FirstName = "John", LastName = "Doe" }
            };

            var dto = offer.ToListDto();

            Assert.Equal(1, dto.Id);
            Assert.Equal("Test", dto.Title);
            Assert.Equal(100, dto.Price);
            Assert.Equal("Math", dto.SubjectName);
            Assert.Equal("John Doe", dto.OwnerName);
        }
    }
}
