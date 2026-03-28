using AMTSolutions.Application.Leads;
using AMTSolutions.Application.Customers;
using AMTSolutions.Application.Projects;
using AMTSolutions.Application.Tasks;
using AMTSolutions.Application.Invoices;
using AMTSolutions.Application.Expenses;
using AMTSolutions.Application.Products;
using AMTSolutions.Infrastructure.Data;
using AMTSolutions.Infrastructure.Customers;
using AMTSolutions.Infrastructure.Leads;
using AMTSolutions.Infrastructure.Projects;
using AMTSolutions.Infrastructure.Tasks;
using AMTSolutions.Infrastructure.Invoices;
using AMTSolutions.Infrastructure.Expenses;
using AMTSolutions.Infrastructure.Products;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using AMTSolutions.Api;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Collections.Concurrent;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;
using System.Net;
using System.Net.Mail;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.StaticFiles;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

var configuredConnectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
    ?? builder.Configuration.GetConnectionString("DefaultConnection");
var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
var postgresFromDatabaseUrl = false;

if (!string.IsNullOrWhiteSpace(databaseUrl))
{
    try
    {
        var uri = new Uri(databaseUrl);
        var userInfo = uri.UserInfo.Split(':', 2);
        var user = Uri.UnescapeDataString(userInfo[0]);
        var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
        var database = uri.AbsolutePath.Trim('/');
        var host = uri.Host;
        var port = uri.Port > 0 ? uri.Port : 5432;

        // Render and many clouds have no IPv6 egress. Supabase "Direct" (db.*.supabase.co) often resolves to IPv6 only —
        // use Dashboard → Connect → Session pooler (IPv4-compatible), not the direct URI. See:
        // https://supabase.com/docs/guides/troubleshooting/supabase--your-network-ipv4-and-ipv6-compatibility
        if (host.Contains("db.", StringComparison.OrdinalIgnoreCase) &&
            host.Contains("supabase.co", StringComparison.OrdinalIgnoreCase))
        {
            Console.WriteLine("[DB CONFIG] Using direct db.*.supabase.co — if you see IPv6 'Network is unreachable' on Render, switch DATABASE_URL to the Session pooler URI (Connect → Session pooler).");
        }

        configuredConnectionString = $"Host={host};Port={port};Database={database};Username={user};Password={password};SSL Mode=Require;Trust Server Certificate=true";
        postgresFromDatabaseUrl = true;
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[DB CONFIG] Failed to parse DATABASE_URL, falling back to other config: {ex.Message}");
    }
}

var useInMemoryFallback =
    string.IsNullOrWhiteSpace(configuredConnectionString)
    || configuredConnectionString.Contains("Trusted_Connection=True", StringComparison.OrdinalIgnoreCase)
    || configuredConnectionString.Contains("Server=LAPTOP-", StringComparison.OrdinalIgnoreCase)
    || configuredConnectionString.Contains("(localdb)", StringComparison.OrdinalIgnoreCase);

builder.Services.AddCors(options =>
{
    var corsOrigins = (Environment.GetEnvironmentVariable("CORS_ORIGINS")
        ?? "http://localhost:5173,https://amt-solutions.net,https://www.amt-solutions.net")
        .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(corsOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddDbContext<AmtsDbContext>(options =>
{
    if (useInMemoryFallback)
    {
        options.UseInMemoryDatabase("AMTSolutionsFallbackDb");
    }
    else if (postgresFromDatabaseUrl)
    {
        options.UseNpgsql(configuredConnectionString!, b => b.MigrationsAssembly("AMTSolutions.Api"));
    }
    else
    {
        options.UseSqlServer(configuredConnectionString!, b => b.MigrationsAssembly("AMTSolutions.Api"));
    }
});

// Shared JWT signing key string (>= 256 bits) used for BOTH token creation and validation.
var jwtSigningKeyString = "super-dev-jwt-signing-key-0123456789-ABCDEFGH-ijklmnop";

builder.Services
    .AddIdentityCore<IdentityUser>(options =>
    {
        options.User.RequireUniqueEmail = true;
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AmtsDbContext>()
    .AddSignInManager()
    .AddDefaultTokenProviders();

// JWT signing key – hard-coded strong dev key (>= 256 bits) to avoid misconfiguration issues.
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSigningKeyString));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = signingKey,
        ClockSkew = TimeSpan.FromMinutes(5),
    };
});

builder.Services.AddAuthorization();

builder.Services.AddScoped<ILeadService, LeadService>();
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<IInvoiceService, InvoiceService>();
builder.Services.AddScoped<IExpenseService, ExpenseService>();
builder.Services.AddScoped<IProductService, ProductService>();

// Simple in-memory store for roles & permissions so the Roles & Permissions page can use live API data.
// In a production system these would be backed by a database / identity system.
var permissionStore = new List<PermissionDto>
{
    // Leads
    new("leads_view", "View Leads", "Can view leads list and details", "leads", "view"),
    new("leads_create", "Create Leads", "Can create new leads", "leads", "create"),
    new("leads_edit", "Edit Leads", "Can edit lead information", "leads", "edit"),
    new("leads_delete", "Delete Leads", "Can delete leads", "leads", "delete"),
    new("leads_export", "Export Leads", "Can export leads data", "leads", "export"),
    // Customers
    new("customers_view", "View Customers", "Can view customer list and details", "customers", "view"),
    new("customers_create", "Create Customers", "Can create new customers", "customers", "create"),
    new("customers_edit", "Edit Customers", "Can edit customer information", "customers", "edit"),
    new("customers_delete", "Delete Customers", "Can delete customers", "customers", "delete"),
    new("customers_export", "Export Customers", "Can export customer data", "customers", "export"),
    // Projects
    new("projects_view", "View Projects", "Can view project list and details", "projects", "view"),
    new("projects_create", "Create Projects", "Can create new projects", "projects", "create"),
    new("projects_edit", "Edit Projects", "Can edit project information", "projects", "edit"),
    new("projects_delete", "Delete Projects", "Can delete projects", "projects", "delete"),
    // Tasks
    new("tasks_view", "View Tasks", "Can view tasks", "tasks", "view"),
    new("tasks_create", "Create Tasks", "Can create new tasks", "tasks", "create"),
    new("tasks_edit", "Edit Tasks", "Can edit tasks", "tasks", "edit"),
    new("tasks_delete", "Delete Tasks", "Can delete tasks", "tasks", "delete"),
    // Invoices
    new("invoices_view", "View Invoices", "Can view invoices", "invoices", "view"),
    new("invoices_create", "Create Invoices", "Can create new invoices", "invoices", "create"),
    new("invoices_edit", "Edit Invoices", "Can edit invoices", "invoices", "edit"),
    new("invoices_delete", "Delete Invoices", "Can delete invoices", "invoices", "delete"),
    new("invoices_approve", "Approve Invoices", "Can approve invoices", "invoices", "approve"),
    // Expenses
    new("expenses_view", "View Expenses", "Can view expenses", "expenses", "view"),
    new("expenses_create", "Create Expenses", "Can create new expenses", "expenses", "create"),
    new("expenses_edit", "Edit Expenses", "Can edit expenses", "expenses", "edit"),
    new("expenses_delete", "Delete Expenses", "Can delete expenses", "expenses", "delete"),
    new("expenses_approve", "Approve Expenses", "Can approve expenses", "expenses", "approve"),
    // Reports
    new("reports_view", "View Reports", "Can view reports", "reports", "view"),
    new("reports_export", "Export Reports", "Can export reports", "reports", "export"),
    // Users
    new("users_view", "View Users", "Can view users", "users", "view"),
    new("users_create", "Create Users", "Can create new users", "users", "create"),
    new("users_edit", "Edit Users", "Can edit users", "users", "edit"),
    new("users_delete", "Delete Users", "Can delete users", "users", "delete"),
    // Roles
    new("roles_view", "View Roles", "Can view roles", "roles", "view"),
    new("roles_create", "Create Roles", "Can create new roles", "roles", "create"),
    new("roles_edit", "Edit Roles", "Can edit roles", "roles", "edit"),
    new("roles_delete", "Delete Roles", "Can delete roles", "roles", "delete"),
    // Settings
    new("settings_view", "View Settings", "Can view settings", "settings", "view"),
    new("settings_edit", "Edit Settings", "Can edit settings", "settings", "edit"),
    // Website
    new("website_view", "View Website CMS", "Can view website CMS", "website", "view"),
    new("website_edit", "Edit Website", "Can edit website content", "website", "edit"),
};

