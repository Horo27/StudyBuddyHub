using Newtonsoft.Json;
using StudyBuddyHub.Api.DTOs;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace StudyBuddyHub.Tests
{
    public static class TestAuthHelper
    {
        public static async Task<string> GetTokenAsync(HttpClient client, string email, string password)
        {
            var loginDto = new LoginRequestDto { Email = email, Password = password };
            var content = new StringContent(JsonConvert.SerializeObject(loginDto), Encoding.UTF8, "application/json");
            var response = await client.PostAsync("/api/Auth/login", content);
            response.EnsureSuccessStatusCode();
            var body = await response.Content.ReadAsStringAsync();
            var result = JsonConvert.DeserializeObject<AuthResponseDto>(body);
            return result!.Token;
        }

        public static async Task<string> RegisterAndGetTokenAsync(HttpClient client, string? email = null)
        {
            var registerDto = new RegisterRequestDto
            {
                Email = email ?? $"testuser_{System.Guid.NewGuid():N}@test.com",
                Password = "Test123!",
                FirstName = "Test",
                LastName = "User"
            };
            var content = new StringContent(JsonConvert.SerializeObject(registerDto), Encoding.UTF8, "application/json");
            var response = await client.PostAsync("/api/Auth/register", content);
            response.EnsureSuccessStatusCode();
            var body = await response.Content.ReadAsStringAsync();
            var result = JsonConvert.DeserializeObject<AuthResponseDto>(body);
            return result!.Token;
        }
    }
}
