namespace AMTSolutions.Core.Entities;

public abstract class BaseEntity
{
    // Match existing database PK type (int)
    public int Id { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
}

