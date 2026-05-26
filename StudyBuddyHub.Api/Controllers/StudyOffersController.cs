using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudyBuddyHub.Api.DTOs;
using StudyBuddyHub.Api.Mappings;
using StudyBuddyHub.Core.Entities;
using StudyBuddyHub.Core.Interfaces;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace StudyBuddyHub.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudyOffersController : ControllerBase
    {
        private readonly IStudyOfferService _offerService;

        public StudyOffersController(IStudyOfferService offerService)
        {
            _offerService = offerService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllOffers([FromQuery] int? subjectId, [FromQuery] string? search, [FromQuery] decimal? minPrice, [FromQuery] decimal? maxPrice, [FromQuery] bool? isActive = true)
        {
            var offers = await _offerService.GetAllOffersAsync(subjectId, search, minPrice, maxPrice, isActive);
            var dtos = offers.Select(o => o.ToListDto());
            return Ok(dtos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOfferById(int id)
        {
            var offer = await _offerService.GetOfferByIdAsync(id);
            if (offer == null) return NotFound();

            return Ok(offer.ToDetailsDto());
        }

        [Authorize]
        [HttpGet("mine")]
        public async Task<IActionResult> GetMyOffers()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if(userId == null) return Unauthorized();

            var offers = await _offerService.GetMyOffersAsync(userId);
            var dtos = offers.Select(o => o.ToListDto());
            return Ok(dtos);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateOffer(StudyOfferCreateDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Console.WriteLine(userId);
            if (userId == null) return Unauthorized();

            var offer = new StudyOffer
            {
                Title = dto.Title,
                Description = dto.Description,
                Level = dto.Level,
                SessionType = dto.SessionType,
                Price = dto.Price,
                Location = dto.Location,
                SubjectId = dto.SubjectId
            };

            var createdOffer = await _offerService.CreateOfferAsync(offer, userId);
            return CreatedAtAction(nameof(GetOfferById), new { id = createdOffer.Id }, createdOffer.ToDetailsDto());
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOffer(int id, StudyOfferUpdateDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAdmin = User.IsInRole("Admin");

            if (userId == null) return Unauthorized();

            var updateOffer = new StudyOffer
            {
                Title = dto.Title ?? "",
                Description = dto.Description ?? "",
                Level = dto.Level ?? Core.Enums.Level.Beginner,
                SessionType = dto.SessionType ?? Core.Enums.SessionType.Online,
                Price = dto.Price ?? 0,
                Location = dto.Location,
                IsActive = dto.IsActive ?? true,
                SubjectId = dto.SubjectId ?? 0
            };

            try
            {
                await _offerService.UpdateOfferAsync(id, updateOffer, userId, isAdmin);
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (System.Collections.Generic.KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOffer(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAdmin = User.IsInRole("Admin");

            if (userId == null) return Unauthorized();

            try
            {
                await _offerService.DeleteOfferAsync(id, userId, isAdmin);
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (System.Collections.Generic.KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}