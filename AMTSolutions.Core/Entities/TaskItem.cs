using AMTSolutions.Core.Enums;

namespace AMTSolutions.Core.Entities;

public class TaskItem : BaseEntity
{
    public int ProjectId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Core.Enums.TaskStatus Status { get; set; } = Core.Enums.TaskStatus.Todo;
    public string? AssignedToUserId { get; set; }
    public DateTime? DueDateUtc { get; set; }
}

