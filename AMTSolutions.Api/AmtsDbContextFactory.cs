using AMTSolutions.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace AMTSolutions.Api;

/// <summary>
/// Design-time factory so <c>dotnet ef migrations</c> targets PostgreSQL (NpgSql) regardless of local appsettings.
/// </summary>
public sealed class AmtsDbContextFactory : IDesignTimeDbContextFactory<AmtsDbContext>
{
    public AmtsDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AmtsDbContext>();
        optionsBuilder.UseNpgsql(
            "Host=127.0.0.1;Port=5432;Database=amts_design;Username=postgres;Password=postgres;SSL Mode=Disable",
            b => b.MigrationsAssembly("AMTSolutions.Api"));
        return new AmtsDbContext(optionsBuilder.Options);
    }
}
