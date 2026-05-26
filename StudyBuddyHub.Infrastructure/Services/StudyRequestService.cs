using Microsoft.Extensions.Logging;
using StudyBuddyHub.Core.Entities;
using StudyBuddyHub.Core.Enums;
using StudyBuddyHub.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StudyBuddyHub.Infrastructure.Services
{
    public class StudyRequestService : IStudyRequestService
    {
        private readonly IStudyRequestRepository _requestRepository;
        private readonly IStudyOfferRepository _offerRepository;
        private readonly ILogger<StudyRequestService> _logger;

        public StudyRequestService(IStudyRequestRepository requestRepository, IStudyOfferRepository offerRepository, ILogger<StudyRequestService> logger)
        {
            _requestRepository = requestRepository;
            _offerRepository = offerRepository;
            _logger = logger;
        }

        public async Task<StudyRequest> CreateRequestAsync(StudyRequest request, string userId)
        {
            var offer = await _offerRepository.GetByIdAsync(request.OfferId);
            if (offer == null)
            {
                throw new KeyNotFoundException("Offer not found.");
            }
            if (offer.OwnerId == userId)
            {
                throw new InvalidOperationException("You cannot request your own offer.");
            }

            var existingRequests = await _requestRepository.GetByRequesterIdAsync(userId);
            if (existingRequests.Any(r => r.OfferId == request.OfferId && (r.Status == RequestStatus.Pending || r.Status == RequestStatus.Accepted)))
            {
                throw new InvalidOperationException("You already have an active request for this offer.");
            }

            request.RequesterId = userId;
            request.CreatedAt = DateTime.UtcNow;
            request.Status = RequestStatus.Pending;

            var created = await _requestRepository.AddAsync(request);
            _logger.LogInformation("User {UserId} created request {RequestId} for offer {OfferId}", userId, created.Id, request.OfferId);
            return created;
        }

        public async Task<IEnumerable<StudyRequest>> GetSentRequestsAsync(string userId)
        {
            return await _requestRepository.GetByRequesterIdAsync(userId);
        }

        public async Task<IEnumerable<StudyRequest>> GetReceivedRequestsAsync(string ownerId)
        {
            return await _requestRepository.GetByOfferOwnerIdAsync(ownerId);
        }

        public async Task AcceptRequestAsync(int id, string ownerId)
        {
            var request = await _requestRepository.GetByIdAsync(id);
            if (request == null)
            {
                throw new KeyNotFoundException("Request not found.");
            }
            if (request.Offer.OwnerId != ownerId)
            {
                _logger.LogWarning("User {UserId} unauthorized to accept request {RequestId}", ownerId, id);
                throw new UnauthorizedAccessException("Not authorized to manage this request.");
            }

            request.Status = RequestStatus.Accepted;
            await _requestRepository.UpdateAsync(request);
            _logger.LogInformation("Request {RequestId} accepted by owner {OwnerId}", id, ownerId);
        }

        public async Task RejectRequestAsync(int id, string ownerId)
        {
            var request = await _requestRepository.GetByIdAsync(id);
            if (request == null)
            {
                throw new KeyNotFoundException("Request not found.");
            }
            if (request.Offer.OwnerId != ownerId)
            {
                throw new UnauthorizedAccessException("Not authorized to manage this request.");
            }

            request.Status = RequestStatus.Rejected;
            await _requestRepository.UpdateAsync(request);
        }

        public async Task CancelRequestAsync(int id, string requesterId)
        {
            var request = await _requestRepository.GetByIdAsync(id);
            if (request == null)
            {
                throw new KeyNotFoundException("Request not found.");
            }
            if (request.RequesterId != requesterId)
            {
                throw new UnauthorizedAccessException("Not authorized to cancel this request.");
            }

            request.Status = RequestStatus.Cancelled;
            await _requestRepository.UpdateAsync(request);
        }
    }
}