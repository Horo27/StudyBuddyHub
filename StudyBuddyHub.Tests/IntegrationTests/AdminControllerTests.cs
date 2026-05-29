using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Xunit;

namespace StudyBuddyHub.Tests.IntegrationTests
{
    public class AdminControllerTests : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public AdminControllerTests(CustomWebApplicationFactory<Program> factory)
        {
            _client = factory.CreateClient();
            factory.EnsureSeededAsync().GetAwaiter().GetResult();
        }

        [Fact]
        public async Task GetStats_Unauthenticated_Returns401()
        {
            var response = await _client.GetAsync("/api/admin/stats");
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task GetStats_AuthenticatedAsStudent_Returns403()
        {
            var token = await TestAuthHelper.RegisterAndGetTokenAsync(_client);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _client.GetAsync("/api/admin/stats");

            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);

            _client.DefaultRequestHeaders.Authorization = null;
        }

        [Fact]
        public async Task GetStats_AuthenticatedAsAdmin_Returns200()
        {
            var token = await TestAuthHelper.GetTokenAsync(_client, "admin@studybuddy.com", "Admin123!");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _client.GetAsync("/api/admin/stats");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            _client.DefaultRequestHeaders.Authorization = null;
        }
    }
}
