using AMTSolutions.Core.Enums;

namespace AMTSolutions.Application.Leads;

public sealed record LeadDto(
    int Id,
    string Name,
    string Email,
    string? Phone,
    string? Company,
    string? Source,
    LeadStage Stage,
    string? AssignedStaffUserId = null
);

public sealed record CreateLeadRequest(
    string Name,
    string Email,
    string? Phone,
    string? Company,
    string? Source,
    string? Notes,
    string? AssignedStaffUserId = null
);

public sealed record UpdateLeadStageRequest(
    LeadStage Stage,
    string? Notes
);

public sealed record UpdateLeadRequest(
    string Name,
    string Email,
    string? Phone,
    string? Company,
    string? Source,
    LeadStage Stage,
    string? Notes,
    string? AssignedStaffUserId = null
);

