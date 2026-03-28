namespace AMTSolutions.Application.Products;

public sealed record ProductDto(
    int Id,
    string Name,
    string? Description,
    string Category,
    decimal Price,
    string Unit,
    bool IsActive,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc
);

public sealed record CreateProductRequest(
    string Name,
    string? Description,
    string Category,
    decimal Price,
    string Unit,
    bool IsActive
);

public sealed record UpdateProductRequest(
    string Name,
    string? Description,
    string Category,
    decimal Price,
    string Unit,
    bool IsActive
);
