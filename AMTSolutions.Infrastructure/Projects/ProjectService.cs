using AMTSolutions.Application.Projects;
using AMTSolutions.Core.Entities;
using AMTSolutions.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AMTSolutions.Infrastructure.Projects;

public sealed class ProjectService : IProjectService
{
    private readonly AmtsDbContext _db;

    public ProjectService(AmtsDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<ProjectDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _db.Projects
            .AsNoTracking()
            .Join(
                _db.Customers.AsNoTracking(),
                p => p.CustomerId,
                c => c.Id,
                (p, c) => new ProjectDto(
                    p.Id,
                    p.CustomerId,
                    c.Name,
                    p.Name,
                    p.Description,
                    p.Budget,
                    p.EstimatedCost,
                    p.ProgressPercent,
                    p.StartDateUtc,
                    p.EndDateUtc
                ))
            .ToListAsync(cancellationToken);
    }

    public async Task<ProjectDto> CreateAsync(CreateProjectRequest request, CancellationToken cancellationToken = default)
    {
        var project = new Project
        {
            CustomerId = request.CustomerId,
            Name = request.Name,
            Description = request.Description,
            Budget = request.Budget,
            EstimatedCost = null,
            ProgressPercent = 0,
            StartDateUtc = request.StartDateUtc,
            EndDateUtc = request.EndDateUtc,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        _db.Projects.Add(project);
        await _db.SaveChangesAsync(cancellationToken);

        var customerName = await _db.Customers
            .AsNoTracking()
            .Where(c => c.Id == request.CustomerId)
            .Select(c => c.Name)
            .FirstAsync(cancellationToken);

        return new ProjectDto(
            project.Id,
            project.CustomerId,
            customerName,
            project.Name,
            project.Description,
            project.Budget,
            project.EstimatedCost,
            project.ProgressPercent,
            project.StartDateUtc,
            project.EndDateUtc
        );
    }

    public async Task<ProjectDto?> UpdateAsync(int id, CreateProjectRequest request, CancellationToken cancellationToken = default)
    {
        var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (project is null)
        {
            return null;
        }

        project.CustomerId = request.CustomerId;
        project.Name = request.Name;
        project.Description = request.Description;
        project.Budget = request.Budget;
        project.StartDateUtc = request.StartDateUtc;
        project.EndDateUtc = request.EndDateUtc;
        project.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        var customerName = await _db.Customers
            .AsNoTracking()
            .Where(c => c.Id == project.CustomerId)
            .Select(c => c.Name)
            .FirstAsync(cancellationToken);

        return new ProjectDto(
            project.Id,
            project.CustomerId,
            customerName,
            project.Name,
            project.Description,
            project.Budget,
            project.EstimatedCost,
            project.ProgressPercent,
            project.StartDateUtc,
            project.EndDateUtc
        );
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (project is null)
        {
            return false;
        }

        _db.Projects.Remove(project);
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }
}

