using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using StudyBuddyHub.Api.DTOs;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;

namespace StudyBuddyHub.Tests.IntegrationTests
{
    public class StudyOffersControllerTests : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public StudyOffersControllerTests(CustomWebApplicationFactory<Program> factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task GetAllOffers_ReturnsSuccess()
        {
            var response = await _client.GetAsync("/api/StudyOffers");
            response.EnsureSuccessStatusCode();

            var responseString = await response.Content.ReadAsStringAsync();
            var offers = JsonConvert.DeserializeObject<List<StudyOfferListDto>>(responseString);

            Assert.NotNull(offers);
        }

        [Fact]
        public async Task GetMyOffers_WithoutToken_ReturnsUnauthorized()
        {
            var response = await _client.GetAsync("/api/StudyOffers/mine");
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }
    }
}
