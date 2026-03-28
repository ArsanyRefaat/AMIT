using AMTSolutions.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace AMTSolutions.Infrastructure.Data;

public class AmtsDbContext : IdentityDbContext<IdentityUser>
{
    public AmtsDbContext(DbContextOptions<AmtsDbContext> options) : base(options)
    {
    }

    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceLineItem> InvoiceLineItems => Set<InvoiceLineItem>();
    public DbSet<ExpenseCategory> ExpenseCategories => Set<ExpenseCategory>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<CompanySettings> CompanySettings => Set<CompanySettings>();
    public DbSet<UserSecurity> UserSecurity => Set<UserSecurity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Lead>(entity =>
        {
            entity.ToTable("Leads");

            entity.Property(x => x.Name)
                .HasColumnName("FullName")
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(x => x.Email).IsRequired().HasMaxLength(255);
            entity.Property(x => x.Company).HasMaxLength(255);
            entity.Property(x => x.Source).HasMaxLength(100);
            entity.Property(x => x.EstimatedValue).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<TaskItem>(entity =>
        {
            entity.ToTable("Tasks");
            entity.Property(x => x.Title).IsRequired();
            entity.Property(x => x.Status).HasConversion<int>();
            entity.Property(x => x.DueDateUtc);
            entity.Property(x => x.AssignedToUserId).HasMaxLength(450);
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.ToTable("Customers");
            entity.Property(x => x.Name).IsRequired();
            entity.Property(x => x.Email).IsRequired();
        });

        modelBuilder.Entity<Project>(entity =>
        {
            entity.ToTable("Projects");
            entity.Property(x => x.Name).IsRequired();
            entity.Property(x => x.Budget).HasColumnType("decimal(18,2)");
            entity.Property(x => x.EstimatedCost).HasColumnType("decimal(18,2)");
            entity.Property(x => x.ProgressPercent).HasColumnType("decimal(18,2)");
            entity.Property(x => x.StartDateUtc);
            entity.Property(x => x.EndDateUtc);
        });

        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.ToTable("Invoices");
            entity.Property(x => x.InvoiceNumber).IsRequired().HasMaxLength(50);
            entity.Property(x => x.Status).HasConversion<int>();
            entity.Property(x => x.Subtotal).HasColumnType("decimal(18,2)");
            entity.Property(x => x.TaxAmount).HasColumnName("Tax").HasColumnType("decimal(18,2)");
            entity.Property(x => x.Total).HasColumnType("decimal(18,2)");
            entity.Property(x => x.Currency).IsRequired().HasMaxLength(10).HasDefaultValue("EGP");
            entity.Ignore(x => x.TaxRate);
            entity.Ignore(x => x.AmountPaid);
            entity.Ignore(x => x.BalanceDue);
            entity.HasMany(x => x.LineItems).WithOne().HasForeignKey(x => x.InvoiceId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<InvoiceLineItem>(entity =>
        {
            entity.ToTable("InvoiceItems");
            entity.Property(x => x.Description).IsRequired();
            entity.Property(x => x.UnitPrice).HasColumnType("decimal(18,2)");
            entity.Property(x => x.Total).HasColumnName("LineTotal").HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<ExpenseCategory>(entity =>
        {
            entity.ToTable("ExpenseCategories");
            entity.Property(x => x.Name).IsRequired();
        });

        modelBuilder.Entity<Expense>(entity =>
        {
            entity.ToTable("Expenses");
            entity.Property(x => x.Amount).HasColumnType("decimal(18,2)");
            entity.Property(x => x.Currency).IsRequired();
            entity.Property(x => x.ExpenseDateUtc);
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.ToTable("Products");
            entity.Property(x => x.Name).IsRequired();
            entity.Property(x => x.Category).IsRequired();
            entity.Property(x => x.Price).HasColumnType("decimal(18,2)");
            entity.Property(x => x.Unit).IsRequired().HasMaxLength(50);
        });

        modelBuilder.Entity<CompanySettings>(entity =>
        {
            entity.ToTable("CompanySettings");
            entity.Property(x => x.CompanyName).IsRequired().HasMaxLength(200);
            entity.Property(x => x.Email).IsRequired().HasMaxLength(255);
            entity.Property(x => x.Phone).HasMaxLength(50);
            entity.Property(x => x.Website).HasMaxLength(255);
            entity.Property(x => x.Address).HasMaxLength(500);
            entity.Property(x => x.City).HasMaxLength(100);
            entity.Property(x => x.Country).HasMaxLength(100);
            entity.Property(x => x.TaxId).HasMaxLength(100);
            entity.Property(x => x.LogoUrl).HasMaxLength(2000);
        });

        modelBuilder.Entity<UserSecurity>(entity =>
        {
            entity.ToTable("UserSecurity");
            entity.HasKey(e => e.UserId);
            entity.Property(x => x.UserId).HasMaxLength(450);
            entity.Property(x => x.TwoFactorEmail).HasMaxLength(255);
        });
    }
}

