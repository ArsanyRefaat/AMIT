using AMTSolutions.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AMTSolutions.Api;

public static class IdentitySeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var provider = scope.ServiceProvider;

        // Ensure legacy columns on AspNetUsers have default values so inserts don't fail.
        try
        {
            var db = provider.GetRequiredService<AmtsDbContext>();
            await db.Database.ExecuteSqlRawAsync(@"
IF COL_LENGTH('AspNetUsers', 'FullName') IS NOT NULL
BEGIN
    DECLARE @constraintName nvarchar(200);
    SELECT @constraintName = df.name
    FROM sys.default_constraints df
    INNER JOIN sys.columns c ON c.default_object_id = df.object_id
    INNER JOIN sys.tables t ON t.object_id = c.object_id
    WHERE t.name = 'AspNetUsers' AND c.name = 'FullName';

    IF @constraintName IS NULL
    BEGIN
        ALTER TABLE [AspNetUsers] ADD CONSTRAINT [DF_AspNetUsers_FullName] DEFAULT('') FOR [FullName];
    END
END

IF COL_LENGTH('AspNetUsers', 'IsActive') IS NOT NULL
BEGIN
    DECLARE @constraintName2 nvarchar(200);
    SELECT @constraintName2 = df.name
    FROM sys.default_constraints df
    INNER JOIN sys.columns c ON c.default_object_id = df.object_id
    INNER JOIN sys.tables t ON t.object_id = c.object_id
    WHERE t.name = 'AspNetUsers' AND c.name = 'IsActive';

    IF @constraintName2 IS NULL
    BEGIN
        ALTER TABLE [AspNetUsers] ADD CONSTRAINT [DF_AspNetUsers_IsActive] DEFAULT(1) FOR [IsActive];
    END
END
");
        }
        catch
        {
            // If this fails we still try to continue; worst case seeding falls back to previous behavior.
        }

        var roleManager = provider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = provider.GetRequiredService<UserManager<IdentityUser>>();

        string[] roles =
        {
            "super_admin",
            "admin",
            "sales_manager",
            "project_manager",
            "sales_rep",
            "finance_manager",
        };

        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        async Task SeedUser(string email, string password, string role)
        {
            var user = await userManager.FindByEmailAsync(email);
            if (user is null)
            {
                user = new IdentityUser
                {
                    UserName = email,
                    Email = email,
                    EmailConfirmed = true,
                };

                var createResult = await userManager.CreateAsync(user, password);
                if (!createResult.Succeeded)
                {
                    throw new InvalidOperationException($"Failed to create seed user {email}: {string.Join(", ", createResult.Errors.Select(e => e.Description))}");
                }
            }
            else
            {
                // User already exists:
                // By default we DO NOT reset the password, so password changes in the website persist.
                // If you ever want to force the documented seed password again, set:
                //   RESET_SEED_PASSWORDS=true
                var shouldResetSeedPasswords =
                    string.Equals(Environment.GetEnvironmentVariable("RESET_SEED_PASSWORDS"), "true", StringComparison.OrdinalIgnoreCase);

                if (shouldResetSeedPasswords)
                {
                    var resetToken = await userManager.GeneratePasswordResetTokenAsync(user);
                    var resetResult = await userManager.ResetPasswordAsync(user, resetToken, password);
                    if (!resetResult.Succeeded)
                    {
                        throw new InvalidOperationException($"Failed to reset password for seed user {email}: {string.Join(", ", resetResult.Errors.Select(e => e.Description))}");
                    }
                }
            }

            if (!await userManager.IsInRoleAsync(user, role))
            {
                await userManager.AddToRoleAsync(user, role);
            }
        }

        await SeedUser("amr@amtsolutions.com", "Amr@12345!", "super_admin");
        await SeedUser("dina@amtsolutions.com", "Dina@12345!", "admin");
        await SeedUser("karim@amtsolutions.com", "Karim@12345!", "sales_manager");
        await SeedUser("nour@amtsolutions.com", "Nour@12345!", "project_manager");
        await SeedUser("sara@amtsolutions.com", "Sara@12345!", "sales_rep");
        await SeedUser("hassan@amtsolutions.com", "Hassan@12345!", "finance_manager");
    }
}

