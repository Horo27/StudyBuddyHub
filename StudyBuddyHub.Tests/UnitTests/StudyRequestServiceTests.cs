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
    public class StudyRequestServiceTests
    {
        private readonly Mock<IStudyRequestRepository> _requestRepoMock;
        private readonly Mock<IStudyOfferRepository> _offerRepoMock;
        private readonly Mock<INotificationService> _notificationMock;
        private readonly StudyRequestService _service;

        public StudyRequestServiceTests()
        {
            _requestRepoMock = new Mock<IStudyRequestRepository>();
            _offerRepoMock = new Mock<IStudyOfferRepository>();
            _notificationMock = new Mock<INotificationService>();
            var logger = new Mock<ILogger<StudyRequestService>>();
            _service = new StudyRequestService(
                _requestRepoMock.Object,
                _offerRepoMock.Object,
                _notificationMock.Object,
                logger.Object);
        }

        [Fact]
        public async Task CreateRequestAsync_SelfRequest_ThrowsInvalidOperationException()
        {
            var offer = new StudyOffer { Id = 1, OwnerId = "user1" };
            _offerRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(offer);

            var request = new StudyRequest { OfferId = 1 };

            var exception = await Assert.ThrowsAsync<InvalidOperationException>(
                () => _service.CreateRequestAsync(request, "user1"));

            Assert.Equal("You cannot request your own offer.", exception.Message);
        }

        [Fact]
        public async Task CreateRequestAsync_Valid_Succeeds()
        {
            var offer = new StudyOffer { Id = 1, OwnerId = "user1" };
            _offerRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(offer);
            _requestRepoMock.Setup(r => r.GetByRequesterIdAsync("user2")).ReturnsAsync(new List<StudyRequest>());
            _requestRepoMock.Setup(r => r.AddAsync(It.IsAny<StudyRequest>())).ReturnsAsync((StudyRequest r) => r);
            _notificationMock.Setup(n => n.NotifyUserAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<object>()))
                .Returns(Task.CompletedTask);

            var request = new StudyRequest { OfferId = 1, Message = "Hi" };
            var result = await _service.CreateRequestAsync(request, "user2");

            Assert.Equal(RequestStatus.Pending, result.Status);
            Assert.Equal("user2", result.RequesterId);
            _requestRepoMock.Verify(r => r.AddAsync(It.IsAny<StudyRequest>()), Times.Once);
        }

        [Fact]
        public async Task AcceptRequestAsync_NonOwner_ThrowsUnauthorizedAccessException()
        {
            var offer = new StudyOffer { Id = 1, OwnerId = "actualOwner" };
            var request = new StudyRequest { Id = 10, OfferId = 1, Offer = offer, RequesterId = "student1" };
            _requestRepoMock.Setup(r => r.GetByIdAsync(10)).ReturnsAsync(request);

            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                _service.AcceptRequestAsync(10, "nonOwner"));
        }

        [Fact]
        public async Task RejectRequestAsync_NonOwner_ThrowsUnauthorizedAccessException()
        {
            var offer = new StudyOffer { Id = 1, OwnerId = "actualOwner" };
            var request = new StudyRequest { Id = 11, OfferId = 1, Offer = offer, RequesterId = "student1" };
            _requestRepoMock.Setup(r => r.GetByIdAsync(11)).ReturnsAsync(request);

            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                _service.RejectRequestAsync(11, "nonOwner"));
        }

        [Fact]
        public async Task CancelRequestAsync_NonRequester_ThrowsUnauthorizedAccessException()
        {
            var offer = new StudyOffer { Id = 1, OwnerId = "owner1" };
            var request = new StudyRequest { Id = 12, OfferId = 1, Offer = offer, RequesterId = "actualRequester" };
            _requestRepoMock.Setup(r => r.GetByIdAsync(12)).ReturnsAsync(request);

            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                _service.CancelRequestAsync(12, "someoneElse"));
        }
    }
}