var roleStore = new List<RoleDto>
{
    new(
        "super_admin",
        "Super Admin",
        "Full access to all system features and settings",
        permissionStore.Select(p => p.Id).ToArray(),
        true,
        0,
        new DateTime(2023, 1, 1, 0, 0, 0, DateTimeKind.Utc),
        new DateTime(2023, 1, 1, 0, 0, 0, DateTimeKind.Utc)
    ),
    new(
        "admin",
        "Admin",
        "Administrative access with limited system settings",
        permissionStore.Where(p => p.Id is not ("roles_delete" or "users_delete")).Select(p => p.Id).ToArray(),
        true,
        0,
        new DateTime(2023, 1, 1, 0, 0, 0, DateTimeKind.Utc),
        new DateTime(2023, 1, 1, 0, 0, 0, DateTimeKind.Utc)
    ),
    new(
        "sales_manager",
        "Sales Manager",
        "Manages sales team and customer relationships",
        new[]
        {
            "leads_view", "leads_create", "leads_edit",
            "customers_view", "customers_create", "customers_edit",
            "projects_view",
            "tasks_view", "tasks_create", "tasks_edit",
            "invoices_view",
            "reports_view",
        },
        true,
        0,
        new DateTime(2023, 1, 1, 0, 0, 0, DateTimeKind.Utc),
        new DateTime(2023, 1, 1, 0, 0, 0, DateTimeKind.Utc)
    ),
    new(
        "sales_rep",
        "Sales Representative",
        "Handles leads and customer communication",
        new[]
        {
            "leads_view", "leads_create", "leads_edit",
            "customers_view", "customers_create",
            "tasks_view", "tasks_create", "tasks_edit",
        },
        true,
        0,
        new DateTime(2023, 1, 1, 0, 0, 0, DateTimeKind.Utc),
        new DateTime(2023, 1, 1, 0, 0, 0, DateTimeKind.Utc)
    ),
    new(
        "project_manager",
        "Project Manager",
        "Manages projects and team tasks",
        new[]
        {
            "projects_view", "projects_create", "projects_edit",
            "tasks_view", "tasks_create", "tasks_edit",
            "customers_view",
            "leads_view",
            "reports_view",
        },
        true,
        0,
        new DateTime(2023, 1, 1, 0, 0, 0, DateTimeKind.Utc),
        new DateTime(2023, 1, 1, 0, 0, 0, DateTimeKind.Utc)
    ),
    new(
        "finance_manager",
        "Finance Manager",
        "Manages invoices, expenses, and financial reports",
        new[]
        {
            "invoices_view", "invoices_create", "invoices_edit", "invoices_approve",
            "expenses_view", "expenses_create", "expenses_edit", "expenses_approve",
            "reports_view",
            "customers_view",
            "projects_view",
        },
        true,
        0,
        new DateTime(2023, 1, 1, 0, 0, 0, DateTimeKind.Utc),
        new DateTime(2023, 1, 1, 0, 0, 0, DateTimeKind.Utc)
    ),
};

// In-memory users with different roles, used for Assigned To dropdowns and role statistics.
var userStore = new List<UserAccountDto>
{
    new("1", "Amr",   "Mohamed", "amr@amtsolutions.com",    "super_admin",    true),
    new("2", "Dina",  "Saleh",   "dina@amtsolutions.com",   "admin",          true),
    new("3", "Karim", "Fathy",   "karim@amtsolutions.com",  "sales_manager",  true),
    new("4", "Nour",  "El-Din",  "nour@amtsolutions.com",   "project_manager",true),
    new("5", "Sara",  "Ahmed",   "sara@amtsolutions.com",   "sales_rep",      true),
    new("6", "Hassan","Kamal",   "hassan@amtsolutions.com", "finance_manager",true),
};

// Update role user counts based on assigned users
for (var i = 0; i < roleStore.Count; i++)
{
    var role = roleStore[i];
    var count = userStore.Count(u => string.Equals(u.RoleId, role.Id, StringComparison.OrdinalIgnoreCase));
    roleStore[i] = role with { UserCount = count };
}

// Simple in-memory website settings for Website Management page
var websiteSettingsStore = new WebsiteSettingsDto(
    HeroTitle: "We Build Brands That Drive Growth",
    HeroSubtitle: "AMT Solutions is a full-service marketing agency helping businesses achieve extraordinary results",
    HeroCtaText: "Get Free Proposal",
    StatsProjectsDelivered: "150+",
    StatsHappyClients: "80+",
    StatsIndustryAwards: "12",
    StatsClientSatisfaction: "98%",
    MetaTitle: "AMT Solutions - Premier Marketing Agency in Egypt",
    MetaDescription: "AMT Solutions is a leading marketing agency in Egypt, helping businesses grow through strategic branding, digital marketing, and creative solutions.",
    MetaKeywords: "marketing agency, branding, digital marketing, Egypt, Cairo"
);

// Simple in-memory services catalog for Website Management - Services tab
var websiteServicesStore = new List<WebsiteServiceDto>
{
    new(
        Id: "1",
        Slug: "branding",
        Title: "Branding & Identity",
        ShortDescription: "Create a powerful brand identity that resonates with your audience and sets you apart from competitors.",
        FullDescription: "Your brand is more than just a logo — it's the complete experience your customers have with your company. We craft comprehensive brand identities that tell your story, communicate your values, and create lasting impressions across every touchpoint.",
        Icon: "Palette",
        Order: 1,
        IsActive: true
    ),
    new(
        Id: "2",
        Slug: "social-media",
        Title: "Social Media Marketing",
        ShortDescription: "Build engaged communities and drive meaningful conversations across all social platforms.",
        FullDescription: "We create data-driven social media strategies that build authentic connections, increase brand awareness, and drive conversions across all major platforms.",
        Icon: "Share2",
        Order: 2,
        IsActive: true
    ),
    new(
        Id: "3",
        Slug: "performance",
        Title: "Performance Marketing",
        ShortDescription: "Maximize ROI with data-driven advertising campaigns across digital channels.",
        FullDescription: "Our performance marketing team specializes in creating and optimizing campaigns that deliver measurable results using advanced targeting and continuous optimization.",
        Icon: "TrendingUp",
        Order: 3,
        IsActive: true
    ),
    new(
        Id: "4",
        Slug: "web-design",
        Title: "Web Design & Development",
        ShortDescription: "Stunning, high-performing websites that convert visitors into customers.",
        FullDescription: "We design and develop beautiful, user-friendly websites that not only look great but also drive results for your business.",
        Icon: "Globe",
        Order: 4,
        IsActive: true
    )
};

// Debug helper: keep track of the last raw website-services payload we received
string? lastWebsiteServicesRawBody = null;

// Simple in-memory testimonials for Website Management - Testimonials tab
var websiteTestimonialsStore = new List<WebsiteTestimonialDto>
{
    new(
        Id: "1",
        Name: "Ahmed Hassan",
        Position: "CEO",
        Company: "Nile Views Developments",
        Content: "AMT Solutions transformed our brand completely. Their strategic approach and creative execution exceeded our expectations.",
        Rating: 5,
        Order: 1,
        IsActive: true
    )
};

// Debug helper: keep track of the last raw website-testimonials payload we received
string? lastWebsiteTestimonialsRawBody = null;

// Per-user profile (keyed by email) so the header shows the logged-in user's name
var profileStore = new Dictionary<string, ProfileSettingsDto>(StringComparer.OrdinalIgnoreCase)
{
    ["amr@amtsolutions.com"] = new ProfileSettingsDto("Amr", "Mohamed", "amr@amtsolutions.com", "+20 100 123 4567"),
    ["dina@amtsolutions.com"] = new ProfileSettingsDto("Dina", "Saleh", "dina@amtsolutions.com", "+20 100 123 4567"),
    ["karim@amtsolutions.com"] = new ProfileSettingsDto("Karim", "Fathy", "karim@amtsolutions.com", "+20 100 123 4567"),
    ["nour@amtsolutions.com"] = new ProfileSettingsDto("Nour", "El-Din", "nour@amtsolutions.com", "+20 100 123 4567"),
    ["sara@amtsolutions.com"] = new ProfileSettingsDto("Sara", "Ahmed", "sara@amtsolutions.com", "+20 100 123 4567"),
    ["hassan@amtsolutions.com"] = new ProfileSettingsDto("Hassan", "Kamal", "hassan@amtsolutions.com", "+20 100 123 4567"),
};

var notificationSettingsStore = new NotificationSettingsDto(
    NewLeadAssigned: true,
    TaskDueSoon: true,
    InvoicePaid: true,
    ProjectUpdates: true
);

var securitySettingsStore = new SecuritySettingsDto(
    TwoFactorEnabled: false
);

// Simple in-memory contact messages coming from the public website contact form
var contactMessagesStore = new List<ContactMessageDto>();

var app = builder.Build();

