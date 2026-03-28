using AMTSolutions.Application.Leads;
using AMTSolutions.Core.Entities;
using AMTSolutions.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AMTSolutions.Infrastructure.Leads;

public sealed class LeadService : ILeadService
{
    private readonly AmtsDbContext _db;

    public LeadService(AmtsDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<LeadDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _db.Leads
            .AsNoTracking()
            .Select(x => new LeadDto(x.Id, x.Name, x.Email, x.Phone, x.Company, x.Source, x.Stage))
            .ToListAsync(cancellationToken);
    }

    public async Task<LeadDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var lead = await _db.Leads.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return lead is null
            ? null
            : new LeadDto(lead.Id, lead.Name, lead.Email, lead.Phone, lead.Company, lead.Source, lead.Stage);
    }

    public async Task<LeadDto> CreateAsync(CreateLeadRequest request, CancellationToken cancellationToken = default)
    {
        var lead = new Lead
        {
            Name = request.Name,
            Email = request.Email,
            Phone = request.Phone,
            Company = request.Company,
            Source = request.Source
        };

        _db.Leads.Add(lead);
        await _db.SaveChangesAsync(cancellationToken);

        return new LeadDto(lead.Id, lead.Name, lead.Email, lead.Phone, lead.Company, lead.Source, lead.Stage);
    }

    public async Task<LeadDto?> UpdateAsync(int id, UpdateLeadRequest request, CancellationToken cancellationToken = default)
    {
        var lead = await _db.Leads.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (lead is null)
        {
            return null;
        }

        lead.Name = request.Name;
        lead.Email = request.Email;
        lead.Phone = request.Phone;
        lead.Company = request.Company;
        lead.Source = request.Source;
        lead.Stage = request.Stage;
        lead.UpdatedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);

        return new LeadDto(lead.Id, lead.Name, lead.Email, lead.Phone, lead.Company, lead.Source, lead.Stage);
    }

    public async Task<LeadDto?> UpdateStageAsync(int id, UpdateLeadStageRequest request, CancellationToken cancellationToken = default)
    {
        var lead = await _db.Leads.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (lead is null)
        {
            return null;
        }

        lead.Stage = request.Stage;
        lead.UpdatedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);

        return new LeadDto(lead.Id, lead.Name, lead.Email, lead.Phone, lead.Company, lead.Source, lead.Stage);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var lead = await _db.Leads.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (lead is null)
        {
            return false;
        }

        _db.Leads.Remove(lead);
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }
}

