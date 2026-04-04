import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Briefcase,
  FolderKanban,
  CheckSquare,
  FileText,
  Receipt,
  BarChart3,
  Globe,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Menu,
  X,
  ArrowLeft,
  Shield,
  LogOut,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { API_BASE } from '@/lib/api';
import { toast } from 'sonner';

const WEBSITE_BELL_DISMISSED_KEY = 'crmWebsiteContactDismissedIds';

function loadDismissedBellIds(): Set<string> {
  try {
    const raw = localStorage.getItem(WEBSITE_BELL_DISMISSED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? new Set(arr.map(String)) : new Set();
  } catch {
    return new Set();
  }
}

export type CRMPage = 'dashboard' | 'leads' | 'customers' | 'products' | 'projects' | 'tasks' | 'invoices' | 'expenses' | 'reports' | 'roles' | 'website' | 'settings';

interface CRMLayoutProps {
  children: React.ReactNode;
  currentPage: CRMPage;
  onNavigate: (page: CRMPage) => void;
  onBackToEntry: () => void;
  onLogout: () => void;
}

const NAV_ITEMS_BASE: { id: CRMPage; label: string; icon: typeof LayoutDashboard; showBadge?: 'leads' | 'tasks' }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'leads', label: 'Leads', icon: Users, showBadge: 'leads' },
  { id: 'customers', label: 'Customers', icon: UserCircle },
  { id: 'products', label: 'Products', icon: Briefcase },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, showBadge: 'tasks' },
  { id: 'invoices', label: 'Invoices', icon: FileText },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

const adminItems = [
  { id: 'roles' as CRMPage, label: 'Roles & Permissions', icon: Shield },
  { id: 'website' as CRMPage, label: 'Website', icon: Globe },
  { id: 'settings' as CRMPage, label: 'Settings', icon: Settings },
];

// Mapping from page to the "view" permission id used in the Roles & Permissions store.
// If a page is not listed here, it is always visible.
const PAGE_VIEW_PERMISSION: Partial<Record<CRMPage, string>> = {
  leads: 'leads_view',
  customers: 'customers_view',
  projects: 'projects_view',
  tasks: 'tasks_view',
  invoices: 'invoices_view',
  expenses: 'expenses_view',
  reports: 'reports_view',
  roles: 'roles_view',
  website: 'website_view',
  settings: 'settings_view',
};