// Seed Identity roles/users and ensure CompanySettings row/table exist
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AmtsDbContext>();

    // PostgreSQL (e.g. Supabase on Render): apply schema so Identity tables (AspNetRoles, etc.) exist before seeding.
    if (!useInMemoryFallback && db.Database.IsNpgsql())
    {
        await db.Database.MigrateAsync();
    }

    await IdentitySeeder.SeedAsync(scope.ServiceProvider);

    if (db.Database.IsSqlServer())
    {
        // Ensure CompanySettings table exists (for environments without migrations)
        db.Database.ExecuteSqlRaw(@"
IF OBJECT_ID('dbo.CompanySettings', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[CompanySettings](
        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [CompanyName] NVARCHAR(200) NOT NULL,
        [Email] NVARCHAR(255) NOT NULL,
        [Phone] NVARCHAR(50) NULL,
        [Website] NVARCHAR(255) NULL,
        [Address] NVARCHAR(500) NULL,
        [City] NVARCHAR(100) NULL,
        [Country] NVARCHAR(100) NULL,
        [TaxId] NVARCHAR(100) NULL,
        [LogoUrl] NVARCHAR(MAX) NULL,
        [CreatedAtUtc] DATETIME2 NOT NULL,
        [UpdatedAtUtc] DATETIME2 NULL
    );
END
ELSE
BEGIN
    -- Always ensure LogoUrl can hold long base64 data URLs
    IF COL_LENGTH('CompanySettings', 'LogoUrl') IS NOT NULL
    BEGIN
        ALTER TABLE [dbo].[CompanySettings] ALTER COLUMN [LogoUrl] NVARCHAR(MAX) NULL;
    END
END
");

        // Ensure AspNetUsers has TwoFactorEnabled (fallback)
        db.Database.ExecuteSqlRaw(@"
IF COL_LENGTH('AspNetUsers', 'TwoFactorEnabled') IS NULL
BEGIN
    ALTER TABLE [dbo].[AspNetUsers] ADD [TwoFactorEnabled] BIT NOT NULL DEFAULT 0;
END
");

        // UserSecurity table = source of truth for 2FA and where to send codes
        db.Database.ExecuteSqlRaw(@"
IF OBJECT_ID('dbo.UserSecurity', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[UserSecurity](
        [UserId] NVARCHAR(450) NOT NULL PRIMARY KEY,
        [TwoFactorEnabled] BIT NOT NULL DEFAULT 0,
        [TwoFactorEmail] NVARCHAR(255) NULL
    );
END
ELSE
BEGIN
    IF COL_LENGTH('dbo.UserSecurity', 'TwoFactorEmail') IS NULL
        ALTER TABLE [dbo].[UserSecurity] ADD [TwoFactorEmail] NVARCHAR(255) NULL;
END
");
    }

    if (!db.CompanySettings.Any())
    {
        db.CompanySettings.Add(new AMTSolutions.Core.Entities.CompanySettings
        {
            CompanyName = "AMT Solutions",
            Email = "hello@amtsolutions.com",
            Phone = "+20 100 123 4567",
            Website = "www.amtsolutions.com",
            Address = "123 Nile Corniche, Suite 500",
            City = "Cairo",
            Country = "Egypt",
            TaxId = "123456789",
            LogoUrl = "/images/amt-logo.png",
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = null
        });
    }

    var defaultExpenseCategories = new[]
    {
        "Marketing",
        "Software",
        "Office Supplies",
        "Travel",
        "Utilities",
        "Salaries",
        "Equipment",
        "Other"
    };

    var existingCategoryNames = db.ExpenseCategories
        .Select(c => c.Name)
        .ToList();

    foreach (var categoryName in defaultExpenseCategories)
    {
        var exists = existingCategoryNames.Any(n =>
            string.Equals(n, categoryName, StringComparison.OrdinalIgnoreCase));
        if (exists) continue;

        db.ExpenseCategories.Add(new AMTSolutions.Core.Entities.ExpenseCategory
        {
            Name = categoryName
        });
    }

    db.SaveChanges();
}

// Return JSON for all errors so the frontend can show a message (avoids developer exception page for binding/pipeline errors)
app.UseExceptionHandler(errApp =>
{
    errApp.Run(async ctx =>
    {
        var ex = ctx.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>()?.Error;
        ctx.Response.StatusCode = ex is ArgumentException ? 400 : 500;
        ctx.Response.ContentType = "application/json";
        var msg = ex?.InnerException?.Message ?? ex?.Message ?? "An error occurred";
        await ctx.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(new { error = msg }));
    });
});

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// In development we serve HTTP only to avoid HTTPS redirect / dev-certificate issues with fetch.
app.UseCors();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.CacheControl = "public,max-age=86400";
    },
});
app.UseAuthentication();
app.UseAuthorization();

// Leads
app.MapGet("/api/leads", async (ILeadService service, CancellationToken ct) =>
{
    var leads = await service.GetAllAsync(ct);
    return Results.Ok(leads);
});

app.MapGet("/api/leads/{id:int}", async (int id, ILeadService service, CancellationToken ct) =>
{
    var lead = await service.GetByIdAsync(id, ct);
    return lead is null ? Results.NotFound() : Results.Ok(lead);
});

app.MapPost("/api/leads", async (CreateLeadRequest request, ILeadService service, CancellationToken ct) =>
{
    var created = await service.CreateAsync(request, ct);
    return Results.Created($"/api/leads/{created.Id}", created);
});

app.MapPut("/api/leads/{id:int}", async (int id, UpdateLeadRequest request, ILeadService service, CancellationToken ct) =>
{
    var updated = await service.UpdateAsync(id, request, ct);
    return updated is null ? Results.NotFound() : Results.Ok(updated);
});

app.MapPatch("/api/leads/{id:int}/stage", async (int id, UpdateLeadStageRequest request, ILeadService service, CancellationToken ct) =>
{
    var updated = await service.UpdateStageAsync(id, request, ct);
    return updated is null ? Results.NotFound() : Results.Ok(updated);
});

app.MapDelete("/api/leads/{id:int}", async (int id, ILeadService service, CancellationToken ct) =>
{
    var deleted = await service.DeleteAsync(id, ct);
    return deleted ? Results.NoContent() : Results.NotFound();
});

// Website contact messages (from public Contact form)
app.MapGet("/api/contact-messages", () =>
{
    // Return newest first
    return Results.Ok(contactMessagesStore
        .OrderByDescending(m => m.CreatedAtUtc)
        .ToList());
});

app.MapPost("/api/contact-messages", (CreateContactMessageRequest request) =>
{
    if (string.IsNullOrWhiteSpace(request.Name) ||
        string.IsNullOrWhiteSpace(request.Email) ||
        string.IsNullOrWhiteSpace(request.Message))
    {
        return Results.BadRequest(new { error = "Name, email, and message are required." });
    }

    var msg = new ContactMessageDto(
        Id: Guid.NewGuid().ToString(),
        Name: request.Name.Trim(),
        Email: request.Email.Trim(),
        Phone: string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim(),
        Company: string.IsNullOrWhiteSpace(request.Company) ? null : request.Company.Trim(),
        Message: request.Message.Trim(),
        Status: "pending",
        CreatedAtUtc: DateTime.UtcNow
    );

    contactMessagesStore.Add(msg);
    return Results.Created($"/api/contact-messages/{msg.Id}", msg);
});

app.MapPost("/api/contact-messages/{id}/accept", async (string id, ILeadService leadService, CancellationToken ct) =>
{
    var existingIndex = contactMessagesStore.FindIndex(m => string.Equals(m.Id, id, StringComparison.OrdinalIgnoreCase));
    if (existingIndex < 0)
    {
        return Results.Json(new { error = "Contact message not found." }, statusCode: 404);
    }

    var msg = contactMessagesStore[existingIndex];
    if (!string.Equals(msg.Status, "pending", StringComparison.OrdinalIgnoreCase))
    {
        return Results.BadRequest(new { error = "Only pending messages can be accepted." });
    }

    var createLead = new CreateLeadRequest(
        Name: msg.Name,
        Email: msg.Email,
        Phone: msg.Phone,
        Company: msg.Company,
        Source: "Website Contact Form",
        Notes: msg.Message
    );

    var created = await leadService.CreateAsync(createLead, ct);

    contactMessagesStore[existingIndex] = msg with { Status = "accepted" };

    return Results.Ok(new { leadId = created.Id });
});

app.MapPost("/api/contact-messages/{id}/dismiss", (string id) =>
{
    var existingIndex = contactMessagesStore.FindIndex(m => string.Equals(m.Id, id, StringComparison.OrdinalIgnoreCase));
    if (existingIndex < 0)
    {
        return Results.Json(new { error = "Contact message not found." }, statusCode: 404);
    }

    var msg = contactMessagesStore[existingIndex];
    if (!string.Equals(msg.Status, "pending", StringComparison.OrdinalIgnoreCase))
    {
        return Results.BadRequest(new { error = "Only pending messages can be dismissed." });
    }

    contactMessagesStore[existingIndex] = msg with { Status = "dismissed" };
    return Results.Ok();
});

