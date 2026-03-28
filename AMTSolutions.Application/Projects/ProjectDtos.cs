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
    DateTime? EndDateUtc
);

public sealed record CreateProjectRequest(
    int CustomerId,
    string Name,
    string? Description,
    decimal Budget,
    DateTime? StartDateUtc,
    DateTime? EndDateUtc
);

