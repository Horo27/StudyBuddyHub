using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using StudyBuddyHub.Api.Hubs;
using StudyBuddyHub.Api.Middleware;
using StudyBuddyHub.Api.Services;
using StudyBuddyHub.Core.Entities;
using StudyBuddyHub.Core.Interfaces;
using StudyBuddyHub.Infrastructure.Data;
using StudyBuddyHub.Infrastructure.Repositories;
using StudyBuddyHub.Infrastructure.Services;
using System.Text;

// Required for Npgsql 6+: treat DateTime as UTC without explicit Kind annotation
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "StudyBuddy Hub API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

builder.Configuration.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Host=localhost;Port=5432;Database=StudyBuddyHubDb;Username=postgres;Password=postgres"));

// Use AddIdentityCore so it does NOT register cookie auth schemes.
// AddIdentity would set DefaultAuthenticateScheme = "Identity.Application" (cookie),
// conflicting with the JWT Bearer scheme we set below.
builder.Services.AddIdentityCore<ApplicationUser>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequiredLength = 6;
})
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders()
    .AddSignInManager();

var jwtSecret = builder.Configuration["Jwt:Key"] ?? "superSecretKey@345superSecretKey@345";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "StudyBuddyHub";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "StudyBuddyHub";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
    };
    // Allow SignalR to receive JWT from query string
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddSignalR();

builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IStudyOfferRepository, StudyOfferRepository>();
builder.Services.AddScoped<IStudyRequestRepository, StudyRequestRepository>();
builder.Services.AddScoped<ISubjectRepository, SubjectRepository>();
builder.Services.AddScoped<IFavoriteOfferRepository, FavoriteOfferRepository>();

builder.Services.AddScoped<IStudyOfferService, StudyOfferService>();
builder.Services.AddScoped<IStudyRequestService, StudyRequestService>();
builder.Services.AddScoped<IFavoriteOfferService, FavoriteOfferService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<INotificationService, SignalRNotificationService>();

// Configure CORS - allow frontend (default localhost:4200) and enable credentials for dev
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            var frontendUrl = builder.Configuration["FrontendUrl"] ?? "http://localhost:4200";
            policy.WithOrigins(frontendUrl, "https://localhost:4200")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<ApplicationDbContext>();
    var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
    var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

    await SeedData.InitializeAsync(context, userManager, roleManager);
}

// Configure the HTTP request pipeline.
app.UseMiddleware<ExceptionMiddleware>();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "StudyBuddy Hub API v1");
});

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");

app.Run();
