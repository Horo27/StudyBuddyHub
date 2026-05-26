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
        private readonly StudyRequestService _service;

        public StudyRequestServiceTests()
        {
            _requestRepoMock = new Mock<IStudyRequestRepository>();
            _offerRepoMock = new Mock<IStudyOfferRepository>();
            var logger = new Mock<ILogger<StudyRequestService>>();
            _service = new StudyRequestService(_requestRepoMock.Object, _offerRepoMock.Object, logger.Object);
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

            var request = new StudyRequest { OfferId = 1, Message = "Hi" };
            var result = await _service.CreateRequestAsync(request, "user2");

            Assert.Equal(RequestStatus.Pending, result.Status);
            Assert.Equal("user2", result.RequesterId);
            _requestRepoMock.Verify(r => r.AddAsync(It.IsAny<StudyRequest>()), Times.Once);
        }
    }
}
