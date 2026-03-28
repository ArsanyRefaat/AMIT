namespace AMTSolutions.Application.Expenses;

public sealed record ExpenseCategoryDto(int Id, string Name);

public sealed record ExpenseDto(
    int Id,
    int ExpenseCategoryId,
    string ExpenseCategoryName,
    int? ProjectId,
    string? ProjectName,
    decimal Amount,
    string Currency,
    DateTime ExpenseDateUtc,
    string? Description,
    string? ReceiptFilePath,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc
);

public sealed record CreateExpenseRequest(
    int ExpenseCategoryId,
    int? ProjectId,
    decimal Amount,
    string Currency,
    DateTime ExpenseDateUtc,
    string? Description,
    string? ReceiptFilePath
);

public sealed record UpdateExpenseRequest(
    int ExpenseCategoryId,
    int? ProjectId,
    decimal Amount,
    string Currency,
    DateTime ExpenseDateUtc,
    string? Description,
    string? ReceiptFilePath
);
