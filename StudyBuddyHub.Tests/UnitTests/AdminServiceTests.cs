using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using StudyBuddyHub.Core.Entities;
using StudyBuddyHub.Core.Enums;
using StudyBuddyHub.Infrastructure.Data;
using StudyBuddyHub.Infrastructure.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace StudyBuddyHub.Tests.UnitTests
{
    public class AdminServiceTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ServiceProvider _serviceProvider;
        private readonly AdminService _service;

        public AdminServiceTests()
        {
            var efProvider = new ServiceCollection()
                .AddEntityFrameworkInMemoryDatabase()
                .BuildServiceProvider();

            var services = new ServiceCollection();
            services.AddEntityFrameworkInMemoryDatabase();
            services.AddDbContext<ApplicationDbContext>(opts =>
                opts.UseInMemoryDatabase(Guid.NewGuid().ToString())
                    .UseInternalServiceProvider(efProvider));

            services.AddDataProtection();
            services.AddLogging();

            services.AddIdentityCore<ApplicationUser>()
                .AddRoles<IdentityRole>()
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders();

            _serviceProvider = services.BuildServiceProvider();
            _context = _serviceProvider.GetRequiredService<ApplicationDbContext>();
            _userManager = _serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

            var logger = new Mock<ILogger<AdminService>>();
            _service = new AdminService(_context, _userManager, logger.Object);
        }

        public void Dispose()
        {
            _context.Dispose();
            (_serviceProvider as IDisposable)?.Dispose();
        }

        [Fact]
        public async Task GetStatsAsync_ReturnsCorrectCounts()
        {
            // Seed two users
            await _userManager.CreateAsync(new ApplicationUser { UserName = "u1@test.com", Email = "u1@test.com", FirstName = "A", LastName = "B" }, "Pass1!");
            await _userManager.CreateAsync(new ApplicationUser { UserName = "u2@test.com", Email = "u2@test.com", FirstName = "C", LastName = "D" }, "Pass1!");

            // Seed offers and requests (FK constraints don't apply to in-memory DB)
            _context.StudyOffers.AddRange(
                new StudyOffer { Title = "Active", IsActive = true, OwnerId = "x" },
                new StudyOffer { Title = "Inactive", IsActive = false, OwnerId = "y" }
            );
            _context.StudyRequests.AddRange(
                new StudyRequest { Status = RequestStatus.Pending, RequesterId = "r1", OfferId = 0 },
                new StudyRequest { Status = RequestStatus.Accepted, RequesterId = "r2", OfferId = 0 }
            );
            await _context.SaveChangesAsync();

            var (totalUsers, activeOffers, pendingRequests, totalOffers, totalRequests) =
                await _service.GetStatsAsync();

            Assert.Equal(2, totalUsers);
            Assert.Equal(1, activeOffers);
            Assert.Equal(1, pendingRequests);
            Assert.Equal(2, totalOffers);
            Assert.Equal(2, totalRequests);
        }

        [Fact]
        public async Task DeleteOfferAsync_ExistingOffer_RemovesIt()
        {
            var offer = new StudyOffer { Title = "To Delete", OwnerId = "u1" };
            _context.StudyOffers.Add(offer);
            await _context.SaveChangesAsync();

            await _service.DeleteOfferAsync(offer.Id);

            Assert.Null(await _context.StudyOffers.FindAsync(offer.Id));
        }

        [Fact]
        public async Task DeleteOfferAsync_NotFound_ThrowsKeyNotFoundException()
        {
            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                _service.DeleteOfferAsync(999));
        }

        [Fact]
        public async Task UpdateUserRoleAsync_InvalidRole_ThrowsInvalidOperationException()
        {
            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _service.UpdateUserRoleAsync("userId", "SuperAdmin"));
        }

        [Fact]
        public async Task UpdateUserRoleAsync_UserNotFound_ThrowsKeyNotFoundException()
        {
            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                _service.UpdateUserRoleAsync("nonexistent-id", "Student"));
        }
    }
}
