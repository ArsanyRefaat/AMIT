using System.ComponentModel.DataAnnotations.Schema;
using AMTSolutions.Core.Enums;

namespace AMTSolutions.Core.Entities;

public class Lead : BaseEntity
{
    // Maps to dbo.Leads.FullName
    [Column("FullName")]
    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Company { get; set; }
    public string? Source { get; set; }
    public LeadStage Stage { get; set; } = LeadStage.NewLead;

    // Notes are stored in separate LeadNotes table in existing DB
    [NotMapped]
    public string? Notes { get; set; }

    public string? AssignedStaffUserId { get; set; }
    public int? CustomerId { get; set; }
    public decimal? EstimatedValue { get; set; }
    public string? Priority { get; set; }
}

