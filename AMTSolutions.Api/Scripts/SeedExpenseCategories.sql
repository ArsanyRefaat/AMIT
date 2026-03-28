-- Seed expense categories for AMTSolutionsPlatformDb
-- Run this script against your database (e.g. in SSMS) to populate dbo.ExpenseCategories.
-- Safe to run multiple times: only inserts categories that don't already exist.
-- Table has: Id, Name, CreatedAtUtc, UpdatedAtUtc

USE AMTSolutionsPlatformDb;
GO

DECLARE @Now datetime2(7) = GETUTCDATE();

IF NOT EXISTS (SELECT 1 FROM dbo.ExpenseCategories WHERE Name = N'Advertising')
  INSERT INTO dbo.ExpenseCategories (Name, CreatedAtUtc, UpdatedAtUtc) VALUES (N'Advertising', @Now, @Now);

IF NOT EXISTS (SELECT 1 FROM dbo.ExpenseCategories WHERE Name = N'Software & Tools')
  INSERT INTO dbo.ExpenseCategories (Name, CreatedAtUtc, UpdatedAtUtc) VALUES (N'Software & Tools', @Now, @Now);

IF NOT EXISTS (SELECT 1 FROM dbo.ExpenseCategories WHERE Name = N'Office')
  INSERT INTO dbo.ExpenseCategories (Name, CreatedAtUtc, UpdatedAtUtc) VALUES (N'Office', @Now, @Now);

IF NOT EXISTS (SELECT 1 FROM dbo.ExpenseCategories WHERE Name = N'Travel')
  INSERT INTO dbo.ExpenseCategories (Name, CreatedAtUtc, UpdatedAtUtc) VALUES (N'Travel', @Now, @Now);

IF NOT EXISTS (SELECT 1 FROM dbo.ExpenseCategories WHERE Name = N'Meals')
  INSERT INTO dbo.ExpenseCategories (Name, CreatedAtUtc, UpdatedAtUtc) VALUES (N'Meals', @Now, @Now);

IF NOT EXISTS (SELECT 1 FROM dbo.ExpenseCategories WHERE Name = N'Equipment')
  INSERT INTO dbo.ExpenseCategories (Name, CreatedAtUtc, UpdatedAtUtc) VALUES (N'Equipment', @Now, @Now);

IF NOT EXISTS (SELECT 1 FROM dbo.ExpenseCategories WHERE Name = N'Professional Services')
  INSERT INTO dbo.ExpenseCategories (Name, CreatedAtUtc, UpdatedAtUtc) VALUES (N'Professional Services', @Now, @Now);

IF NOT EXISTS (SELECT 1 FROM dbo.ExpenseCategories WHERE Name = N'Utilities')
  INSERT INTO dbo.ExpenseCategories (Name, CreatedAtUtc, UpdatedAtUtc) VALUES (N'Utilities', @Now, @Now);

IF NOT EXISTS (SELECT 1 FROM dbo.ExpenseCategories WHERE Name = N'Other')
  INSERT INTO dbo.ExpenseCategories (Name, CreatedAtUtc, UpdatedAtUtc) VALUES (N'Other', @Now, @Now);

GO