// Tasks
app.MapGet("/api/tasks", async (ITaskService service, CancellationToken ct) =>
{
    var tasks = await service.GetAllAsync(ct);
    return Results.Ok(tasks);
});

app.MapGet("/api/tasks/{id:int}", async (int id, ITaskService service, CancellationToken ct) =>
{
    var task = await service.GetByIdAsync(id, ct);
    return task is null ? Results.NotFound() : Results.Ok(task);
});

app.MapPost("/api/tasks", async (CreateTaskRequest request, ITaskService service, CancellationToken ct) =>
{
    try
    {
        var created = await service.CreateAsync(request, ct);
        return Results.Created($"/api/tasks/{created.Id}", created);
    }
    catch (ArgumentException ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
    catch (DbUpdateException ex)
    {
        var msg = ex.InnerException?.Message ?? ex.Message;
        return Results.BadRequest(new { error = "Database error: " + msg });
    }
    catch (Exception ex)
    {
        var msg = ex.InnerException?.Message ?? ex.Message;
        return Results.BadRequest(new { error = msg });
    }
});

app.MapDelete("/api/tasks/{id:int}", async (int id, ITaskService service, CancellationToken ct) =>
{
    try
    {
        var deleted = await service.DeleteAsync(id, ct);
        if (!deleted)
        {
            return Results.Json(new { error = "Task not found." }, statusCode: 404);
        }

        return Results.NoContent();
    }
    catch (DbUpdateException ex)
    {
        var msg = ex.InnerException?.Message ?? ex.Message;
        return Results.BadRequest(new { error = "Database error: " + msg });
    }
    catch (Exception ex)
    {
        var msg = ex.InnerException?.Message ?? ex.Message;
        return Results.BadRequest(new { error = msg });
    }
});

app.MapPut("/api/tasks/{id:int}", async (int id, UpdateTaskRequest request, ITaskService service, CancellationToken ct) =>
{
    try
    {
        var updated = await service.UpdateAsync(id, request, ct);
        return updated is null ? Results.Json(new { error = "Task not found." }, statusCode: 404) : Results.Ok(updated);
    }
    catch (ArgumentException ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
    catch (DbUpdateException ex)
    {
        var msg = ex.InnerException?.Message ?? ex.Message;
        return Results.BadRequest(new { error = "Database error: " + msg });
    }
    catch (Exception ex)
    {
        var msg = ex.InnerException?.Message ?? ex.Message;
        return Results.BadRequest(new { error = msg });
    }
});

// Customers
app.MapGet("/api/customers", async (ICustomerService service, CancellationToken ct) =>
{
    var customers = await service.GetAllAsync(ct);
    return Results.Ok(customers);
});

app.MapPost("/api/customers", async (CreateCustomerRequest request, ICustomerService service, CancellationToken ct) =>
{
    var created = await service.CreateAsync(request, ct);
    return Results.Created($"/api/customers/{created.Id}", created);
});

app.MapPut("/api/customers/{id:int}", async (int id, CreateCustomerRequest request, ICustomerService service, CancellationToken ct) =>
{
    var updated = await service.UpdateAsync(id, request, ct);
    return updated is null ? Results.NotFound() : Results.Ok(updated);
});

app.MapDelete("/api/customers/{id:int}", async (int id, ICustomerService service, CancellationToken ct) =>
{
    var deleted = await service.DeleteAsync(id, ct);
    return deleted ? Results.NoContent() : Results.NotFound();
});

// Projects
app.MapGet("/api/projects", async (IProjectService service, CancellationToken ct) =>
{
    var projects = await service.GetAllAsync(ct);
    return Results.Ok(projects);
});

app.MapPost("/api/projects", async (CreateProjectRequest request, IProjectService service, CancellationToken ct) =>
{
    var created = await service.CreateAsync(request, ct);
    return Results.Created($"/api/projects/{created.Id}", created);
});

app.MapPut("/api/projects/{id:int}", async (int id, CreateProjectRequest request, IProjectService service, CancellationToken ct) =>
{
    var updated = await service.UpdateAsync(id, request, ct);
    return updated is null ? Results.NotFound() : Results.Ok(updated);
});

app.MapDelete("/api/projects/{id:int}", async (int id, IProjectService service, CancellationToken ct) =>
{
    var deleted = await service.DeleteAsync(id, ct);
    return deleted ? Results.NoContent() : Results.NotFound();
});

app.MapPatch("/api/projects/{id:int}/website", async (int id, PatchProjectWebsiteRequest request, IProjectService service, CancellationToken ct) =>
{
    var updated = await service.PatchWebsiteAsync(id, request, ct);
    return updated is null ? Results.NotFound() : Results.Ok(updated);
});

// Portfolio image upload (saves under wwwroot/uploads/portfolio; requires sign-in).
// Set PublicBaseUrl in appsettings or PUBLIC_BASE_URL when the API is behind a reverse proxy so image URLs are correct.
app.MapPost("/api/projects/{id:int}/portfolio-image", async (
    int id,
    IFormFile file,
    IProjectService projectService,
    IWebHostEnvironment env,
    IConfiguration config,
    HttpRequest request,
    CancellationToken ct) =>
{
    if (file is null || file.Length == 0)
    {
        return Results.BadRequest(new { error = "No file uploaded. Use form field name \"file\"." });
    }

    const long maxBytes = 5 * 1024 * 1024;
    if (file.Length > maxBytes)
    {
        return Results.BadRequest(new { error = "Image must be 5 MB or smaller." });
    }

    var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
    var allowed = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
    if (!allowed.Contains(ext))
    {
        return Results.BadRequest(new { error = "Allowed types: JPG, PNG, GIF, WebP." });
    }

    var webRoot = env.WebRootPath;
    if (string.IsNullOrEmpty(webRoot))
    {
        webRoot = Path.Combine(env.ContentRootPath, "wwwroot");
    }

    var uploadDir = Path.Combine(webRoot, "uploads", "portfolio");
    Directory.CreateDirectory(uploadDir);

    var safeName = $"p{id}-{Guid.NewGuid():N}{ext}";
    var physicalPath = Path.Combine(uploadDir, safeName);
    await using (var stream = File.Create(physicalPath))
    {
        await file.CopyToAsync(stream, ct);
    }

    var configured = config["PublicBaseUrl"]?.Trim().TrimEnd('/');
    if (string.IsNullOrEmpty(configured))
    {
        configured = Environment.GetEnvironmentVariable("PUBLIC_BASE_URL")?.Trim().TrimEnd('/');
    }

    var baseUrl = !string.IsNullOrEmpty(configured)
        ? configured
        : $"{request.Scheme}://{request.Host.Value}".TrimEnd('/');

    var publicUrl = $"{baseUrl}/uploads/portfolio/{safeName}";

    var patch = new PatchProjectWebsiteRequest { PublicPortfolioImageUrl = publicUrl };
    var updated = await projectService.PatchWebsiteAsync(id, patch, ct);
    return updated is null ? Results.NotFound() : Results.Ok(updated);
})
.RequireAuthorization()
.DisableAntiforgery();

// Public portfolio (no auth; used by marketing site)
app.MapGet("/api/public/portfolio", async (IProjectService service, CancellationToken ct) =>
{
    var list = await service.GetPublicPortfolioAsync(ct);
    return Results.Ok(list);
});

app.MapGet("/api/public/portfolio/{slug}", async (string slug, IProjectService service, CancellationToken ct) =>
{
    var detail = await service.GetPublicPortfolioBySlugAsync(slug, ct);
    return detail is null ? Results.NotFound() : Results.Ok(detail);
});

// Invoices
app.MapGet("/api/invoices", async (IInvoiceService service, CancellationToken ct) =>
{
    var list = await service.GetAllAsync(ct);
    return Results.Ok(list);
});

app.MapGet("/api/invoices/{id:int}", async (int id, IInvoiceService service, CancellationToken ct) =>
{
    var inv = await service.GetByIdAsync(id, ct);
    return inv is null ? Results.NotFound() : Results.Ok(inv);
});

app.MapPost("/api/invoices", async (CreateInvoiceRequest request, IInvoiceService service, CancellationToken ct) =>
{
    try
    {
        var created = await service.CreateAsync(request, ct);
        return Results.Created($"/api/invoices/{created.Id}", created);
    }
    catch (InvalidOperationException ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
    catch (DbUpdateException ex)
    {
        var message = ex.InnerException?.Message ?? ex.Message;
        return Results.BadRequest(new { error = "Database error: " + message });
    }
});

app.MapPatch("/api/invoices/{id:int}/status", async (int id, UpdateInvoiceStatusRequest request, IInvoiceService service, CancellationToken ct) =>
{
    var updated = await service.UpdateStatusAsync(id, request, ct);
    return updated is null ? Results.NotFound() : Results.Ok(updated);
});

app.MapDelete("/api/invoices/{id:int}", async (int id, IInvoiceService service, CancellationToken ct) =>
{
    var deleted = await service.DeleteAsync(id, ct);
    return deleted ? Results.NoContent() : Results.NotFound();
});

// Expense categories
app.MapGet("/api/expense-categories", async (IExpenseService service, CancellationToken ct) =>
{
    var list = await service.GetCategoriesAsync(ct);
    return Results.Ok(list);
});

// Expenses
app.MapGet("/api/expenses", async (IExpenseService service, CancellationToken ct) =>
{
    var list = await service.GetAllAsync(ct);
    return Results.Ok(list);
});

app.MapGet("/api/expenses/{id:int}", async (int id, IExpenseService service, CancellationToken ct) =>
{
    var exp = await service.GetByIdAsync(id, ct);
    return exp is null ? Results.NotFound() : Results.Ok(exp);
});

app.MapPost("/api/expenses", async (CreateExpenseRequest request, IExpenseService service, CancellationToken ct) =>
{
    try
    {
        var created = await service.CreateAsync(request, ct);
        return Results.Created($"/api/expenses/{created.Id}", created);
    }
    catch (ArgumentException ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
    catch (DbUpdateException ex)
    {
        var msg = ex.InnerException?.Message ?? ex.Message;
        return Results.BadRequest(new { error = "Database error: " + msg });
    }
    catch (Exception ex)
    {
        var msg = ex.InnerException?.Message ?? ex.Message;
        return Results.BadRequest(new { error = msg });
    }
});

app.MapPut("/api/expenses/{id:int}", async (int id, UpdateExpenseRequest request, IExpenseService service, CancellationToken ct) =>
{
    try
    {
        var updated = await service.UpdateAsync(id, request, ct);
        return updated is null ? Results.Json(new { error = "Expense not found." }, statusCode: 404) : Results.Ok(updated);
    }
    catch (ArgumentException ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
    catch (DbUpdateException ex)
    {
        var msg = ex.InnerException?.Message ?? ex.Message;
        return Results.BadRequest(new { error = "Database error: " + msg });
    }
    catch (Exception ex)
    {
        var msg = ex.InnerException?.Message ?? ex.Message;
        return Results.BadRequest(new { error = msg });
    }
});

app.MapDelete("/api/expenses/{id:int}", async (int id, IExpenseService service, CancellationToken ct) =>
{
    var deleted = await service.DeleteAsync(id, ct);
    return deleted ? Results.NoContent() : Results.NotFound();
});

// Products
app.MapGet("/api/products", async (IProductService service, CancellationToken ct) =>
{
    var list = await service.GetAllAsync(ct);
    return Results.Ok(list);
});

app.MapGet("/api/products/{id:int}", async (int id, IProductService service, CancellationToken ct) =>
{
    var product = await service.GetByIdAsync(id, ct);
    return product is null ? Results.NotFound() : Results.Ok(product);
});

app.MapPost("/api/products", async (CreateProductRequest request, IProductService service, CancellationToken ct) =>
{
    try
    {
        var created = await service.CreateAsync(request, ct);
        return Results.Created($"/api/products/{created.Id}", created);
    }
    catch (DbUpdateException ex)
    {
        var msg = ex.InnerException?.Message ?? ex.Message;
        return Results.BadRequest(new { error = "Database error: " + msg });
    }
    catch (Exception ex)
    {
        var msg = ex.InnerException?.Message ?? ex.Message;
        return Results.BadRequest(new { error = msg });
    }
});

app.MapPut("/api/products/{id:int}", async (int id, UpdateProductRequest request, IProductService service, CancellationToken ct) =>
{
    try
    {
        var updated = await service.UpdateAsync(id, request, ct);
        return updated is null ? Results.Json(new { error = "Product not found." }, statusCode: 404) : Results.Ok(updated);
    }
    catch (DbUpdateException ex)
    {
        var msg = ex.InnerException?.Message ?? ex.Message;
        return Results.BadRequest(new { error = "Database error: " + msg });
    }
    catch (Exception ex)
    {
        var msg = ex.InnerException?.Message ?? ex.Message;
        return Results.BadRequest(new { error = msg });
    }
});

app.MapDelete("/api/products/{id:int}", async (int id, IProductService service, CancellationToken ct) =>
{
    var deleted = await service.DeleteAsync(id, ct);
    return deleted ? Results.NoContent() : Results.NotFound();
});

// Permissions (for Roles & Permissions page)
app.MapGet("/api/permissions", () =>
{
    return Results.Ok(permissionStore);
});

// Roles (for Roles & Permissions page)
app.MapGet("/api/roles", () =>
{
    return Results.Ok(roleStore);
});

app.MapPost("/api/roles", (CreateRoleRequest request) =>
{
    if (string.IsNullOrWhiteSpace(request.Name))
    {
        return Results.BadRequest(new { error = "Role name is required." });
    }

    var idBase = request.Name.Trim().ToLowerInvariant().Replace(' ', '_');
    var id = idBase;
    var counter = 1;
    while (roleStore.Any(r => string.Equals(r.Id, id, StringComparison.OrdinalIgnoreCase)))
    {
        id = $"{idBase}_{counter++}";
    }

    var now = DateTime.UtcNow;
    var validPermissions = permissionStore.Select(p => p.Id).ToHashSet(StringComparer.OrdinalIgnoreCase);
    var requestedPermissions = request.Permissions
        .Where(p => validPermissions.Contains(p))
        .Distinct(StringComparer.OrdinalIgnoreCase)
        .ToArray();

    var role = new RoleDto(
        id,
        request.Name.Trim(),
        request.Description?.Trim() ?? string.Empty,
        requestedPermissions,
        IsSystem: false,
        UserCount: 0,
        CreatedAtUtc: now,
        UpdatedAtUtc: now
    );

    roleStore.Add(role);
    return Results.Created($"/api/roles/{role.Id}", role);
});

app.MapPut("/api/roles/{id}", (string id, UpdateRoleRequest request) =>
{
    var existingIndex = roleStore.FindIndex(r => string.Equals(r.Id, id, StringComparison.OrdinalIgnoreCase));
    if (existingIndex < 0)
    {
        return Results.Json(new { error = "Role not found." }, statusCode: 404);
    }

    var existing = roleStore[existingIndex];

    if (string.IsNullOrWhiteSpace(request.Name))
    {
        return Results.BadRequest(new { error = "Role name is required." });
    }

    var validPermissions = permissionStore.Select(p => p.Id).ToHashSet(StringComparer.OrdinalIgnoreCase);
    var requestedPermissions = request.Permissions
        .Where(p => validPermissions.Contains(p))
        .Distinct(StringComparer.OrdinalIgnoreCase)
        .ToArray();

    var updated = existing with
    {
        Name = request.Name.Trim(),
        Description = request.Description?.Trim() ?? string.Empty,
        Permissions = requestedPermissions,
        UpdatedAtUtc = DateTime.UtcNow,
    };

    roleStore[existingIndex] = updated;
    return Results.Ok(updated);
});

app.MapDelete("/api/roles/{id}", (string id) =>
{
    var existingIndex = roleStore.FindIndex(r => string.Equals(r.Id, id, StringComparison.OrdinalIgnoreCase));
    if (existingIndex < 0)
    {
        return Results.Json(new { error = "Role not found." }, statusCode: 404);
    }

    var existing = roleStore[existingIndex];
    if (existing.IsSystem || existing.UserCount > 0)
    {
        return Results.BadRequest(new { error = "System roles or roles with assigned users cannot be deleted." });
    }

    roleStore.RemoveAt(existingIndex);
    return Results.NoContent();
});

// Users (for Assigned To dropdowns)
// IMPORTANT: Must return real Identity user ids (AspNetUsers.Id) so Task.AssignedToUserId FK works.
app.MapGet("/api/users", async (UserManager<IdentityUser> userManager) =>
{
    var users = await userManager.Users
        .AsNoTracking()
        .Select(u => new
        {
            id = u.Id,
            email = u.Email ?? u.UserName ?? string.Empty,
        })
        .ToListAsync();

    // Enrich with friendly first/last names from the in-memory seed list when possible.
    var nameByEmail = userStore
        .Where(u => !string.IsNullOrWhiteSpace(u.Email))
        .ToDictionary(u => u.Email.Trim(), u => (u.FirstName, u.LastName), StringComparer.OrdinalIgnoreCase);

    var mapped = users.Select(u =>
    {
        var email = u.email?.Trim() ?? string.Empty;
        if (nameByEmail.TryGetValue(email, out var n))
        {
            return new { u.id, firstName = n.FirstName, lastName = n.LastName, email };
        }

        // Fallback: derive a readable name from the email/user string.
        var local = email.Contains('@') ? email.Split('@')[0] : email;
        local = string.IsNullOrWhiteSpace(local) ? "User" : local;
        var first = char.ToUpperInvariant(local[0]) + local.Substring(1);
        return new { u.id, firstName = first, lastName = string.Empty, email };
    });

    return Results.Ok(mapped);
});

// In-memory 2FA codes (used at login and in Settings)
var twoFactorCodes = new Dictionary<string, (string Code, DateTime ExpiresAtUtc)>(StringComparer.OrdinalIgnoreCase);
// Track one active JWT session id per user (single active login across devices).
var activeUserSessions = new ConcurrentDictionary<string, string>(StringComparer.Ordinal);

// Auth
app.MapPost("/api/auth/login", async (LoginRequest request, UserManager<IdentityUser> userManager, AmtsDbContext db) =>
{
    var email = request.Email?.Trim() ?? string.Empty;
    if (string.IsNullOrWhiteSpace(email))
    {
        return Results.Json(new { error = "Invalid email or password." }, statusCode: 401);
    }

    var user = await userManager.FindByEmailAsync(email);
    if (user is null || !await userManager.CheckPasswordAsync(user, request.Password))
    {
        return Results.Json(new { error = "Invalid email or password." }, statusCode: 401);
    }

    // Reload user from DB so we have latest TwoFactorEnabled from Identity (AspNetUsers)
    user = await userManager.FindByIdAsync(user.Id) ?? user;

    // Require 2FA if EITHER UserSecurity or Identity says it's enabled — never skip 2FA
    var userSecurity = await db.UserSecurity.AsNoTracking().FirstOrDefaultAsync(s => s.UserId == user.Id);
    bool fromTable = userSecurity?.TwoFactorEnabled == true;
    bool fromIdentity = user.TwoFactorEnabled;
    var twoFaEnabled = fromTable || fromIdentity;

    if (twoFaEnabled && userSecurity is null)
    {
        db.UserSecurity.Add(new AMTSolutions.Core.Entities.UserSecurity { UserId = user.Id, TwoFactorEnabled = true });
        await db.SaveChangesAsync();
    }

    Console.WriteLine($"[LOGIN] {email} UserId={user.Id} 2FA table={fromTable} Identity={fromIdentity} REQUIRE_2FA={twoFaEnabled}");

    // If 2FA is enabled, send code and return requiresTwoFactor (no token)
    if (twoFaEnabled)
    {
        var code = Random.Shared.Next(100000, 999999).ToString();
        var expires = DateTime.UtcNow.AddMinutes(10);
        twoFactorCodes[email] = (code, expires);

        var smtpUser = Environment.GetEnvironmentVariable("TWOFA_EMAIL_USERNAME");
        var smtpPass = Environment.GetEnvironmentVariable("TWOFA_EMAIL_PASSWORD");
        var toAddress = !string.IsNullOrWhiteSpace(userSecurity?.TwoFactorEmail)
            ? userSecurity.TwoFactorEmail!.Trim()
            : (user.Email ?? email);

        if (!string.IsNullOrWhiteSpace(smtpUser) && !string.IsNullOrWhiteSpace(smtpPass))
        {
            try
            {
                using var client = new SmtpClient("smtp.gmail.com", 587)
                {
                    EnableSsl = true,
                    Credentials = new NetworkCredential(smtpUser, smtpPass)
                };
                using var mail = new MailMessage(smtpUser, toAddress)
                {
                    Subject = "Your AMT Solutions login code",
                    Body = $"Your login verification code is {code}. It expires in 10 minutes."
                };
                await client.SendMailAsync(mail);
                Console.WriteLine($"[2FA LOGIN] Sent code to {toAddress}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[2FA LOGIN EMAIL ERROR] {ex.Message}");
            }
        }
        else
        {
            Console.WriteLine($"[DEV ONLY] Login 2FA code for {email}: {code}");
        }

        // Return only 2FA payload — no token; frontend must show code step
        var emailFor2Fa = user.Email ?? email ?? string.Empty;
        return Results.Json(new { requiresTwoFactor = true, email = emailFor2Fa }, statusCode: 200);
    }

    var roles = await userManager.GetRolesAsync(user);
    var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id),
        new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
    };

    foreach (var role in roles)
    {
        claims.Add(new Claim(ClaimTypes.Role, role));
    }

    var sessionId = Guid.NewGuid().ToString("N");
    activeUserSessions[user.Id] = sessionId;
    claims.Add(new Claim("sid", sessionId));

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSigningKeyString));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
        claims: claims,
        expires: DateTime.UtcNow.AddHours(8),
        signingCredentials: creds
    );

    var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

    return Results.Ok(new
    {
        token = tokenString,
        roles,
        email = user.Email,
        userId = user.Id,
    });
});

