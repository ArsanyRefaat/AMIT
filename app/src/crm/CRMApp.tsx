import { useState } from 'react';
import { CRMLayout, type CRMPage } from './components/CRMLayout';
import { Dashboard } from './pages/Dashboard';
import { Leads } from './pages/Leads';
import { Customers } from './pages/Customers';
import { Products } from './pages/Products';
import { Projects } from './pages/Projects';
import { Tasks } from './pages/Tasks';
import { Invoices } from './pages/Invoices';
import { Expenses } from './pages/Expenses';
import { Reports } from './pages/Reports';
import { RolesPage } from './pages/Roles';
import { Website } from './pages/Website';
import { Settings } from './pages/Settings';
import { Toaster } from '@/components/ui/sonner';

type AppView = 'entry' | 'website' | 'crm';

interface CRMAppProps {
  onNavigate: (view: AppView) => void;
}

export function CRMApp({ onNavigate }: CRMAppProps) {
  const [currentPage, setCurrentPage] = useState<CRMPage>('dashboard');
  const [createInvoiceForCustomerId, setCreateInvoiceForCustomerId] = useState<string | null>(null);

  return (
    <CRMLayout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onBackToEntry={() => onNavigate('entry')}
    >
      {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} />}
      {currentPage === 'leads' && <Leads />}
      {currentPage === 'customers' && (
        <Customers
          onNavigateToCreateInvoice={(customerId) => {
            setCurrentPage('invoices');
            setCreateInvoiceForCustomerId(customerId);
          }}
        />
      )}
      {currentPage === 'products' && <Products />}
      {currentPage === 'projects' && <Projects />}
      {currentPage === 'tasks' && <Tasks />}
      {currentPage === 'invoices' && (
        <Invoices
          createForCustomerId={createInvoiceForCustomerId}
          onClearCreateForCustomer={() => setCreateInvoiceForCustomerId(null)}
        />
      )}
      {currentPage === 'expenses' && <Expenses />}
      {currentPage === 'reports' && <Reports />}
      {currentPage === 'roles' && <RolesPage />}
      {currentPage === 'website' && <Website />}
      {currentPage === 'settings' && <Settings />}
      <Toaster position="bottom-right" />
    </CRMLayout>
  );
}
