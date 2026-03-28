namespace AMTSolutions.Application.Customers;

public sealed record CustomerDto(
    int Id,
    string Name,
    string Email,
    string? Phone,
    string? Company,
    string? Address
);

public sealed record CreateCustomerRequest(
    string Name,
    string Email,
    string? Phone,
    string? Company,
    string? Address
);

