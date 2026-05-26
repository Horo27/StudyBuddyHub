# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files first so NuGet restore is cached as its own layer.
# Only re-runs when a .csproj changes, not on every source change.
COPY StudyBuddyHub.Core/StudyBuddyHub.Core.csproj                         StudyBuddyHub.Core/
COPY StudyBuddyHub.Infrastructure/StudyBuddyHub.Infrastructure.csproj     StudyBuddyHub.Infrastructure/
COPY StudyBuddyHub.Api/StudyBuddyHub.Api.csproj                           StudyBuddyHub.Api/

RUN dotnet restore StudyBuddyHub.Api/StudyBuddyHub.Api.csproj

# Copy source (bin/ and obj/ are excluded via .dockerignore)
COPY StudyBuddyHub.Core/           StudyBuddyHub.Core/
COPY StudyBuddyHub.Infrastructure/ StudyBuddyHub.Infrastructure/
COPY StudyBuddyHub.Api/            StudyBuddyHub.Api/

RUN dotnet publish StudyBuddyHub.Api/StudyBuddyHub.Api.csproj \
    --configuration Release \
    --output /app/publish \
    --no-restore

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# Npgsql needs libgssapi for GSSAPI/Kerberos support (logs error without it)
RUN apt-get update && apt-get install -y --no-install-recommends libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

# .NET 8+ containers listen on 8080 by default (not 5117)
EXPOSE 8080

ENTRYPOINT ["dotnet", "StudyBuddyHub.Api.dll"]
