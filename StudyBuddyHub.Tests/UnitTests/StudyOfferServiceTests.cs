using Microsoft.Extensions.Logging;
using Moq;
using StudyBuddyHub.Core.Entities;
using StudyBuddyHub.Core.Interfaces;
using StudyBuddyHub.Infrastructure.Services;
using System;
using System.Threading.Tasks;
using Xunit;
using StudyBuddyHub.Core.Enums;
using System.Collections.Generic;

namespace StudyBuddyHub.Tests.UnitTests
{
    public class StudyOfferServiceTests
    {
        private readonly Mock<IStudyOfferRepository> _offerRepoMock;
        private readonly StudyOfferService _service;

        public StudyOfferServiceTests()
        {
            _offerRepoMock = new Mock<IStudyOfferRepository>();
            var logger = new Mock<ILogger<StudyOfferService>>();
            _service = new StudyOfferService(_offerRepoMock.Object, logger.Object);
        }

        [Fact]
        public async Task CreateOfferAsync_SetsOwnerAndDefaults()
        {
            // Arrange
            var offer = new StudyOffer { Title = "Test Offer" };
            var userId = "user1";
            _offerRepoMock.Setup(r => r.AddAsync(It.IsAny<StudyOffer>()))
                .ReturnsAsync((StudyOffer o) => o);

            // Act
            var result = await _service.CreateOfferAsync(offer, userId);

            // Assert
            Assert.Equal(userId, result.OwnerId);
            Assert.True(result.IsActive);
            Assert.NotEqual(default(DateTime), result.CreatedAt);
        }

        [Fact]
        public async Task UpdateOfferAsync_NotOwnerNotAdmin_ThrowsUnauthorizedException()
        {
            // Arrange
            var existingOffer = new StudyOffer { Id = 1, OwnerId = "ownerId" };
            _offerRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existingOffer);

            var updatedOffer = new StudyOffer { Title = "New Title" };

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => 
                _service.UpdateOfferAsync(1, updatedOffer, "strangerId", false));
        }

        [Fact]
        public async Task UpdateOfferAsync_Admin_CanUpdate()
        {
            // Arrange
            var existingOffer = new StudyOffer { Id = 1, OwnerId = "ownerId", Title = "Old Title" };
            _offerRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existingOffer);

            var updatedOffer = new StudyOffer { Title = "New Title", SubjectId = 1, Level = Level.Beginner, SessionType = SessionType.Online };

            // Act
            var exception = await Record.ExceptionAsync(() => 
                _service.UpdateOfferAsync(1, updatedOffer, "adminId", true));

            // Assert
            Assert.Null(exception); // Should not throw
            _offerRepoMock.Verify(r => r.UpdateAsync(existingOffer), Times.Once);
            Assert.Equal("New Title", existingOffer.Title);
        }
    }
}
