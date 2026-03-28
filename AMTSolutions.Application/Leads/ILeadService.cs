namespace AMTSolutions.Application.Leads;

public interface ILeadService
{
    Task<IReadOnlyList<LeadDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<LeadDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<LeadDto> CreateAsync(CreateLeadRequest request, CancellationToken cancellationToken = default);
    Task<LeadDto?> UpdateAsync(int id, UpdateLeadRequest request, CancellationToken cancellationToken = default);
    Task<LeadDto?> UpdateStageAsync(int id, UpdateLeadStageRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}

