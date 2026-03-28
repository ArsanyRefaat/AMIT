namespace AMTSolutions.Application.Projects;

public interface IProjectService
{
    Task<IReadOnlyList<ProjectDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ProjectDto> CreateAsync(CreateProjectRequest request, CancellationToken cancellationToken = default);
    Task<ProjectDto?> UpdateAsync(int id, CreateProjectRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<ProjectDto?> PatchWebsiteAsync(int id, PatchProjectWebsiteRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PublicPortfolioItemDto>> GetPublicPortfolioAsync(CancellationToken cancellationToken = default);
    Task<PublicPortfolioDetailDto?> GetPublicPortfolioBySlugAsync(string slug, CancellationToken cancellationToken = default);
}

