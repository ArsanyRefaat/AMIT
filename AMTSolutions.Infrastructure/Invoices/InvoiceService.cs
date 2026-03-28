using AMTSolutions.Application.Invoices;
using AMTSolutions.Core.Entities;
using AMTSolutions.Core.Enums;
using AMTSolutions.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AMTSolutions.Infrastructure.Invoices;

public sealed class InvoiceService : IInvoiceService
{
    private readonly AmtsDbContext _db;

    public InvoiceService(AmtsDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<InvoiceDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var invoices = await _db.Invoices
            .AsNoTracking()
            .Include(i => i.LineItems)
            .ToListAsync(cancellationToken);
        if (invoices.Count == 0) return new List<InvoiceDto>();

        var customerIds = invoices.Select(i => i.CustomerId).Distinct().ToList();
        var projectIds = invoices.Where(i => i.ProjectId.HasValue).Select(i => i.ProjectId!.Value).Distinct().ToList();
        var customers = await _db.Customers.AsNoTracking().Where(c => customerIds.Contains(c.Id)).Select(c => new { c.Id, c.Name }).ToListAsync(cancellationToken);
        var projects = await _db.Projects.AsNoTracking().Where(p => projectIds.Contains(p.Id)).Select(p => new { p.Id, p.Name }).ToListAsync(cancellationToken);
        var customerNames = customers.ToDictionary(c => c.Id, c => c.Name);
        var projectNames = projects.ToDictionary(p => p.Id, p => p.Name);

        return invoices.Select(i =>
        {
            var custName = customerNames.GetValueOrDefault(i.CustomerId) ?? "";
            var projName = i.ProjectId.HasValue ? projectNames.GetValueOrDefault(i.ProjectId.Value) : null;
            return MapToDto(i, custName, projName);
        }).ToList();
    }

    public async Task<InvoiceDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var invoice = await _db.Invoices
            .AsNoTracking()
            .Include(i => i.LineItems)
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);
        if (invoice is null) return null;

        var customerName = await _db.Customers
            .AsNoTracking()
            .Where(c => c.Id == invoice.CustomerId)
            .Select(c => c.Name)
            .FirstOrDefaultAsync(cancellationToken) ?? "";
        string? projectName = null;
        if (invoice.ProjectId.HasValue)
            projectName = await _db.Projects
                .AsNoTracking()
                .Where(p => p.Id == invoice.ProjectId)
                .Select(p => p.Name)
                .FirstOrDefaultAsync(cancellationToken);
        return MapToDto(invoice, customerName, projectName);
    }

    public async Task<InvoiceDto> CreateAsync(CreateInvoiceRequest request, CancellationToken cancellationToken = default)
    {
        var lineItemsList = request.LineItems ?? Array.Empty<InvoiceLineItemRequest>();
        var lineItems = lineItemsList
            .Select(li => new InvoiceLineItem
            {
                Description = li.Description ?? "",
                Quantity = li.Quantity,
                UnitPrice = li.UnitPrice,
                Total = li.Quantity * li.UnitPrice,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = null
            })
            .ToList();

        var customerExists = await _db.Customers.AnyAsync(c => c.Id == request.CustomerId, cancellationToken);
        if (!customerExists)
            throw new InvalidOperationException($"Customer with id {request.CustomerId} not found.");

        if (request.ProjectId.HasValue)
        {
            var projectExists = await _db.Projects.AnyAsync(p => p.Id == request.ProjectId.Value, cancellationToken);
            if (!projectExists)
                throw new InvalidOperationException($"Project with id {request.ProjectId} not found.");
        }

        var subtotal = lineItems.Sum(li => li.Total);
        const decimal taxRate = 14m;
        var taxAmount = subtotal * (taxRate / 100m);
        var total = subtotal + taxAmount;

        var year = DateTime.UtcNow.Year;
        var count = await _db.Invoices.CountAsync(i => i.CreatedAtUtc.Year == year, cancellationToken);
        var invoiceNumber = $"INV-{year}-{(count + 1):D3}";

        var invoice = new Invoice
        {
            CustomerId = request.CustomerId,
            ProjectId = request.ProjectId,
            InvoiceNumber = invoiceNumber,
            Status = InvoiceStatus.Draft,
            IssueDateUtc = request.IssueDateUtc,
            DueDateUtc = request.DueDateUtc,
            Subtotal = subtotal,
            TaxRate = taxRate,
            TaxAmount = taxAmount,
            Total = total,
            AmountPaid = 0,
            BalanceDue = total,
            Notes = request.Notes,
            Currency = "EGP",
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        foreach (var li in lineItems)
            invoice.LineItems.Add(li);

        _db.Invoices.Add(invoice);
        await _db.SaveChangesAsync(cancellationToken);

        var customerName = await _db.Customers
            .AsNoTracking()
            .Where(c => c.Id == request.CustomerId)
            .Select(c => c.Name)
            .FirstAsync(cancellationToken);
        string? projectName = null;
        if (request.ProjectId.HasValue)
            projectName = await _db.Projects
                .AsNoTracking()
                .Where(p => p.Id == request.ProjectId)
                .Select(p => p.Name)
                .FirstOrDefaultAsync(cancellationToken);

        return MapToDto(invoice, customerName, projectName);
    }

    public async Task<InvoiceDto?> UpdateStatusAsync(int id, UpdateInvoiceStatusRequest request, CancellationToken cancellationToken = default)
    {
        var invoice = await _db.Invoices
            .Include(i => i.LineItems)
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);
        if (invoice is null) return null;

        invoice.Status = request.Status;
        invoice.UpdatedAtUtc = DateTime.UtcNow;
        if (request.Status == InvoiceStatus.Paid)
        {
            invoice.AmountPaid = invoice.Total;
            invoice.BalanceDue = 0;
        }

        await _db.SaveChangesAsync(cancellationToken);

        var customerName = await _db.Customers
            .AsNoTracking()
            .Where(c => c.Id == invoice.CustomerId)
            .Select(c => c.Name)
            .FirstAsync(cancellationToken);
        string? projectName = null;
        if (invoice.ProjectId.HasValue)
            projectName = await _db.Projects
                .AsNoTracking()
                .Where(p => p.Id == invoice.ProjectId)
                .Select(p => p.Name)
                .FirstOrDefaultAsync(cancellationToken);

        return MapToDto(invoice, customerName, projectName);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var invoice = await _db.Invoices
            .Include(i => i.LineItems)
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);
        if (invoice is null) return false;
        _db.Invoices.Remove(invoice);
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static InvoiceDto MapToDto(Invoice i, string customerName, string? projectName)
    {
        var lineDtos = i.LineItems
            .Select(li => new InvoiceLineItemDto(li.Id, li.Description, li.Quantity, li.UnitPrice, li.Total))
            .ToList();
        return new InvoiceDto(
            i.Id,
            i.InvoiceNumber,
            i.CustomerId,
            customerName,
            i.ProjectId,
            projectName,
            i.Status,
            i.IssueDateUtc,
            i.DueDateUtc,
            i.Subtotal,
            i.TaxRate,
            i.TaxAmount,
            i.Total,
            i.AmountPaid,
            i.BalanceDue,
            i.Notes,
            lineDtos
        );
    }
}
