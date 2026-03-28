namespace AMTSolutions.Application.Projects;

public sealed record ProjectDto(
    int Id,
    int CustomerId,
    string CustomerName,
    string Name,
    string? Description,
    decimal Budget,
    decimal? EstimatedCost,
    decimal ProgressPercent,
    DateTime? StartDateUtc,
    DateTime? EndDateUtc,
    bool ShowOnPublicWebsite,
    string? WebsiteCategory
);

public sealed record CreateProjectRequest(
    int CustomerId,
    string Name,
    string? Description,
    decimal Budget,
    DateTime? StartDateUtc,
    DateTime? EndDateUtc,
    bool ShowOnPublicWebsite = false,
    string? WebsiteCategory = null
);

/// <summary>Optional fields: only properties present in JSON are applied.</summary>
public sealed record PatchProjectWebsiteRequest
{
    public bool? ShowOnPublicWebsite { get; init; }
    public string? WebsiteCategory { get; init; }
}

public sealed record PublicPortfolioItemDto(
    int Id,
    string Slug,
    string Title,
    string Category,
    string ClientName,
    string ShortDescription,
    IReadOnlyList<PublicPortfolioResultDto> Results);

public sealed record PublicPortfolioResultDto(string Metric, string Value);

public sealed record PublicPortfolioDetailDto(
    int Id,
    string Slug,
    string Title,
    string Category,
    string ClientName,
    string ShortDescription,
    string? FullDescription,
    IReadOnlyList<PublicPortfolioResultDto> Results,
    string DateLabel);

