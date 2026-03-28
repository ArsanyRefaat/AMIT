namespace AMTSolutions.Application.Invoices;

public interface IInvoiceService
{
    Task<IReadOnlyList<InvoiceDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<InvoiceDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<InvoiceDto> CreateAsync(CreateInvoiceRequest request, CancellationToken cancellationToken = default);
    Task<InvoiceDto?> UpdateStatusAsync(int id, UpdateInvoiceStatusRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
