using AMTSolutions.Application.Products;
using AMTSolutions.Core.Entities;
using AMTSolutions.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AMTSolutions.Infrastructure.Products;

public sealed class ProductService : IProductService
{
    private readonly AmtsDbContext _db;

    public ProductService(AmtsDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<ProductDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _db.Products
            .AsNoTracking()
            .OrderBy(p => p.Name)
            .Select(p => new ProductDto(p.Id, p.Name, p.Description, p.Category, p.Price, p.Unit, p.IsActive, p.CreatedAtUtc, p.UpdatedAtUtc))
            .ToListAsync(cancellationToken);
    }

    public async Task<ProductDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var p = await _db.Products.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return p is null ? null : new ProductDto(p.Id, p.Name, p.Description, p.Category, p.Price, p.Unit, p.IsActive, p.CreatedAtUtc, p.UpdatedAtUtc);
    }

    public async Task<ProductDto> CreateAsync(CreateProductRequest request, CancellationToken cancellationToken = default)
    {
        var entity = new Product
        {
            Name = request.Name?.Trim() ?? string.Empty,
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            Category = request.Category?.Trim() ?? string.Empty,
            Price = request.Price,
            Unit = request.Unit?.Trim() ?? "project",
            IsActive = request.IsActive,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };
        _db.Products.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);
        return new ProductDto(entity.Id, entity.Name, entity.Description, entity.Category, entity.Price, entity.Unit, entity.IsActive, entity.CreatedAtUtc, entity.UpdatedAtUtc);
    }

    public async Task<ProductDto?> UpdateAsync(int id, UpdateProductRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _db.Products.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null) return null;
        entity.Name = request.Name?.Trim() ?? string.Empty;
        entity.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
        entity.Category = request.Category?.Trim() ?? string.Empty;
        entity.Price = request.Price;
        entity.Unit = request.Unit?.Trim() ?? "project";
        entity.IsActive = request.IsActive;
        entity.UpdatedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);
        return new ProductDto(entity.Id, entity.Name, entity.Description, entity.Category, entity.Price, entity.Unit, entity.IsActive, entity.CreatedAtUtc, entity.UpdatedAtUtc);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _db.Products.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null) return false;
        _db.Products.Remove(entity);
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
