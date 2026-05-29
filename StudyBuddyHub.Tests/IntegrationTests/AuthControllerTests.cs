using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;
using System.Threading.Tasks;
using System.Net.Http;
using System.Text;
using Newtonsoft.Json;
using StudyBuddyHub.Api.DTOs;
using System.Net;

namespace StudyBuddyHub.Tests.IntegrationTests
{
    public class AuthControllerTests : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory<Program> _factory;

        public AuthControllerTests(CustomWebApplicationFactory<Program> factory)
        {
            _factory = factory;
            _client = factory.CreateClient();
            factory.EnsureSeededAsync().GetAwaiter().GetResult();
        }

        [Fact]
        public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
        {
            var loginDto = new LoginRequestDto
            {
                Email = "wrong@test.com",
                Password = "WrongPassword1!"
            };

            var content = new StringContent(JsonConvert.SerializeObject(loginDto), Encoding.UTF8, "application/json");

            var response = await _client.PostAsync("/api/Auth/login", content);

            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task Login_WithValidCredentials_ReturnsTokenAndUser()
        {
            var loginDto = new LoginRequestDto
            {
                Email = "admin@studybuddy.com",
                Password = "Admin123!"
            };

            var content = new StringContent(JsonConvert.SerializeObject(loginDto), Encoding.UTF8, "application/json");

            var response = await _client.PostAsync("/api/Auth/login", content);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var body = await response.Content.ReadAsStringAsync();
            var result = JsonConvert.DeserializeObject<AuthResponseDto>(body);

            Assert.NotNull(result);
            Assert.False(string.IsNullOrWhiteSpace(result!.Token));
            Assert.NotNull(result.User);
        }

        [Fact]
        public async Task Register_WithNewEmail_ReturnsToken()
        {
            var registerDto = new RegisterRequestDto
            {
                Email = $"newuser_{Guid.NewGuid():N}@test.com",
                Password = "Test123!",
                FirstName = "Test",
                LastName = "User"
            };

            var content = new StringContent(JsonConvert.SerializeObject(registerDto), Encoding.UTF8, "application/json");

            var response = await _client.PostAsync("/api/Auth/register", content);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var body = await response.Content.ReadAsStringAsync();
            var result = JsonConvert.DeserializeObject<AuthResponseDto>(body);

            Assert.NotNull(result);
            Assert.False(string.IsNullOrWhiteSpace(result!.Token));
        }

        [Fact]
        public async Task Register_WithDuplicateEmail_ReturnsBadRequest()
        {
            var email = $"dup_{Guid.NewGuid():N}@test.com";
            var registerDto = new RegisterRequestDto
            {
                Email = email,
                Password = "Test123!",
                FirstName = "Dup",
                LastName = "User"
            };

            var content1 = new StringContent(JsonConvert.SerializeObject(registerDto), Encoding.UTF8, "application/json");
            await _client.PostAsync("/api/Auth/register", content1);

            var content2 = new StringContent(JsonConvert.SerializeObject(registerDto), Encoding.UTF8, "application/json");
            var response = await _client.PostAsync("/api/Auth/register", content2);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }
}
