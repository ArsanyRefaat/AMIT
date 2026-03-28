using AMTSolutions.Application.Expenses;
using AMTSolutions.Core.Entities;
using AMTSolutions.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AMTSolutions.Infrastructure.Expenses;

public sealed class ExpenseService : IExpenseService
{
    private readonly AmtsDbContext _db;

    public ExpenseService(AmtsDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<ExpenseCategoryDto>> GetCategoriesAsync(CancellationToken cancellationToken = default)
    {
        return await _db.ExpenseCategories
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .Select(c => new ExpenseCategoryDto(c.Id, c.Name))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ExpenseDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var expenses = await _db.Expenses
            .AsNoTracking()
            .ToListAsync(cancellationToken);
        if (expenses.Count == 0) return new List<ExpenseDto>();

        var categoryIds = expenses.Select(e => e.ExpenseCategoryId).Distinct().ToList();
        var projectIds = expenses.Where(e => e.ProjectId.HasValue).Select(e => e.ProjectId!.Value).Distinct().ToList();
        var categories = await _db.ExpenseCategories.AsNoTracking().Where(c => categoryIds.Contains(c.Id)).ToDictionaryAsync(c => c.Id, c => c.Name, cancellationToken);
        var projects = projectIds.Count > 0
            ? await _db.Projects.AsNoTracking().Where(p => projectIds.Contains(p.Id)).ToDictionaryAsync(p => p.Id, p => p.Name, cancellationToken)
            : new Dictionary<int, string>();

        return expenses.Select(e =>
        {
            var catName = categories.GetValueOrDefault(e.ExpenseCategoryId) ?? "";
            var projName = e.ProjectId.HasValue ? projects.GetValueOrDefault(e.ProjectId.Value) : null;
            return new ExpenseDto(
                e.Id,
                e.ExpenseCategoryId,
                catName,
                e.ProjectId,
                projName,
                e.Amount,
                e.Currency,
                e.ExpenseDateUtc,
                e.Description,
                e.ReceiptFilePath,
                e.CreatedAtUtc,
                e.UpdatedAtUtc
            );
        }).ToList();
    }

    public async Task<ExpenseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var e = await _db.Expenses.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (e is null) return null;

        var catName = await _db.ExpenseCategories.AsNoTracking().Where(c => c.Id == e.ExpenseCategoryId).Select(c => c.Name).FirstOrDefaultAsync(cancellationToken) ?? "";
        string? projName = null;
        if (e.ProjectId.HasValue)
            projName = await _db.Projects.AsNoTracking().Where(p => p.Id == e.ProjectId).Select(p => p.Name).FirstOrDefaultAsync(cancellationToken);

        return new ExpenseDto(
            e.Id,
            e.ExpenseCategoryId,
            catName,
            e.ProjectId,
            projName,
            e.Amount,
            e.Currency,
            e.ExpenseDateUtc,
            e.Description,
            e.ReceiptFilePath,
            e.CreatedAtUtc,
            e.UpdatedAtUtc
        );
    }

    public async Task<ExpenseDto> CreateAsync(CreateExpenseRequest request, CancellationToken cancellationToken = default)
    {
        var categoryExists = await _db.ExpenseCategories.AnyAsync(c => c.Id == request.ExpenseCategoryId, cancellationToken);
        if (!categoryExists)
            throw new ArgumentException($"Expense category with id {request.ExpenseCategoryId} not found.");
        if (request.ProjectId.HasValue)
        {
            var projectExists = await _db.Projects.AnyAsync(p => p.Id == request.ProjectId.Value, cancellationToken);
            if (!projectExists)
                throw new ArgumentException($"Project with id {request.ProjectId} not found.");
        }

        var entity = new Expense
        {
            ExpenseCategoryId = request.ExpenseCategoryId,
            ProjectId = request.ProjectId,
            Amount = request.Amount,
            Currency = request.Currency?.Trim() ?? "EGP",
            ExpenseDateUtc = request.ExpenseDateUtc.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(request.ExpenseDateUtc, DateTimeKind.Utc) : request.ExpenseDateUtc.ToUniversalTime(),
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            ReceiptFilePath = request.ReceiptFilePath,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };
        _db.Expenses.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);

        var catName = await _db.ExpenseCategories.AsNoTracking().Where(c => c.Id == entity.ExpenseCategoryId).Select(c => c.Name).FirstOrDefaultAsync(cancellationToken) ?? "";
        string? projName = null;
        if (entity.ProjectId.HasValue)
            projName = await _db.Projects.AsNoTracking().Where(p => p.Id == entity.ProjectId).Select(p => p.Name).FirstOrDefaultAsync(cancellationToken);

        return new ExpenseDto(
            entity.Id,
            entity.ExpenseCategoryId,
            catName,
            entity.ProjectId,
            projName,
            entity.Amount,
            entity.Currency,
            entity.ExpenseDateUtc,
            entity.Description,
            entity.ReceiptFilePath,
            entity.CreatedAtUtc,
            entity.UpdatedAtUtc
        );
    }

    public async Task<ExpenseDto?> UpdateAsync(int id, UpdateExpenseRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _db.Expenses.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null) return null;

        var categoryExists = await _db.ExpenseCategories.AnyAsync(c => c.Id == request.ExpenseCategoryId, cancellationToken);
        if (!categoryExists)
            throw new ArgumentException($"Expense category with id {request.ExpenseCategoryId} not found.");
        if (request.ProjectId.HasValue)
        {
            var projectExists = await _db.Projects.AnyAsync(p => p.Id == request.ProjectId.Value, cancellationToken);
            if (!projectExists)
                throw new ArgumentException($"Project with id {request.ProjectId} not found.");
        }

        entity.ExpenseCategoryId = request.ExpenseCategoryId;
        entity.ProjectId = request.ProjectId;
        entity.Amount = request.Amount;
        entity.Currency = request.Currency?.Trim() ?? "EGP";
        entity.ExpenseDateUtc = request.ExpenseDateUtc.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(request.ExpenseDateUtc, DateTimeKind.Utc) : request.ExpenseDateUtc.ToUniversalTime();
        entity.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
        entity.ReceiptFilePath = request.ReceiptFilePath;
        entity.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        var catName = await _db.ExpenseCategories.AsNoTracking().Where(c => c.Id == entity.ExpenseCategoryId).Select(c => c.Name).FirstOrDefaultAsync(cancellationToken) ?? "";
        string? projName = null;
        if (entity.ProjectId.HasValue)
            projName = await _db.Projects.AsNoTracking().Where(p => p.Id == entity.ProjectId).Select(p => p.Name).FirstOrDefaultAsync(cancellationToken);

        return new ExpenseDto(
            entity.Id,
            entity.ExpenseCategoryId,
            catName,
            entity.ProjectId,
            projName,
            entity.Amount,
            entity.Currency,
            entity.ExpenseDateUtc,
            entity.Description,
            entity.ReceiptFilePath,
            entity.CreatedAtUtc,
            entity.UpdatedAtUtc
        );
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _db.Expenses.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null) return false;
        _db.Expenses.Remove(entity);
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
