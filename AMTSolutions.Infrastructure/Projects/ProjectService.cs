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
            p.PublicPortfolioImageUrl
        );

    private static IReadOnlyList<PublicPortfolioResultDto> BuildResults(Project p)
    {
        var list = new List<PublicPortfolioResultDto>
        {
            new("Progress", $"{p.ProgressPercent:0}%"),
        };
        if (p.Budget > 0)
        {
            list.Add(new PublicPortfolioResultDto("Budget", $"EGP {p.Budget:N0}"));
        }

        return list;
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

        return rows.Select(x =>
        {
            var p = x.p;
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
                BuildResults(p));
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

        return new PublicPortfolioDetailDto(
            p.Id,
            $"project-{p.Id}",
            p.Name,
            category,
            row.CustomerName,
            shortDesc,
            p.Description,
            string.IsNullOrWhiteSpace(p.PublicPortfolioImageUrl) ? null : p.PublicPortfolioImageUrl.Trim(),
            BuildResults(p),
            dateLabel);
    }
}
