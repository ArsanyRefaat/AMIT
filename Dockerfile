# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution and projects
COPY ["AMTSolutions.sln", "."]
COPY ["AMTSolutions.Api/AMTSolutions.Api.csproj", "AMTSolutions.Api/"]
COPY ["AMTSolutions.Application/AMTSolutions.Application.csproj", "AMTSolutions.Application/"]
COPY ["AMTSolutions.Core/AMTSolutions.Core.csproj", "AMTSolutions.Core/"]
COPY ["AMTSolutions.Infrastructure/AMTSolutions.Infrastructure.csproj", "AMTSolutions.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "AMTSolutions.Api/AMTSolutions.Api.csproj"

# Copy source
COPY . .

# Publish
RUN dotnet publish "AMTSolutions.Api/AMTSolutions.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "AMTSolutions.Api.dll"]
