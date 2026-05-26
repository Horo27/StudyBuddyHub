using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudyBuddyHub.Api.DTOs;
using StudyBuddyHub.Api.Mappings;
using StudyBuddyHub.Core.Entities;
using StudyBuddyHub.Core.Interfaces;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace StudyBuddyHub.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StudyRequestsController : ControllerBase
    {
        private readonly IStudyRequestService _requestService;

        public StudyRequestsController(IStudyRequestService requestService)
        {
            _requestService = requestService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateRequest([FromBody] StudyRequestCreateDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var request = new StudyRequest
            {
                OfferId = dto.OfferId,
                Message = dto.Message
            };

            try
            {
                var createdRequest = await _requestService.CreateRequestAsync(request, userId);
                return CreatedAtAction(nameof(GetSentRequests), new { }, createdRequest.ToListDto());
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("sent")]
        public async Task<IActionResult> GetSentRequests()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var requests = await _requestService.GetSentRequestsAsync(userId);
            var dtos = requests.Select(r => r.ToListDto());
            return Ok(dtos);
        }

        [HttpGet("received")]
        public async Task<IActionResult> GetReceivedRequests()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var requests = await _requestService.GetReceivedRequestsAsync(userId);
            var dtos = requests.Select(r => r.ToListDto());
            return Ok(dtos);
        }

        [HttpPatch("{id}/accept")]
        public async Task<IActionResult> AcceptRequest(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            try
            {
                await _requestService.AcceptRequestAsync(id, userId);
                return NoContent();
            }
            catch (System.UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (System.Collections.Generic.KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPatch("{id}/reject")]
        public async Task<IActionResult> RejectRequest(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            try
            {
                await _requestService.RejectRequestAsync(id, userId);
                return NoContent();
            }
            catch (System.UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (System.Collections.Generic.KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPatch("{id}/cancel")]
        public async Task<IActionResult> CancelRequest(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            try
            {
                await _requestService.CancelRequestAsync(id, userId);
                return NoContent();
            }
            catch (System.UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (System.Collections.Generic.KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
