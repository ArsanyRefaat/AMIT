using AMTSolutions.Application.Customers;
using AMTSolutions.Core.Entities;
using AMTSolutions.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AMTSolutions.Infrastructure.Customers;

public sealed class CustomerService : ICustomerService
{
    private readonly AmtsDbContext _db;

    public CustomerService(AmtsDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<CustomerDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _db.Customers
            .AsNoTracking()
            .Select(c => new CustomerDto(c.Id, c.Name, c.Email, c.Phone, c.Company, c.Address))
            .ToListAsync(cancellationToken);
    }

    public async Task<CustomerDto> CreateAsync(CreateCustomerRequest request, CancellationToken cancellationToken = default)
    {
        var entity = new Customer
        {
            Name = request.Name,
            Email = request.Email,
            Phone = request.Phone,
            Company = request.Company,
            Address = request.Address,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        _db.Customers.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);

        return new CustomerDto(entity.Id, entity.Name, entity.Email, entity.Phone, entity.Company, entity.Address);
    }

    public async Task<CustomerDto?> UpdateAsync(int id, CreateCustomerRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _db.Customers.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        entity.Name = request.Name;
        entity.Email = request.Email;
        entity.Phone = request.Phone;
        entity.Company = request.Company;
        entity.Address = request.Address;
        entity.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        return new CustomerDto(entity.Id, entity.Name, entity.Email, entity.Phone, entity.Company, entity.Address);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _db.Customers.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        _db.Customers.Remove(entity);
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }
}

