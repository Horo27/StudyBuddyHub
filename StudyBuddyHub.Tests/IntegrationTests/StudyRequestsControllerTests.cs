using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;
using System.Net;
using System.Threading.Tasks;

namespace StudyBuddyHub.Tests.IntegrationTests
{
    public class StudyRequestsControllerTests : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly System.Net.Http.HttpClient _client;

        public StudyRequestsControllerTests(CustomWebApplicationFactory<Program> factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task GetSentRequests_WithoutToken_ReturnsUnauthorized()
        {
            var response = await _client.GetAsync("/api/StudyRequests/sent");
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }
    }
}
