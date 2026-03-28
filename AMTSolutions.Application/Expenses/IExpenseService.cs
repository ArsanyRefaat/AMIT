namespace AMTSolutions.Application.Expenses;

public interface IExpenseService
{
    Task<IReadOnlyList<ExpenseCategoryDto>> GetCategoriesAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ExpenseDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ExpenseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ExpenseDto> CreateAsync(CreateExpenseRequest request, CancellationToken cancellationToken = default);
    Task<ExpenseDto?> UpdateAsync(int id, UpdateExpenseRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
