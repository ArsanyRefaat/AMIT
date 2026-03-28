namespace AMTSolutions.Core.Entities;

public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Unit { get; set; } = "project"; // e.g. "project", "month"
    public bool IsActive { get; set; } = true;
}
