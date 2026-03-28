-- Run this on AMTSolutionsPlatformDb if you don't use EF migrations.
-- Creates Invoices and InvoiceLineItems tables for the invoice feature.

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Invoices')
BEGIN
  CREATE TABLE dbo.Invoices (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId INT NOT NULL,
    ProjectId INT NULL,
    InvoiceNumber NVARCHAR(50) NOT NULL,
    Status INT NOT NULL DEFAULT 0,
    IssueDateUtc DATETIME2 NOT NULL,
    DueDateUtc DATETIME2 NOT NULL,
    Subtotal DECIMAL(18,2) NOT NULL,
    TaxRate DECIMAL(18,2) NOT NULL,
    TaxAmount DECIMAL(18,2) NOT NULL,
    Total DECIMAL(18,2) NOT NULL,
    AmountPaid DECIMAL(18,2) NOT NULL DEFAULT 0,
    BalanceDue DECIMAL(18,2) NOT NULL,
    Notes NVARCHAR(MAX) NULL,
    CreatedAtUtc DATETIME2 NOT NULL,
    UpdatedAtUtc DATETIME2 NULL,
    CONSTRAINT FK_Invoices_Customers FOREIGN KEY (CustomerId) REFERENCES dbo.Customers(Id),
    CONSTRAINT FK_Invoices_Projects FOREIGN KEY (ProjectId) REFERENCES dbo.Projects(Id)
  );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'InvoiceLineItems')
BEGIN
  CREATE TABLE dbo.InvoiceLineItems (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    InvoiceId INT NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    Total DECIMAL(18,2) NOT NULL,
    CONSTRAINT FK_InvoiceLineItems_Invoices FOREIGN KEY (InvoiceId) REFERENCES dbo.Invoices(Id) ON DELETE CASCADE
  );
END
