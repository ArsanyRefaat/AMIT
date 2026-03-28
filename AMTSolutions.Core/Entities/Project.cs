namespace AMTSolutions.Core.Entities;

public class Project : BaseEntity
{
    public int CustomerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Budget { get; set; }
    public decimal? EstimatedCost { get; set; }
    public decimal ProgressPercent { get; set; }
    public DateTime? StartDateUtc { get; set; }
    public DateTime? EndDateUtc { get; set; }
}

