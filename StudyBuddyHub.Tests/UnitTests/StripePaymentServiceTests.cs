using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using StudyBuddyHub.Core.Entities;
using StudyBuddyHub.Core.Enums;
using StudyBuddyHub.Core.Interfaces;
using StudyBuddyHub.Infrastructure.Services;
using System;
using System.Threading.Tasks;
using Xunit;

namespace StudyBuddyHub.Tests.UnitTests
{
    public class StripePaymentServiceTests
    {
        private readonly Mock<IStudyRequestRepository> _requestRepoMock;
        private readonly Mock<IStudyOfferRepository> _offerRepoMock;
        private readonly Mock<INotificationService> _notificationMock;
        private readonly Mock<IConfiguration> _configMock;
        private readonly StripePaymentService _service;

        public StripePaymentServiceTests()
        {
            _requestRepoMock = new Mock<IStudyRequestRepository>();
            _offerRepoMock = new Mock<IStudyOfferRepository>();
            _notificationMock = new Mock<INotificationService>();
            _configMock = new Mock<IConfiguration>();
            var logger = new Mock<ILogger<StripePaymentService>>();

            _service = new StripePaymentService(
                _requestRepoMock.Object,
                _offerRepoMock.Object,
                _notificationMock.Object,
                _configMock.Object,
                logger.Object);
        }

        [Fact]
        public async Task CreateCheckoutSessionAsync_RequestNotFound_ThrowsKeyNotFoundException()
        {
            _requestRepoMock.Setup(r => r.GetByIdAsync(99))
                .ReturnsAsync((StudyRequest?)null);

            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                _service.CreateCheckoutSessionAsync(99, "user1"));
        }

        [Fact]
        public async Task CreateCheckoutSessionAsync_WrongStudent_ThrowsUnauthorizedAccessException()
        {
            var request = new StudyRequest
            {
                Id = 1,
                RequesterId = "ownerUser",
                Status = RequestStatus.Accepted,
                PaymentStatus = PaymentStatus.Unpaid
            };
            _requestRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(request);

            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                _service.CreateCheckoutSessionAsync(1, "differentUser"));
        }

        [Fact]
        public async Task CreateCheckoutSessionAsync_RequestNotAccepted_ThrowsInvalidOperationException()
        {
            var request = new StudyRequest
            {
                Id = 1,
                RequesterId = "user1",
                Status = RequestStatus.Pending,
                PaymentStatus = PaymentStatus.Unpaid
            };
            _requestRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(request);

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _service.CreateCheckoutSessionAsync(1, "user1"));
        }

        [Fact]
        public async Task CreateCheckoutSessionAsync_AlreadyPaid_ThrowsInvalidOperationException()
        {
            var request = new StudyRequest
            {
                Id = 1,
                RequesterId = "user1",
                Status = RequestStatus.Accepted,
                PaymentStatus = PaymentStatus.Paid
            };
            _requestRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(request);

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _service.CreateCheckoutSessionAsync(1, "user1"));
        }
    }
}
