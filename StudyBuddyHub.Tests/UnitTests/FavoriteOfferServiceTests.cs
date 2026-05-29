using Microsoft.Extensions.Logging;
using Moq;
using StudyBuddyHub.Core.Entities;
using StudyBuddyHub.Core.Interfaces;
using StudyBuddyHub.Infrastructure.Services;
using System;
using System.Threading.Tasks;
using Xunit;

namespace StudyBuddyHub.Tests.UnitTests
{
    public class FavoriteOfferServiceTests
    {
        private readonly Mock<IFavoriteOfferRepository> _favoriteRepoMock;
        private readonly Mock<IStudyOfferRepository> _offerRepoMock;
        private readonly FavoriteOfferService _service;

        public FavoriteOfferServiceTests()
        {
            _favoriteRepoMock = new Mock<IFavoriteOfferRepository>();
            _offerRepoMock = new Mock<IStudyOfferRepository>();
            var logger = new Mock<ILogger<FavoriteOfferService>>();
            _service = new FavoriteOfferService(_favoriteRepoMock.Object, _offerRepoMock.Object, logger.Object);
        }

        [Fact]
        public async Task AddFavoriteAsync_HappyPath_AddsFavorite()
        {
            var offer = new StudyOffer { Id = 5, Title = "Test Offer" };
            _offerRepoMock.Setup(r => r.GetByIdAsync(5)).ReturnsAsync(offer);
            _favoriteRepoMock.Setup(r => r.GetByUserAndOfferAsync("user1", 5))
                .ReturnsAsync((FavoriteOffer?)null);
            _favoriteRepoMock.Setup(r => r.AddAsync(It.IsAny<FavoriteOffer>()))
                .ReturnsAsync((FavoriteOffer f) => f);

            await _service.AddFavoriteAsync("user1", 5);

            _favoriteRepoMock.Verify(r => r.AddAsync(It.Is<FavoriteOffer>(f =>
                f.UserId == "user1" && f.OfferId == 5)), Times.Once);
        }

        [Fact]
        public async Task AddFavoriteAsync_OfferNotFound_ThrowsKeyNotFoundException()
        {
            _offerRepoMock.Setup(r => r.GetByIdAsync(99))
                .ReturnsAsync((StudyOffer?)null);

            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                _service.AddFavoriteAsync("user1", 99));
        }

        [Fact]
        public async Task AddFavoriteAsync_AlreadyFavorited_ThrowsInvalidOperationException()
        {
            var offer = new StudyOffer { Id = 5 };
            var existing = new FavoriteOffer { UserId = "user1", OfferId = 5 };
            _offerRepoMock.Setup(r => r.GetByIdAsync(5)).ReturnsAsync(offer);
            _favoriteRepoMock.Setup(r => r.GetByUserAndOfferAsync("user1", 5))
                .ReturnsAsync(existing);

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _service.AddFavoriteAsync("user1", 5));
        }

        [Fact]
        public async Task RemoveFavoriteAsync_HappyPath_DeletesFavorite()
        {
            var favorite = new FavoriteOffer { UserId = "user1", OfferId = 5 };
            _favoriteRepoMock.Setup(r => r.GetByUserAndOfferAsync("user1", 5))
                .ReturnsAsync(favorite);

            await _service.RemoveFavoriteAsync("user1", 5);

            _favoriteRepoMock.Verify(r => r.DeleteAsync(favorite), Times.Once);
        }

        [Fact]
        public async Task RemoveFavoriteAsync_NotFound_ThrowsKeyNotFoundException()
        {
            _favoriteRepoMock.Setup(r => r.GetByUserAndOfferAsync("user1", 5))
                .ReturnsAsync((FavoriteOffer?)null);

            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                _service.RemoveFavoriteAsync("user1", 5));
        }
    }
}
