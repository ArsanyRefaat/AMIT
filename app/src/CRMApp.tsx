import { useState } from 'react';
import { CRMLayout } from '@/crm/components/CRMLayout';
import { Dashboard } from '@/crm/pages/Dashboard';
import { Leads } from '@/crm/pages/Leads';
import { Customers } from '@/crm/pages/Customers';
import { Products } from '@/crm/pages/Products';
import { Projects } from '@/crm/pages/Projects';
import { Tasks } from '@/crm/pages/Tasks';
import { Invoices } from '@/crm/pages/Invoices';
import { Expenses } from '@/crm/pages/Expenses';
import { Reports } from '@/crm/pages/Reports';
import { Website } from '@/crm/pages/Website';
import { Settings } from '@/crm/pages/Settings';
import { RolesPage } from '@/crm/pages/Roles';
import { Toaster } from '@/components/ui/sonner';

type AppView = 'entry' | 'website' | 'crm';
type CRMPage = 'dashboard' | 'leads' | 'customers' | 'products' | 'projects' | 'tasks' | 'invoices' | 'expenses' | 'reports' | 'roles' | 'website' | 'settings';

interface CRMAppProps {
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
}

function CRMApp({ onNavigate, onLogout }: CRMAppProps) {
  const [currentPage, setCurrentPage] = useState<CRMPage>('dashboard');

  const handleNavigate = (page: CRMPage) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'leads':
        return <Leads />;
      case 'customers':
        return <Customers />;
      case 'products':
        return <Products />;
      case 'projects':
        return <Projects />;
      case 'tasks':
        return <Tasks />;
      case 'invoices':
        return <Invoices />;
      case 'expenses':
        return <Expenses />;
      case 'reports':
        return <Reports />;
      case 'roles':
        return <RolesPage />;
      case 'website':
        return <Website />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <CRMLayout
      currentPage={currentPage}
      onNavigate={handleNavigate}
      onBackToEntry={() => onNavigate('website')}
      onLogout={onLogout}
    >
      {renderPage()}
      <Toaster position="bottom-right" />
    </CRMLayout>
  );
}

export default CRMApp;