app.MapPost("/api/auth/change-password", async (ChangePasswordRequest request, UserManager<IdentityUser> userManager) =>
{
    var user = await userManager.FindByEmailAsync(request.Email);
    if (user is null)
    {
        return Results.Json(new { error = "User not found." }, statusCode: 404);
    }

    var check = await userManager.CheckPasswordAsync(user, request.CurrentPassword);
    if (!check)
    {
        return Results.Json(new { error = "Current password is incorrect." }, statusCode: 400);
    }

    var result = await userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
    if (!result.Succeeded)
    {
        var message = string.Join("; ", result.Errors.Select(e => e.Description));
        return Results.Json(new { error = message }, statusCode: 400);
    }

    return Results.Ok(new { message = "Password updated successfully." });
});

app.MapPost("/api/auth/2fa/send-code", async (SendTwoFactorCodeRequest request, UserManager<IdentityUser> userManager, AmtsDbContext db) =>
{
    var user = await userManager.FindByEmailAsync(request.Email);
    if (user is null)
    {
        return Results.Json(new { error = "User not found." }, statusCode: 404);
    }

    var toAddress = (request.TargetEmail ?? user.Email ?? request.Email)?.Trim() ?? "";

    // Save where to send 2FA codes for this user (so login sends to same email)
    var sec = await db.UserSecurity.FindAsync(user.Id);
    if (sec is null)
    {
        db.UserSecurity.Add(new AMTSolutions.Core.Entities.UserSecurity
        {
            UserId = user.Id,
            TwoFactorEnabled = false,
            TwoFactorEmail = string.IsNullOrWhiteSpace(toAddress) ? null : toAddress
        });
    }
    else
    {
        sec.TwoFactorEmail = string.IsNullOrWhiteSpace(toAddress) ? null : toAddress;
    }
    await db.SaveChangesAsync();

    var code = Random.Shared.Next(100000, 999999).ToString();
    var expires = DateTime.UtcNow.AddMinutes(10);
    twoFactorCodes[request.Email] = (code, expires);

    var smtpUser = Environment.GetEnvironmentVariable("TWOFA_EMAIL_USERNAME");
    var smtpPass = Environment.GetEnvironmentVariable("TWOFA_EMAIL_PASSWORD");

    var mailTo = !string.IsNullOrWhiteSpace(toAddress) ? toAddress : (user.Email ?? request.Email) ?? "";
    if (string.IsNullOrWhiteSpace(smtpUser) || string.IsNullOrWhiteSpace(smtpPass))
    {
        Console.WriteLine($"[DEV ONLY] 2FA code for {request.Email} -> {mailTo}: {code}");
        return Results.BadRequest(new
        {
            error = "Email provider is not configured. Please set TWOFA_EMAIL_USERNAME and TWOFA_EMAIL_PASSWORD environment variables for Gmail SMTP."
        });
    }

    try
    {
        using var client = new SmtpClient("smtp.gmail.com", 587)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(smtpUser, smtpPass)
        };

        using var mail = new MailMessage(smtpUser, mailTo)
        {
            Subject = "Your AMT Solutions verification code",
            Body = $"Your AMT Solutions verification code is {code}. It will expire in 10 minutes."
        };

        // Render free-tier can be slow during cold start; allow more time for SMTP send.
        await client.SendMailAsync(mail).WaitAsync(TimeSpan.FromSeconds(45));
        Console.WriteLine($"[2FA EMAIL] Sent code to {mailTo}");
    }
    catch (Exception ex)
    {
        var isTimeout =
            ex is TimeoutException
            || ex.InnerException is TimeoutException
            || ex.Message.Contains("timed out", StringComparison.OrdinalIgnoreCase)
            || ex.ToString().Contains("timed out", StringComparison.OrdinalIgnoreCase);

        Console.WriteLine($"[2FA EMAIL ERROR] {ex}");

        if (isTimeout)
        {
            return Results.BadRequest(new
            {
                error = "Timed out while sending verification email. This can take 1-2 minutes on free tiers. Please try again."
            });
        }

        return Results.BadRequest(new { error = "Failed to send email verification code." });
    }

    return Results.Ok(new { message = "Verification code sent via email." });
});

