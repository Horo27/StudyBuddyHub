using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudyBuddyHub.Api.DTOs;
using StudyBuddyHub.Core.Interfaces;
using System.Security.Claims;

namespace StudyBuddyHub.Api.Controllers
{
    [ApiController]
    [Route("api/favorites")]
    [Authorize]
    public class FavoritesController : ControllerBase
    {
        private readonly IFavoriteOfferService _favoriteService;

        public FavoritesController(IFavoriteOfferService favoriteService)
        {
            _favoriteService = favoriteService;
        }

        [HttpGet]
        public async Task<IActionResult> GetFavorites()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var favorites = await _favoriteService.GetFavoritesAsync(userId);

            var result = favorites.Select(f => new FavoriteOfferDto
            {
                FavoriteId = f.Id,
                OfferId = f.OfferId,
                OfferTitle = f.Offer.Title,
                SubjectName = f.Offer.Subject?.Name ?? string.Empty,
                OwnerName = $"{f.Offer.Owner?.FirstName} {f.Offer.Owner?.LastName}".Trim(),
                Price = f.Offer.Price
            });

            return Ok(result);
        }

        [HttpPost("{offerId}")]
        public async Task<IActionResult> AddFavorite(int offerId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            await _favoriteService.AddFavoriteAsync(userId, offerId);
            return Created($"/api/favorites/{offerId}", null);
        }

        [HttpDelete("{offerId}")]
        public async Task<IActionResult> RemoveFavorite(int offerId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            await _favoriteService.RemoveFavoriteAsync(userId, offerId);
            return NoContent();
        }
    }
}
