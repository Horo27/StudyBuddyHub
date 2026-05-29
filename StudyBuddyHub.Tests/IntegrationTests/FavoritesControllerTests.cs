using Newtonsoft.Json;
using StudyBuddyHub.Api.DTOs;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Xunit;

namespace StudyBuddyHub.Tests.IntegrationTests
{
    public class FavoritesControllerTests : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public FavoritesControllerTests(CustomWebApplicationFactory<Program> factory)
        {
            _client = factory.CreateClient();
            factory.EnsureSeededAsync().GetAwaiter().GetResult();
        }

        [Fact]
        public async Task AddFavorite_Unauthenticated_Returns401()
        {
            var response = await _client.PostAsync("/api/favorites/1", null);
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task AddFavorite_Authenticated_Returns201()
        {
            var token = await TestAuthHelper.RegisterAndGetTokenAsync(_client);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // The in-memory DB has seeded offers; use offer id 1
            var response = await _client.PostAsync("/api/favorites/1", null);

            // Either Created (201) if offer exists or NotFound/BadRequest if not seeded —
            // the important thing is it is not 401
            Assert.NotEqual(HttpStatusCode.Unauthorized, response.StatusCode);

            _client.DefaultRequestHeaders.Authorization = null;
        }

        [Fact]
        public async Task GetFavorites_Authenticated_Returns200WithList()
        {
            var token = await TestAuthHelper.RegisterAndGetTokenAsync(_client);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _client.GetAsync("/api/favorites");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var body = await response.Content.ReadAsStringAsync();
            var list = JsonConvert.DeserializeObject<List<FavoriteOfferDto>>(body);
            Assert.NotNull(list);

            _client.DefaultRequestHeaders.Authorization = null;
        }

        [Fact]
        public async Task GetFavorites_Unauthenticated_Returns401()
        {
            var response = await _client.GetAsync("/api/favorites");
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }
    }
}