app.MapPost("/api/auth/2fa/verify-code", async (VerifyTwoFactorCodeRequest request, UserManager<IdentityUser> userManager, AmtsDbContext db) =>
{
    var email = request.Email?.Trim() ?? string.Empty;
    if (string.IsNullOrEmpty(email))
    {
        return Results.Json(new { error = "Email is required." }, statusCode: 400);
    }

    if (!twoFactorCodes.TryGetValue(email, out var entry))
    {
        return Results.Json(new { error = "No verification code found. Please request a new code." }, statusCode: 400);
    }

    if (DateTime.UtcNow > entry.ExpiresAtUtc)
    {
        twoFactorCodes.Remove(email);
        return Results.Json(new { error = "Verification code has expired. Please request a new code." }, statusCode: 400);
    }

    if (!string.Equals(entry.Code, request.Code, StringComparison.Ordinal))
    {
        return Results.Json(new { error = "Invalid verification code." }, statusCode: 400);
    }

    var user = await userManager.FindByEmailAsync(email);
    if (user is null)
    {
        return Results.Json(new { error = "User not found." }, statusCode: 404);
    }

    user.TwoFactorEnabled = true;
    var updateResult = await userManager.UpdateAsync(user);
    if (!updateResult.Succeeded)
    {
        Console.WriteLine($"[2FA VERIFY] Identity UpdateAsync failed: {string.Join(", ", updateResult.Errors.Select(e => e.Description))}");
        return Results.Json(new { error = "Failed to enable 2FA. Please try again." }, statusCode: 500);
    }

    // Persist 2FA in UserSecurity so login always requires code (UserId must match login lookup)
    var sec = await db.UserSecurity.FindAsync(user.Id);
    if (sec is null)
    {
        db.UserSecurity.Add(new AMTSolutions.Core.Entities.UserSecurity { UserId = user.Id, TwoFactorEnabled = true });
        Console.WriteLine($"[2FA VERIFY] Created UserSecurity row UserId={user.Id} (email={email})");
    }
    else
    {
        sec.TwoFactorEnabled = true;
        Console.WriteLine($"[2FA VERIFY] Updated UserSecurity row UserId={user.Id} (email={email})");
    }
    await db.SaveChangesAsync();

    twoFactorCodes.Remove(email);

    return Results.Ok(new { twoFactorEnabled = true });
});

