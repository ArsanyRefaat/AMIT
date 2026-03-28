using AMTSolutions.Application.Tasks;
using AMTSolutions.Core.Entities;
using AMTSolutions.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AMTSolutions.Infrastructure.Tasks;

public sealed class TaskService : ITaskService
{
    private readonly AmtsDbContext _db;

    public TaskService(AmtsDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<TaskDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _db.Tasks
            .AsNoTracking()
            .Select(t => new TaskDto(t.Id, t.ProjectId, t.Title, t.Description, t.Status, t.AssignedToUserId, t.DueDateUtc))
            .ToListAsync(cancellationToken);
    }

    public async Task<TaskDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var t = await _db.Tasks.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return t is null
            ? null
            : new TaskDto(t.Id, t.ProjectId, t.Title, t.Description, t.Status, t.AssignedToUserId, t.DueDateUtc);
    }

    public async Task<TaskDto> CreateAsync(CreateTaskRequest request, CancellationToken cancellationToken = default)
    {
        var projectExists = await _db.Projects.AnyAsync(p => p.Id == request.ProjectId, cancellationToken);
        if (!projectExists)
            throw new ArgumentException($"Project with id {request.ProjectId} not found.");

        var entity = new TaskItem
        {
            ProjectId = request.ProjectId,
            Title = request.Title?.Trim() ?? string.Empty,
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            Status = request.Status,
            AssignedToUserId = request.AssignedToUserId,
            DueDateUtc = request.DueDateUtc,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        _db.Tasks.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);

        return new TaskDto(entity.Id, entity.ProjectId, entity.Title, entity.Description, entity.Status, entity.AssignedToUserId, entity.DueDateUtc);
    }

    public async Task<TaskDto?> UpdateAsync(int id, UpdateTaskRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _db.Tasks.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null) return null;

        var projectExists = await _db.Projects.AnyAsync(p => p.Id == request.ProjectId, cancellationToken);
        if (!projectExists)
            throw new ArgumentException($"Project with id {request.ProjectId} not found.");

        entity.ProjectId = request.ProjectId;
        entity.Title = request.Title?.Trim() ?? string.Empty;
        entity.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
        entity.Status = request.Status;
        entity.AssignedToUserId = request.AssignedToUserId;
        entity.DueDateUtc = request.DueDateUtc;
        entity.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);
        return new TaskDto(entity.Id, entity.ProjectId, entity.Title, entity.Description, entity.Status, entity.AssignedToUserId, entity.DueDateUtc);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _db.Tasks.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null) return false;

        _db.Tasks.Remove(entity);
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }
}

