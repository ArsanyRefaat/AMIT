namespace AMTSolutions.Core.Entities;

public class Expense : BaseEntity
{
    public int ExpenseCategoryId { get; set; }
    public int? ProjectId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "EGP";
    public DateTime ExpenseDateUtc { get; set; }
    public string? Description { get; set; }
    public string? ReceiptFilePath { get; set; }
}
