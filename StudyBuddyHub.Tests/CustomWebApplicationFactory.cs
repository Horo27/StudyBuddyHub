using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using StudyBuddyHub.Core.Entities;
using StudyBuddyHub.Infrastructure.Data;
using System.Linq;
using System.Threading.Tasks;

namespace StudyBuddyHub.Tests
{
    public class CustomWebApplicationFactory<TProgram> : WebApplicationFactory<TProgram> where TProgram : class
    {
        private bool _seeded = false;
        private readonly SemaphoreSlim _seedLock = new SemaphoreSlim(1, 1);

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");

            builder.ConfigureServices(services =>
            {
                var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
                if (descriptor != null)
                    services.Remove(descriptor);

                var connectionDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(System.Data.Common.DbConnection));
                if (connectionDescriptor != null)
                    services.Remove(connectionDescriptor);

                services.AddEntityFrameworkInMemoryDatabase();

                var serviceProvider = new ServiceCollection()
                    .AddEntityFrameworkInMemoryDatabase()
                    .BuildServiceProvider();

                services.AddDbContext<ApplicationDbContext>(options =>
                {
                    options.UseInMemoryDatabase("InMemoryDbForTesting")
                           .UseInternalServiceProvider(serviceProvider);
                });
            });
        }

        public async Task EnsureSeededAsync()
        {
            await _seedLock.WaitAsync();
            try
            {
                if (_seeded) return;
                _seeded = true;

                using var scope = Services.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
                var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

                await context.Database.EnsureCreatedAsync();

                foreach (var role in new[] { "Admin", "Student" })
                {
                    if (!await roleManager.RoleExistsAsync(role))
                        await roleManager.CreateAsync(new IdentityRole(role));
                }

                if (!userManager.Users.Any())
                {
                    var admin = new ApplicationUser
                    {
                        UserName = "admin@studybuddy.com",
                        Email = "admin@studybuddy.com",
                        FirstName = "System",
                        LastName = "Admin",
                        Faculty = "Administration",
                        University = "StudyBuddy Hub"
                    };
                    await userManager.CreateAsync(admin, "Admin123!");
                    await userManager.AddToRoleAsync(admin, "Admin");
                }
            }
            finally
            {
                _seedLock.Release();
            }
        }
    }
}