app.MapPost("/api/auth/2fa/disable", async (DisableTwoFactorRequest request, UserManager<IdentityUser> userManager, AmtsDbContext db) =>
{
    var user = await userManager.FindByEmailAsync(request.Email);
    if (user is null)
    {
        return Results.Json(new { error = "User not found." }, statusCode: 404);
    }

    user.TwoFactorEnabled = false;
    await userManager.UpdateAsync(user);

    var sec = await db.UserSecurity.FindAsync(user.Id);
    if (sec is null)
    {
        db.UserSecurity.Add(new AMTSolutions.Core.Entities.UserSecurity { UserId = user.Id, TwoFactorEnabled = false });
    }
    else
    {
        sec.TwoFactorEnabled = false;
    }
    await db.SaveChangesAsync();

    twoFactorCodes.Remove(request.Email);

    return Results.Ok(new { twoFactorEnabled = false });
});

// Complete login after 2FA code verification (no auth required)
app.MapPost("/api/auth/2fa/complete-login", async (CompleteLoginRequest request, UserManager<IdentityUser> userManager) =>
{
    if (!twoFactorCodes.TryGetValue(request.Email, out var entry))
    {
        return Results.Json(new { error = "No verification code found. Request a new code from the sign-in page." }, statusCode: 400);
    }

    if (DateTime.UtcNow > entry.ExpiresAtUtc)
    {
        twoFactorCodes.Remove(request.Email);
        return Results.Json(new { error = "Verification code has expired. Please sign in again to get a new code." }, statusCode: 400);
    }

    if (!string.Equals(entry.Code, request.Code, StringComparison.Ordinal))
    {
        return Results.Json(new { error = "Invalid verification code." }, statusCode: 400);
    }

    var user = await userManager.FindByEmailAsync(request.Email);
    if (user is null)
    {
        return Results.Json(new { error = "User not found." }, statusCode: 404);
    }

    twoFactorCodes.Remove(request.Email);

    var roles = await userManager.GetRolesAsync(user);
    var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id),
        new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
    };
    foreach (var role in roles)
        claims.Add(new Claim(ClaimTypes.Role, role));

    var sessionId = Guid.NewGuid().ToString("N");
    activeUserSessions[user.Id] = sessionId;
    claims.Add(new Claim("sid", sessionId));

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSigningKeyString));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    var token = new JwtSecurityToken(
        claims: claims,
        expires: DateTime.UtcNow.AddHours(8),
        signingCredentials: creds
    );
    var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

    return Results.Ok(new
    {
        token = tokenString,
        roles,
        email = user.Email,
        userId = user.Id,
    });
});

// Validate whether the current JWT still represents the active session for this user.
app.MapGet("/api/auth/session-status", (ClaimsPrincipal principal) =>
{
    var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
    var tokenSessionId = principal.FindFirstValue("sid");
    if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(tokenSessionId))
    {
        return Results.Unauthorized();
    }

    if (!activeUserSessions.TryGetValue(userId, out var activeSessionId))
    {
        // If API restarted and in-memory map is empty, treat current token as active.
        activeUserSessions[userId] = tokenSessionId;
        return Results.Ok(new { active = true });
    }

    if (!string.Equals(activeSessionId, tokenSessionId, StringComparison.Ordinal))
    {
        return Results.Json(new { active = false, error = "Session is no longer active for this device." }, statusCode: 401);
    }

    return Results.Ok(new { active = true });
}).RequireAuthorization();

// Website settings (for Website Management page)
app.MapGet("/api/website-settings", () =>
{
    return Results.Ok(websiteSettingsStore);
});

app.MapPut("/api/website-settings", (WebsiteSettingsDto request) =>
{
    // Basic validation
    if (string.IsNullOrWhiteSpace(request.HeroTitle))
    {
        return Results.BadRequest(new { error = "Hero title is required." });
    }

    websiteSettingsStore = request with { };
    return Results.Ok(websiteSettingsStore);
});

// Website services (for Website Management page - Services tab)
app.MapGet("/api/website-services", () =>
{
    return Results.Ok(websiteServicesStore.OrderBy(s => s.Order).ToList());
});

// Debug endpoint to see the raw body last sent to /api/website-services
app.MapGet("/api/website-services-debug-raw", () =>
{
    return Results.Ok(new { raw = lastWebsiteServicesRawBody });
});

app.MapPut("/api/website-services", async (HttpContext context) =>
{
    // Manually read and deserialize the request body to avoid any model binding quirks
    List<WebsiteServiceDto>? list;
    using (var reader = new StreamReader(context.Request.Body))
    {
        var body = await reader.ReadToEndAsync();
        lastWebsiteServicesRawBody = body;
        if (string.IsNullOrWhiteSpace(body))
        {
            list = new List<WebsiteServiceDto>();
        }
        else
        {
            try
            {
                list = System.Text.Json.JsonSerializer.Deserialize<List<WebsiteServiceDto>>(body,
                    new System.Text.Json.JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    }) ?? new List<WebsiteServiceDto>();
            }
            catch
            {
                return Results.BadRequest(new { error = "Invalid website services payload." });
            }
        }
    }
    if (list.Any(s => string.IsNullOrWhiteSpace(s.Title)))
    {
        return Results.BadRequest(new { error = "Each service must have a title." });
    }

    // Normalize ordering
    var ordered = list
        .OrderBy(s => s.Order <= 0 ? int.MaxValue : s.Order)
        .Select((s, index) => s with { Order = index + 1 })
        .ToList();

    websiteServicesStore = ordered;
    return Results.Ok(websiteServicesStore);
});

// Website testimonials (for Website Management page - Testimonials tab)
app.MapGet("/api/website-testimonials", () =>
{
    return Results.Ok(websiteTestimonialsStore
        .OrderBy(t => t.Order)
        .ThenBy(t => t.Name)
        .ToList());
});

app.MapPut("/api/website-testimonials", async (HttpContext context) =>
{
    List<WebsiteTestimonialDto>? list;
    using (var reader = new StreamReader(context.Request.Body))
    {
        var body = await reader.ReadToEndAsync();
        lastWebsiteTestimonialsRawBody = body;
        if (string.IsNullOrWhiteSpace(body))
        {
            list = new List<WebsiteTestimonialDto>();
        }
        else
        {
            try
            {
                list = System.Text.Json.JsonSerializer.Deserialize<List<WebsiteTestimonialDto>>(body,
                    new System.Text.Json.JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    }) ?? new List<WebsiteTestimonialDto>();
            }
            catch
            {
                return Results.BadRequest(new { error = "Invalid website testimonials payload." });
            }
        }
    }

    if (list.Any(t => string.IsNullOrWhiteSpace(t.Name) || string.IsNullOrWhiteSpace(t.Content)))
    {
        return Results.BadRequest(new { error = "Each testimonial must have a name and content." });
    }

    // Clamp rating between 1 and 5 and normalize ordering
    var ordered = list
        .Select(t => t with
        {
            Rating = t.Rating < 1 ? 1 : (t.Rating > 5 ? 5 : t.Rating)
        })
        .OrderBy(t => t.Order <= 0 ? int.MaxValue : t.Order)
        .ThenBy(t => t.Name)
        .Select((t, index) => t with { Order = index + 1 })
        .ToList();

    websiteTestimonialsStore = ordered;
    return Results.Ok(websiteTestimonialsStore);
});

