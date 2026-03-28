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

    private static ProjectDto MapDto(Project p, string customerName) =>
        new(
            p.Id,
            p.CustomerId,
            customerName,
            p.Name,
            p.Description,
            p.Budget,
            p.EstimatedCost,
            p.ProgressPercent,
            p.StartDateUtc,
            p.EndDateUtc,
            p.ShowOnPublicWebsite,
            p.WebsiteCategory,
            p.PublicPortfolioImageUrl,
            p.PublicPortfolioChallenge,
            p.PublicPortfolioSolution
        );

    /// <summary>
    /// Matches CRM: use stored ProgressPercent when &gt; 0; otherwise derive from completed tasks.
    /// </summary>
    private static int ComputeDisplayProgressPercent(Project p, int totalTasks, int completedTasks)
    {
        if (p.ProgressPercent > 0)
        {
            return (int)Math.Round(p.ProgressPercent, MidpointRounding.AwayFromZero);
        }

        if (totalTasks > 0)
        {
            return (int)Math.Round((decimal)completedTasks / totalTasks * 100m, MidpointRounding.AwayFromZero);
        }

        return 0;
    }

    private static IReadOnlyList<PublicPortfolioResultDto> BuildResults(Project p, int displayProgressPercent)
    {
        var list = new List<PublicPortfolioResultDto>
        {
            new("Progress", $"{displayProgressPercent}%"),
        };
        if (p.Budget > 0)
        {
            list.Add(new PublicPortfolioResultDto("Budget", $"EGP {p.Budget:N0}"));
        }

        return list;
    }

    private async Task<Dictionary<int, (int Total, int Completed)>> GetTaskCompletionByProjectIdsAsync(
        IReadOnlyList<int> projectIds,
        CancellationToken cancellationToken)
    {
        if (projectIds.Count == 0)
        {
            return new Dictionary<int, (int Total, int Completed)>();
        }

        var rows = await _db.Tasks
            .AsNoTracking()
            .Where(t => projectIds.Contains(t.ProjectId))
            .GroupBy(t => t.ProjectId)
            .Select(g => new
            {
                ProjectId = g.Key,
                Total = g.Count(),
                Completed = g.Count(t => t.Status == Core.Enums.TaskStatus.Completed),
            })
            .ToListAsync(cancellationToken);

        return rows.ToDictionary(x => x.ProjectId, x => (x.Total, x.Completed));
    }

    public async Task<IReadOnlyList<ProjectDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _db.Projects
            .AsNoTracking()
            .Join(
                _db.Customers.AsNoTracking(),
                p => p.CustomerId,
                c => c.Id,
                (p, c) => MapDto(p, c.Name))
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
            ShowOnPublicWebsite = request.ShowOnPublicWebsite,
            WebsiteCategory = string.IsNullOrWhiteSpace(request.WebsiteCategory) ? null : request.WebsiteCategory.Trim(),
            PublicPortfolioImageUrl = string.IsNullOrWhiteSpace(request.PublicPortfolioImageUrl)
                ? null
                : request.PublicPortfolioImageUrl.Trim(),
            PublicPortfolioChallenge = string.IsNullOrWhiteSpace(request.PublicPortfolioChallenge)
                ? null
                : request.PublicPortfolioChallenge.Trim(),
            PublicPortfolioSolution = string.IsNullOrWhiteSpace(request.PublicPortfolioSolution)
                ? null
                : request.PublicPortfolioSolution.Trim(),
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

        return MapDto(project, customerName);
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
        project.ShowOnPublicWebsite = request.ShowOnPublicWebsite;
        project.WebsiteCategory = string.IsNullOrWhiteSpace(request.WebsiteCategory) ? null : request.WebsiteCategory.Trim();
        project.PublicPortfolioImageUrl = string.IsNullOrWhiteSpace(request.PublicPortfolioImageUrl)
            ? null
            : request.PublicPortfolioImageUrl.Trim();
        project.PublicPortfolioChallenge = string.IsNullOrWhiteSpace(request.PublicPortfolioChallenge)
            ? null
            : request.PublicPortfolioChallenge.Trim();
        project.PublicPortfolioSolution = string.IsNullOrWhiteSpace(request.PublicPortfolioSolution)
            ? null
            : request.PublicPortfolioSolution.Trim();
        project.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        var customerName = await _db.Customers
            .AsNoTracking()
            .Where(c => c.Id == project.CustomerId)
            .Select(c => c.Name)
            .FirstAsync(cancellationToken);

        return MapDto(project, customerName);
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

    public async Task<ProjectDto?> PatchWebsiteAsync(int id, PatchProjectWebsiteRequest request, CancellationToken cancellationToken = default)
    {
        var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (project is null)
        {
            return null;
        }

        if (request.ShowOnPublicWebsite.HasValue)
        {
            project.ShowOnPublicWebsite = request.ShowOnPublicWebsite.Value;
        }

        if (request.WebsiteCategory is not null)
        {
            project.WebsiteCategory = string.IsNullOrWhiteSpace(request.WebsiteCategory)
                ? null
                : request.WebsiteCategory.Trim();
        }

        if (request.PublicPortfolioImageUrl is not null)
        {
            project.PublicPortfolioImageUrl = string.IsNullOrWhiteSpace(request.PublicPortfolioImageUrl)
                ? null
                : request.PublicPortfolioImageUrl.Trim();
        }

        if (request.PublicPortfolioChallenge is not null)
        {
            project.PublicPortfolioChallenge = string.IsNullOrWhiteSpace(request.PublicPortfolioChallenge)
                ? null
                : request.PublicPortfolioChallenge.Trim();
        }

        if (request.PublicPortfolioSolution is not null)
        {
            project.PublicPortfolioSolution = string.IsNullOrWhiteSpace(request.PublicPortfolioSolution)
                ? null
                : request.PublicPortfolioSolution.Trim();
        }

        project.UpdatedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);

        var customerName = await _db.Customers
            .AsNoTracking()
            .Where(c => c.Id == project.CustomerId)
            .Select(c => c.Name)
            .FirstAsync(cancellationToken);

        return MapDto(project, customerName);
    }

    public async Task<IReadOnlyList<PublicPortfolioItemDto>> GetPublicPortfolioAsync(CancellationToken cancellationToken = default)
    {
        var rows = await _db.Projects
            .AsNoTracking()
            .Where(p => p.ShowOnPublicWebsite)
            .Join(
                _db.Customers.AsNoTracking(),
                p => p.CustomerId,
                c => c.Id,
                (p, c) => new { p, CustomerName = c.Name })
            .OrderByDescending(x => x.p.UpdatedAtUtc)
            .ToListAsync(cancellationToken);

        var projectIds = rows.Select(r => r.p.Id).ToList();
        var taskStats = await GetTaskCompletionByProjectIdsAsync(projectIds, cancellationToken);

        return rows.Select(x =>
        {
            var p = x.p;
            taskStats.TryGetValue(p.Id, out var tc);
            var displayPct = ComputeDisplayProgressPercent(p, tc.Total, tc.Completed);
            var slug = $"project-{p.Id}";
            var category = string.IsNullOrWhiteSpace(p.WebsiteCategory) ? "Project" : p.WebsiteCategory!;
            var shortDesc = string.IsNullOrWhiteSpace(p.Description)
                ? $"Work with {x.CustomerName}."
                : p.Description!;
            return new PublicPortfolioItemDto(
                p.Id,
                slug,
                p.Name,
                category,
                x.CustomerName,
                shortDesc,
                string.IsNullOrWhiteSpace(p.PublicPortfolioImageUrl) ? null : p.PublicPortfolioImageUrl.Trim(),
                BuildResults(p, displayPct));
        }).ToList();
    }

    public async Task<PublicPortfolioDetailDto?> GetPublicPortfolioBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(slug) || !slug.StartsWith("project-", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        var idPart = slug["project-".Length..];
        if (!int.TryParse(idPart, out var id))
        {
            return null;
        }

        var row = await _db.Projects
            .AsNoTracking()
            .Where(p => p.Id == id && p.ShowOnPublicWebsite)
            .Join(
                _db.Customers.AsNoTracking(),
                p => p.CustomerId,
                c => c.Id,
                (p, c) => new { p, CustomerName = c.Name })
            .FirstOrDefaultAsync(cancellationToken);

        if (row is null)
        {
            return null;
        }

        var p = row.p;
        var category = string.IsNullOrWhiteSpace(p.WebsiteCategory) ? "Project" : p.WebsiteCategory!;
        var shortDesc = string.IsNullOrWhiteSpace(p.Description)
            ? $"Work with {row.CustomerName}."
            : p.Description!;
        var dateLabel = p.StartDateUtc?.ToString("MMMM yyyy") ?? DateTime.UtcNow.ToString("MMMM yyyy");

        var taskStats = await GetTaskCompletionByProjectIdsAsync(new[] { p.Id }, cancellationToken);
        taskStats.TryGetValue(p.Id, out var tc);
        var displayPct = ComputeDisplayProgressPercent(p, tc.Total, tc.Completed);

        return new PublicPortfolioDetailDto(
            p.Id,
            $"project-{p.Id}",
            p.Name,
            category,
            row.CustomerName,
            shortDesc,
            p.Description,
            string.IsNullOrWhiteSpace(p.PublicPortfolioChallenge) ? null : p.PublicPortfolioChallenge.Trim(),
            string.IsNullOrWhiteSpace(p.PublicPortfolioSolution) ? null : p.PublicPortfolioSolution.Trim(),
            string.IsNullOrWhiteSpace(p.PublicPortfolioImageUrl) ? null : p.PublicPortfolioImageUrl.Trim(),
            BuildResults(p, displayPct),
            dateLabel);
    }
}
