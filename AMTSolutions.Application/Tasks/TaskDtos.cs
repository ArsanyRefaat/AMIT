using AMTSolutions.Core.Enums;

namespace AMTSolutions.Application.Tasks;

public sealed record TaskDto(
    int Id,
    int ProjectId,
    string Title,
    string? Description,
    Core.Enums.TaskStatus Status,
    string? AssignedToUserId,
    DateTime? DueDateUtc
);

public sealed record CreateTaskRequest(
    int ProjectId,
    string Title,
    string? Description,
    Core.Enums.TaskStatus Status,
    string? AssignedToUserId,
    DateTime? DueDateUtc
);

public sealed record UpdateTaskRequest(
    int ProjectId,
    string Title,
    string? Description,
    Core.Enums.TaskStatus Status,
    string? AssignedToUserId,
    DateTime? DueDateUtc
);