// Debug endpoint to see the raw body last sent to /api/website-testimonials
app.MapGet("/api/website-testimonials-debug-raw", () =>
{
    return Results.Ok(new { raw = lastWebsiteTestimonialsRawBody });
});

// Company settings (for Settings page - Company tab)
app.MapGet("/api/settings/company", async (AmtsDbContext db, CancellationToken ct) =>
{
    var settings = await db.CompanySettings.FirstOrDefaultAsync(ct);
    if (settings is null)
    {
        return Results.Ok(new CompanySettingsDto(
            CompanyName: "AMT Solutions",
            Email: "hello@amtsolutions.com",
            Phone: "+20 100 123 4567",
            Website: "www.amtsolutions.com",
            Address: "123 Nile Corniche, Suite 500",
            City: "Cairo",
            Country: "Egypt",
            TaxId: "123456789",
            LogoUrl: "/images/amt-logo.png"
        ));
    }

    return Results.Ok(new CompanySettingsDto(
        CompanyName: settings.CompanyName,
        Email: settings.Email,
        Phone: settings.Phone,
        Website: settings.Website,
        Address: settings.Address,
        City: settings.City,
        Country: settings.Country,
        TaxId: settings.TaxId,
        LogoUrl: settings.LogoUrl
    ));
});

app.MapPut("/api/settings/company", async (CompanySettingsDto request, AmtsDbContext db, CancellationToken ct) =>
{
    if (string.IsNullOrWhiteSpace(request.CompanyName))
    {
        return Results.BadRequest(new { error = "Company name is required." });
    }

    var settings = await db.CompanySettings.FirstOrDefaultAsync(ct);
    if (settings is null)
    {
        settings = new AMTSolutions.Core.Entities.CompanySettings
        {
            CompanyName = request.CompanyName,
            Email = request.Email,
            Phone = request.Phone,
            Website = request.Website,
            Address = request.Address,
            City = request.City,
            Country = request.Country,
            TaxId = request.TaxId,
            LogoUrl = request.LogoUrl,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = null
        };
        db.CompanySettings.Add(settings);
    }
    else
    {
        settings.CompanyName = request.CompanyName;
        settings.Email = request.Email;
        settings.Phone = request.Phone;
        settings.Website = request.Website;
        settings.Address = request.Address;
        settings.City = request.City;
        settings.Country = request.Country;
        settings.TaxId = request.TaxId;
        settings.LogoUrl = request.LogoUrl;
        settings.UpdatedAtUtc = DateTime.UtcNow;
    }

    await db.SaveChangesAsync(ct);

    return Results.Ok(request);
});

// Profile settings (for Settings page - Profile tab) — per logged-in user
app.MapGet("/api/settings/profile", (ClaimsPrincipal user) =>
{
    var email = user.FindFirstValue(ClaimTypes.Email);
    if (string.IsNullOrEmpty(email))
        return Results.Json(new { error = "Unauthorized." }, statusCode: 401);

    if (!profileStore.TryGetValue(email, out var profile))
        profile = new ProfileSettingsDto("", "", email, "");

    return Results.Ok(profile);
}).RequireAuthorization();

app.MapPut("/api/settings/profile", (ProfileSettingsDto request, ClaimsPrincipal user) =>
{
    var email = user.FindFirstValue(ClaimTypes.Email);
    if (string.IsNullOrEmpty(email))
        return Results.Json(new { error = "Unauthorized." }, statusCode: 401);

    if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName))
        return Results.BadRequest(new { error = "First name and last name are required." });

    profileStore[email] = request with { Email = request.Email ?? email };
    return Results.Ok(profileStore[email]);
}).RequireAuthorization();

// Notification settings (for Settings page - Notifications tab)
app.MapGet("/api/settings/notifications", () =>
{
    return Results.Ok(notificationSettingsStore);
});

app.MapPut("/api/settings/notifications", (NotificationSettingsDto request) =>
{
    notificationSettingsStore = request with { };
    return Results.Ok(notificationSettingsStore);
});

// Security settings (for Settings page - Security tab) — TwoFactorEnabled from UserSecurity, fallback to Identity and sync
app.MapGet("/api/settings/security", async (ClaimsPrincipal user, AmtsDbContext db, UserManager<IdentityUser> userManager) =>
{
    var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(userId))
        return Results.Json(new { error = "Unauthorized." }, statusCode: 401);

    var sec = await db.UserSecurity.FindAsync(userId);
    bool twoFaEnabled;
    if (sec != null)
    {
        twoFaEnabled = sec.TwoFactorEnabled;
        Console.WriteLine($"[GET SECURITY] UserId={userId} from UserSecurity TwoFactorEnabled={twoFaEnabled}");
    }
    else
    {
        var identityUser = await userManager.FindByIdAsync(userId);
        twoFaEnabled = identityUser?.TwoFactorEnabled ?? false;
        db.UserSecurity.Add(new AMTSolutions.Core.Entities.UserSecurity { UserId = userId, TwoFactorEnabled = twoFaEnabled });
        await db.SaveChangesAsync();
        Console.WriteLine($"[GET SECURITY] Created UserSecurity row UserId={userId} TwoFactorEnabled={twoFaEnabled}");
    }
    return Results.Ok(new SecuritySettingsDto(twoFaEnabled));
}).RequireAuthorization();

app.MapPut("/api/settings/security", (SecuritySettingsDto request) =>
{
    securitySettingsStore = request with { };
    return Results.Ok(securitySettingsStore);
});

app.Run();

// DTOs and request contracts for Roles & Permissions API
public sealed record PermissionDto(string Id, string Name, string Description, string Module, string Action);

public sealed record RoleDto(
    string Id,
    string Name,
    string Description,
    string[] Permissions,
    bool IsSystem,
    int UserCount,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc
);

public sealed record CreateRoleRequest(string Name, string? Description, string[] Permissions);

public sealed record UpdateRoleRequest(string Name, string? Description, string[] Permissions);

public sealed record UserAccountDto(
    string Id,
    string FirstName,
    string LastName,
    string Email,
    string RoleId,
    bool IsActive
);

public sealed record WebsiteSettingsDto(
    string HeroTitle,
    string HeroSubtitle,
    string HeroCtaText,
    string StatsProjectsDelivered,
    string StatsHappyClients,
    string StatsIndustryAwards,
    string StatsClientSatisfaction,
    string MetaTitle,
    string MetaDescription,
    string MetaKeywords
);

public sealed record WebsiteServiceDto(
    string Id,
    string Slug,
    string Title,
    string ShortDescription,
    string FullDescription,
    string Icon,
    int Order,
    bool IsActive
);

public sealed record WebsiteTestimonialDto(
    string Id,
    string Name,
    string Position,
    string Company,
    string Content,
    int Rating,
    int Order,
    bool IsActive
);

public sealed record ContactMessageDto(
    string Id,
    string Name,
    string Email,
    string? Phone,
    string? Company,
    string Message,
    string Status,
    DateTime CreatedAtUtc
);

public sealed record CreateContactMessageRequest(
    string Name,
    string Email,
    string? Phone,
    string? Company,
    string Message
);

public sealed record CompanySettingsDto(
    string CompanyName,
    string Email,
    string Phone,
    string Website,
    string Address,
    string City,
    string Country,
    string TaxId,
    string LogoUrl
);

public sealed record ProfileSettingsDto(
    string FirstName,
    string LastName,
    string Email,
    string Phone
);

public sealed record NotificationSettingsDto(
    bool NewLeadAssigned,
    bool TaskDueSoon,
    bool InvoicePaid,
    bool ProjectUpdates
);

public sealed record SecuritySettingsDto(
    bool TwoFactorEnabled
);

public sealed record LoginRequest(string Email, string Password);

public sealed record ChangePasswordRequest(string Email, string CurrentPassword, string NewPassword);

public sealed record SendTwoFactorCodeRequest(string Email, string? TargetEmail);

public sealed record VerifyTwoFactorCodeRequest(string Email, string Code);

public sealed record DisableTwoFactorRequest(string Email);

public sealed record CompleteLoginRequest(string Email, string Code);

public sealed record LoginTwoFactorRequiredResponse(bool RequiresTwoFactor, string Email);