export function CRMLayout({ children, currentPage, onNavigate, onBackToEntry, onLogout }: CRMLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [leadsCount, setLeadsCount] = useState<number>(0);
  const [tasksCount, setTasksCount] = useState<number>(0);
  const [contactMessages, setContactMessages] = useState<
    {
      id: string;
      name: string;
      email: string;
      company?: string | null;
      message: string;
      status: string;
      createdAtUtc: string;
      leadId?: number | null;
    }[]
  >([]);
  const [dismissedBellIds, setDismissedBellIds] = useState<Set<string>>(loadDismissedBellIds);
  const [crmBellItems, setCrmBellItems] = useState<
    { id: string; kind: string; title: string; subtitle?: string | null; createdAtUtc: string; relatedId?: number | null }[]
  >([]);
  const [profileName, setProfileName] = useState('Amr Mohamed');
  const [profileInitials, setProfileInitials] = useState('AM');
  const [roleName, setRoleName] = useState('Super Admin');
  const [permissions, setPermissions] = useState<Set<string>>(new Set());

  const fetchNavCounts = useCallback(async () => {
    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
      const authHeaders: Record<string, string> = {};
      if (token) authHeaders.Authorization = `Bearer ${token}`;

      const [leadRes, taskRes, contactRes, bellRes] = await Promise.all([
        fetch(`${API_BASE}/api/leads`),
        fetch(`${API_BASE}/api/tasks`),
        fetch(`${API_BASE}/api/contact-messages`),
        fetch(`${API_BASE}/api/crm-bell-notifications`, { headers: authHeaders, cache: 'no-store' }),
      ]);
      const toJson = (r: Response) => (r.ok ? r.json() : Promise.resolve([]));
      const [leadData, taskData, contactData, bellData] = await Promise.all([
        toJson(leadRes),
        toJson(taskRes),
        toJson(contactRes),
        bellRes.ok ? bellRes.json() : Promise.resolve([]),
      ]);
      const leads = Array.isArray(leadData) ? leadData : leadData?.value ?? [];
      const tasks = Array.isArray(taskData) ? taskData : taskData?.value ?? [];
      const contacts = Array.isArray(contactData) ? contactData : contactData?.value ?? [];
      const bellArr = Array.isArray(bellData) ? bellData : bellData?.value ?? [];
      setLeadsCount(leads.length);
      setTasksCount(tasks.length);
      setContactMessages(
        contacts.map((c: any) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          company: c.company,
          message: c.message,
          status: c.status,
          createdAtUtc: c.createdAtUtc,
          leadId: c.leadId ?? null,
        }))
      );
      setCrmBellItems(
        bellArr.map((n: any) => ({
          id: String(n.id),
          kind: String(n.kind ?? ''),
          title: String(n.title ?? ''),
          subtitle: n.subtitle ?? null,
          createdAtUtc: String(n.createdAtUtc ?? ''),
          relatedId: n.relatedId ?? null,
        }))
      );
    } catch {
      // keep previous counts on error
    }
  }, []);

  useEffect(() => {
    fetchNavCounts();
  }, [fetchNavCounts]);

  useEffect(() => {
    const interval = setInterval(fetchNavCounts, 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNavCounts]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchNavCounts();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [fetchNavCounts]);

  // Load current role & permissions for the logged-in user from the Roles API.
  useEffect(() => {
    const loadRolePermissions = async () => {
      try {
        const storedRoles = localStorage.getItem('authRoles');
        let primaryRoleId: string | null = null;
        if (storedRoles) {
          try {
            const parsed = JSON.parse(storedRoles);
            if (Array.isArray(parsed) && parsed.length > 0) {
              primaryRoleId = String(parsed[0]).toLowerCase();
            }
          } catch {
            // ignore parse errors, fall back below
          }
        }

        const res = await fetch(`${API_BASE}/api/roles`);
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) return;

        let role: any = null;
        if (primaryRoleId) {
          role = data.find((r: any) => String(r.id).toLowerCase() === primaryRoleId);
        }
        if (!role) {
          role = data[0];
        }

        if (!role) return;

        setRoleName(role.name || 'User');
        const perms = Array.isArray(role.permissions) ? role.permissions : [];
        setPermissions(new Set(perms.map((p: any) => String(p))));
      } catch {
        // keep defaults on error
      }
    };

    loadRolePermissions();
  }, []);

  const canViewPage = (page: CRMPage) => {
    const perm = PAGE_VIEW_PERMISSION[page];
    if (!perm) return true;
    return permissions.has(perm);
  };

  const navItems = NAV_ITEMS_BASE.filter((item) => canViewPage(item.id)).map((item) => ({
    ...item,
    badge: item.showBadge === 'leads' ? leadsCount : item.showBadge === 'tasks' ? tasksCount : undefined,
  }));

  const visibleAdminItems = adminItems.filter((item) => canViewPage(item.id));

  const websitePendingBell = contactMessages.filter(
    (m) => m.status === 'pending' && !dismissedBellIds.has(m.id)
  );

  const crmBellVisible = crmBellItems.filter((n) => !dismissedBellIds.has(n.id));

  type BellRow =
    | { key: string; source: 'website'; msg: (typeof contactMessages)[0] }
    | { key: string; source: 'crm'; item: (typeof crmBellItems)[0] };

  const allBellRows: BellRow[] = [
    ...crmBellVisible.map((item) => ({ key: `crm-${item.id}`, source: 'crm' as const, item })),
    ...websitePendingBell.map((msg) => ({ key: `web-${msg.id}`, source: 'website' as const, msg })),
  ].sort(
    (a, b) =>
      new Date(a.source === 'crm' ? a.item.createdAtUtc : a.msg.createdAtUtc).getTime() -
      new Date(b.source === 'crm' ? b.item.createdAtUtc : b.msg.createdAtUtc).getTime()
  );

  const navigateForBellKind = (kind: string) => {
    if (kind === 'lead_assigned' || kind === 'website_lead') onNavigate('leads');
    else if (kind === 'task_due') onNavigate('tasks');
    else if (kind === 'invoice_paid') onNavigate('invoices');
    else if (kind === 'project_update') onNavigate('projects');
  };

  const dismissBellNotification = (id: string) => {
    setDismissedBellIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem(WEBSITE_BELL_DISMISSED_KEY, JSON.stringify([...next]));
      } catch {
        // ignore quota errors
      }
      return next;
    });
  };

  useEffect(() => {
    const authEmail = (localStorage.getItem('authEmail') ?? '').trim().toLowerCase();
    const fallbackName = authEmail ? authEmail.split('@')[0] : 'User';
    const fallbackInitials = fallbackName.length >= 2
      ? (fallbackName.slice(0, 2)).toUpperCase()
      : fallbackName.toUpperCase() || 'U';

    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${API_BASE}/api/settings/profile`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          setProfileName(fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1));
          setProfileInitials(fallbackInitials);
          return;
        }
        const data = await res.json();
        const profileEmail = (data.email as string ?? '').trim().toLowerCase();
        if (authEmail && profileEmail !== authEmail) {
          setProfileName(fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1));
          setProfileInitials(fallbackInitials);
          return;
        }
        const first = (data.firstName as string | undefined) ?? '';
        const last = (data.lastName as string | undefined) ?? '';
        const fullName = `${first} ${last}`.trim();
        setProfileName(fullName || fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1));
        const fi = first?.charAt(0) ?? '';
        const li = last?.charAt(0) ?? '';
        const initials = (fi && li) ? (fi + li).toUpperCase() : fullName ? fullName.slice(0, 2).toUpperCase() : fallbackInitials;
        setProfileInitials(initials || fallbackInitials);
      } catch {
        setProfileName(fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1));
        setProfileInitials(fallbackInitials);
      }
    };
    loadProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200 px-4">
          {!isSidebarCollapsed ? (
            <img src="/images/amt-logo.png" alt="AMT" className="h-8 w-auto" />
          ) : (
            <span className="text-xl font-bold">A</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  currentPage === item.id
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isSidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge !== undefined && (
                      <Badge className="bg-[#C9A962] text-black text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Admin Section */}
          {!isSidebarCollapsed && (
            <div className="mt-8 px-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Admin
              </div>
            </div>
          )}
          <div className="px-3 space-y-1">
            {visibleAdminItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  currentPage === item.id
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isSidebarCollapsed && <span className="flex-1 text-left">{item.label}</span>}
              </button>
            ))}
          </div>
        </nav>

        {/* Back to public website */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onBackToEntry}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all"
          >
            <ArrowLeft className="w-5 h-5 flex-shrink-0" />
            {!isSidebarCollapsed && <span className="flex-1 text-left">View website</span>}
          </button>
        </div>

        {/* Collapse Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <img src="/images/amt-logo.png" alt="AMT" className="h-8 w-auto" />
          <button onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                currentPage === item.id
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && (
                <Badge className="bg-[#C9A962] text-black text-xs">
                  {item.badge}
                </Badge>
              )}
            </button>
          ))}
          <div className="pt-4 mt-4 border-t border-gray-200">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
              Admin
            </div>
            {visibleAdminItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                  currentPage === item.id
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            ))}
          </div>
          <div className="pt-4 mt-4 border-t border-gray-200">
            <button
              onClick={() => {
                onBackToEntry();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="flex-1 text-left">View website</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-64 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 hover:bg-gray-100 rounded-xl">
                  <Bell className="w-5 h-5 text-gray-600" />
                  {allBellRows.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C9A962] rounded-full" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allBellRows.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">No new notifications.</div>
                ) : (
                  allBellRows.slice(0, 12).map((row) =>
                    row.source === 'crm' ? (
                      <div
                        key={row.key}
                        className="flex items-start gap-2 px-2 py-2 border-b last:border-b-0 border-gray-100"
                      >
                        <button
                          type="button"
                          className="flex-1 min-w-0 text-left rounded-md hover:bg-gray-50 px-1 py-0.5 -mx-1"
                          onClick={() => navigateForBellKind(row.item.kind)}
                        >
                          <p className="text-sm font-medium text-black">{row.item.title}</p>
                          {row.item.subtitle ? (
                            <p className="text-xs text-gray-500 truncate">{row.item.subtitle}</p>
                          ) : null}
                        </button>
                        <button
                          type="button"
                          className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 shrink-0"
                          aria-label="Dismiss notification"
                          onClick={() => dismissBellNotification(row.item.id)}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        key={row.key}
                        className="flex items-start gap-2 px-2 py-2 border-b last:border-b-0 border-gray-100"
                      >
                        <button
                          type="button"
                          className="flex-1 min-w-0 text-left rounded-md hover:bg-gray-50 px-1 py-0.5 -mx-1"
                          onClick={() => onNavigate('leads')}
                        >
                          <p className="text-sm font-medium text-black">Website inquiry</p>
                          <p className="text-xs text-gray-500 truncate">
                            {row.msg.name} · {row.msg.email}
                          </p>
                        </button>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <button
                            type="button"
                            className="text-[10px] px-2 py-1 rounded-md bg-black text-white hover:bg-gray-900"
                            onClick={async () => {
                              try {
                                const res = await fetch(
                                  `${API_BASE}/api/contact-messages/${row.msg.id}/accept`,
                                  { method: 'POST' }
                                );
                                if (!res.ok) return;
                                const data = (await res.json()) as { leadId?: number };
                                setContactMessages((prev) =>
                                  prev.map((m) =>
                                    m.id === row.msg.id
                                      ? { ...m, status: 'accepted', leadId: data.leadId ?? m.leadId }
                                      : m
                                  )
                                );
                                fetchNavCounts();
                                toast.success(`Lead created: ${row.msg.name}`);
                              } catch {
                                // ignore
                              }
                            }}
                          >
                            Add to leads
                          </button>
                          <button
                            type="button"
                            className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                            aria-label="Dismiss notification"
                            onClick={() => dismissBellNotification(row.msg.id)}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 md:gap-3 hover:bg-gray-100 rounded-xl p-2 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                    <span className="text-sm font-medium text-[#C9A962]">
                      {profileInitials}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium">{profileName}</div>
                    <div className="text-xs text-gray-500">{roleName}</div>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate('settings')}>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onBackToEntry} className="text-gray-600">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  View website
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onLogout}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
