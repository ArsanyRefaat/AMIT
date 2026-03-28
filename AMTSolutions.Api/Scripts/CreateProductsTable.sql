-- Create Products table for AMTSolutionsPlatformDb (if it doesn't exist)
USE AMTSolutionsPlatformDb;
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Products')
BEGIN
  CREATE TABLE dbo.Products (
    Id int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Name nvarchar(200) NOT NULL,
    Description nvarchar(max) NULL,
    Category nvarchar(100) NOT NULL,
    Price decimal(18,2) NOT NULL,
    Unit nvarchar(50) NOT NULL,
    IsActive bit NOT NULL DEFAULT 1,
    CreatedAtUtc datetime2(7) NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAtUtc datetime2(7) NULL
  );
END
GO

-- Seed the 5 services from the UI (only if table is empty)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Products')
AND NOT EXISTS (SELECT 1 FROM dbo.Products)
BEGIN
  SET IDENTITY_INSERT dbo.Products ON;
  INSERT INTO dbo.Products (Id, Name, Description, Category, Price, Unit, IsActive, CreatedAtUtc, UpdatedAtUtc) VALUES
    (1, N'Brand Strategy Package', N'Comprehensive brand strategy including positioning, messaging, and visual identity direction.', N'Branding', 75000, N'project', 1, GETUTCDATE(), GETUTCDATE()),
    (2, N'Social Media Management', N'Full-service social media management including content creation, posting, and community management.', N'Social Media', 15000, N'month', 1, GETUTCDATE(), GETUTCDATE()),
    (3, N'Performance Marketing', N'Data-driven advertising campaigns across Google, Meta, and LinkedIn.', N'Advertising', 25000, N'month', 1, GETUTCDATE(), GETUTCDATE()),
    (4, N'Website Design & Development', N'Custom website design and development with responsive design and CMS integration.', N'Web', 120000, N'project', 1, GETUTCDATE(), GETUTCDATE()),
    (5, N'SEO Services', N'Search engine optimization including technical SEO, content optimization, and link building.', N'SEO', 20000, N'month', 1, GETUTCDATE(), GETUTCDATE());
  SET IDENTITY_INSERT dbo.Products OFF;
END
GO
