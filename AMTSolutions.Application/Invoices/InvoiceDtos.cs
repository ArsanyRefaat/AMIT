using AMTSolutions.Core.Enums;

namespace AMTSolutions.Application.Invoices;

public sealed record InvoiceLineItemDto(
    int Id,
    string Description,
    int Quantity,
    decimal UnitPrice,
    decimal Total
);

public sealed record InvoiceDto(
    int Id,
    string InvoiceNumber,
    int CustomerId,
    string CustomerName,
    int? ProjectId,
    string? ProjectName,
    InvoiceStatus Status,
    DateTime IssueDateUtc,
    DateTime DueDateUtc,
    decimal Subtotal,
    decimal TaxRate,
    decimal TaxAmount,
    decimal Total,
    decimal AmountPaid,
    decimal BalanceDue,
    string? Notes,
    IReadOnlyList<InvoiceLineItemDto> LineItems
);

public sealed record InvoiceLineItemRequest(
    string Description,
    int Quantity,
    decimal UnitPrice
);

public sealed record CreateInvoiceRequest(
    int CustomerId,
    int? ProjectId,
    DateTime IssueDateUtc,
    DateTime DueDateUtc,
    string? Notes,
    IReadOnlyList<InvoiceLineItemRequest> LineItems
);

public sealed record UpdateInvoiceStatusRequest(InvoiceStatus Status);
