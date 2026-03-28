using AMTSolutions.Core.Enums;

namespace AMTSolutions.Core.Entities;

public class Invoice : BaseEntity
{
    public int CustomerId { get; set; }
    public int? ProjectId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;
    public DateTime IssueDateUtc { get; set; }
    public DateTime DueDateUtc { get; set; }
    public decimal Subtotal { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal Total { get; set; }
    public decimal AmountPaid { get; set; }
    public decimal BalanceDue { get; set; }
    public string? Notes { get; set; }
    public string Currency { get; set; } = "EGP";
    public ICollection<InvoiceLineItem> LineItems { get; set; } = new List<InvoiceLineItem>();
}
