-- Add missing columns to existing Invoices table (run on AMTSolutionsPlatformDb).
-- Use the same names as EF mapping: Amount_Paid, Balance_Due, Tax_Amount, Tax_Rate.

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Invoices') AND name = 'Amount_Paid')
  ALTER TABLE dbo.Invoices ADD Amount_Paid DECIMAL(18,2) NOT NULL DEFAULT 0;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Invoices') AND name = 'Balance_Due')
  ALTER TABLE dbo.Invoices ADD Balance_Due DECIMAL(18,2) NOT NULL DEFAULT 0;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Invoices') AND name = 'Tax_Amount')
  ALTER TABLE dbo.Invoices ADD Tax_Amount DECIMAL(18,2) NOT NULL DEFAULT 0;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Invoices') AND name = 'Tax_Rate')
  ALTER TABLE dbo.Invoices ADD Tax_Rate DECIMAL(18,2) NOT NULL DEFAULT 14;
