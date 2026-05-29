using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Stripe;
using Stripe.Checkout;
using StudyBuddyHub.Core.Enums;
using StudyBuddyHub.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StudyBuddyHub.Infrastructure.Services
{
    public class StripePaymentService : IPaymentService
    {
        private readonly IStudyRequestRepository _requestRepository;
        private readonly IStudyOfferRepository _offerRepository;
        private readonly INotificationService _notificationService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<StripePaymentService> _logger;

        public StripePaymentService(
            IStudyRequestRepository requestRepository,
            IStudyOfferRepository offerRepository,
            INotificationService notificationService,
            IConfiguration configuration,
            ILogger<StripePaymentService> logger)
        {
            _requestRepository = requestRepository;
            _offerRepository = offerRepository;
            _notificationService = notificationService;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<string> CreateCheckoutSessionAsync(int requestId, string studentId)
        {
            var request = await _requestRepository.GetByIdAsync(requestId)
                ?? throw new KeyNotFoundException("Request not found.");

            if (request.RequesterId != studentId)
                throw new UnauthorizedAccessException("Not authorized to pay for this request.");

            if (request.Status != RequestStatus.Accepted)
                throw new InvalidOperationException("Only accepted requests can be paid.");

            if (request.PaymentStatus == PaymentStatus.Paid)
                throw new InvalidOperationException("This request is already paid.");

            var offer = request.Offer;
            var frontendUrl = _configuration["FrontendUrl"] ?? "https://StudyBuddyHub.student-dev.ro";

            var options = new SessionCreateOptions
            {
                Mode = "payment",
                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = "ron",
                            UnitAmount = (long)(offer.Price * 100),
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = offer.Title,
                                Description = $"Sesiune de tutoring — {offer.Subject?.Name ?? "Studiu"}"
                            }
                        },
                        Quantity = 1
                    }
                },
                SuccessUrl = $"{frontendUrl}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
                CancelUrl = $"{frontendUrl}/payment/cancel",
                Metadata = new Dictionary<string, string>
                {
                    { "requestId", requestId.ToString() },
                    { "offerId", offer.Id.ToString() },
                    { "studentId", studentId }
                }
            };

            var service = new SessionService();
            var session = await service.CreateAsync(options);

            request.StripeSessionId = session.Id;
            await _requestRepository.UpdateAsync(request);

            _logger.LogInformation("Stripe checkout session {SessionId} created for request {RequestId}", session.Id, requestId);
            return session.Url;
        }

        public async Task HandleWebhookAsync(string payload, string stripeSignature)
        {
            var webhookSecret = _configuration["Stripe__WebhookSecret"]
                ?? _configuration["Stripe:WebhookSecret"]
                ?? throw new InvalidOperationException("Stripe webhook secret not configured.");

            Event stripeEvent;
            try
            {
                stripeEvent = EventUtility.ConstructEvent(
                    payload,
                    stripeSignature,
                    webhookSecret,
                    throwOnApiVersionMismatch: false);
            }
            catch (StripeException ex)
            {
                _logger.LogWarning("Stripe webhook validation failed: {Message}", ex.Message);
                throw;
            }

            if (stripeEvent.Type != "checkout.session.completed")
                return;

            var session = stripeEvent.Data.Object as Session;
            if (session == null) return;

            if (!session.Metadata.TryGetValue("requestId", out var requestIdStr)
                || !int.TryParse(requestIdStr, out var requestId))
                return;

            var request = await _requestRepository.GetByIdAsync(requestId);
            if (request == null)
            {
                _logger.LogWarning("Webhook: request {RequestId} not found", requestId);
                return;
            }

            request.PaymentStatus = PaymentStatus.Paid;
            await _requestRepository.UpdateAsync(request);

            var offer = await _offerRepository.GetByIdAsync(request.OfferId);
            if (offer != null)
            {
                offer.IsActive = false;
                await _offerRepository.UpdateAsync(offer);

                // Cancel all other accepted requests for the same offer
                var otherRequests = await _requestRepository.GetByOfferIdAsync(offer.Id);
                foreach (var other in otherRequests.Where(r =>
                    r.Id != requestId && r.Status == RequestStatus.Accepted))
                {
                    other.Status = RequestStatus.Cancelled;
                    await _requestRepository.UpdateAsync(other);

                    await _notificationService.NotifyUserAsync(
                        other.RequesterId,
                        "session_taken",
                        "Un alt student a rezervat această sesiune.",
                        new { offerId = offer.Id, offerTitle = offer.Title });
                }

                await _notificationService.NotifyUserAsync(
                    offer.OwnerId,
                    "session_paid",
                    "Sesiunea a fost rezervată și plătită!",
                    new { requestId, offerId = offer.Id, offerTitle = offer.Title });
            }

            _logger.LogInformation("Webhook processed: request {RequestId} marked Paid", requestId);
        }
    }
}
