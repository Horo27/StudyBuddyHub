using Newtonsoft.Json;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace StudyBuddyHub.Tests.IntegrationTests
{
    public class PaymentsControllerTests : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public PaymentsControllerTests(CustomWebApplicationFactory<Program> factory)
        {
            _client = factory.CreateClient();
            factory.EnsureSeededAsync().GetAwaiter().GetResult();
        }

        [Fact]
        public async Task CreateCheckout_Unauthenticated_Returns401()
        {
            var body = new StringContent(
                JsonConvert.SerializeObject(new { requestId = 1 }),
                Encoding.UTF8,
                "application/json");

            var response = await _client.PostAsync("/api/payments/create-checkout", body);

            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task CreateCheckout_RequestNotFound_Returns404()
        {
            var token = await TestAuthHelper.RegisterAndGetTokenAsync(_client);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var body = new StringContent(
                JsonConvert.SerializeObject(new { requestId = 999999 }),
                Encoding.UTF8,
                "application/json");

            var response = await _client.PostAsync("/api/payments/create-checkout", body);

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

            _client.DefaultRequestHeaders.Authorization = null;
        }

        [Fact]
        public async Task Webhook_InvalidStripeSignature_Returns400()
        {
            var request = new HttpRequestMessage(HttpMethod.Post, "/api/payments/webhook");
            request.Content = new StringContent("{}", Encoding.UTF8, "application/json");
            request.Headers.Add("Stripe-Signature", "invalid_signature_value");

            var response = await _client.SendAsync(request);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }
}
