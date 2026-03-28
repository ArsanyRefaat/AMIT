import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  UserPlus,
  FolderKanban,
  CheckSquare,
  FileText,
  Receipt,
  DollarSign,
  ArrowRight,
  Calendar,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import { API_BASE } from '@/lib/api';

type CRMPage = 'dashboard' | 'leads' | 'customers' | 'products' | 'projects' | 'tasks' | 'invoices' | 'expenses' | 'reports';

const LEAD_STAGE_LABELS: Record<number, string> = {
  0: 'New',
  1: 'Contacted',
  2: 'Qualified',
  3: 'Proposal',
  4: 'Negotiation',
  5: 'Won',
  6: 'Lost',
};

const LEAD_STAGE_COLORS: Record<number, string> = {
  0: '#6366F1',
  1: '#8B5CF6',
  2: '#3B82F6',
  3: '#F59E0B',
  4: '#F97316',
  5: '#10B981',
  6: '#EF4444',
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type ApiLead = { id: number; stage: number; createdAt?: string };
type ApiInvoice = { id: number; invoiceNumber: string; customerName: string; total: number; dueDateUtc: string; issueDateUtc?: string; status: number };
type ApiTask = { id: number; title: string; status: number; dueDateUtc: string | null };
type ApiProject = { id: number };

interface DashboardProps {
  onNavigate?: (page: CRMPage) => void;
}

const REFRESH_INTERVAL_MS = 60 * 1000; // 60 seconds

export function Dashboard({ onNavigate }: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [leads, setLeads] = useState<ApiLead[]>([]);
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [invoices, setInvoices] = useState<ApiInvoice[]>([]);
  const [expenses, setExpenses] = useState<{ amount: number; expenseDateUtc: string }[]>([]);

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [leadRes, custRes, projRes, taskRes, invRes, expRes] = await Promise.all([
        fetch(`${API_BASE}/api/leads`),
        fetch(`${API_BASE}/api/customers`),
        fetch(`${API_BASE}/api/projects`),
        fetch(`${API_BASE}/api/tasks`),
        fetch(`${API_BASE}/api/invoices`),
        fetch(`${API_BASE}/api/expenses`),
      ]);
      const toJson = (r: Response) => r.ok ? r.json() : Promise.resolve([]);
      const [leadData, _custData, projData, taskData, invData, expData] = await Promise.all([
        toJson(leadRes),
        toJson(custRes),
        toJson(projRes),
        toJson(taskRes),
        toJson(invRes),
        toJson(expRes),
      ]);
      setLeads(Array.isArray(leadData) ? leadData : leadData?.value ?? []);
      setProjects(Array.isArray(projData) ? projData : projData?.value ?? []);
      setTasks(Array.isArray(taskData) ? taskData : taskData?.value ?? []);
      setInvoices(Array.isArray(invData) ? invData : invData?.value ?? []);
      setExpenses(Array.isArray(expData) ? expData : expData?.value ?? []);
      setLastUpdated(new Date());
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  useEffect(() => {
    const interval = setInterval(() => loadData(false), REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') loadData(false);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [loadData]);

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();

  const totalLeads = leads.length;
  const newLeadsThisMonth = useMemo(() => leads.filter((l: ApiLead) => l.createdAt && new Date(l.createdAt).getTime() >= thisMonthStart).length, [leads, thisMonthStart]);
  const revenueThisMonth = useMemo(
    () =>
      invoices
        .filter((i) => {
          const d = i.issueDateUtc ? new Date(i.issueDateUtc) : new Date(i.dueDateUtc);
          return d.getTime() >= thisMonthStart;
        })
        .reduce((acc, i) => acc + Number(i.total), 0),
    [invoices, thisMonthStart]
  );
  const revenueLastMonth = useMemo(
    () =>
      invoices
        .filter((i) => {
          const d = i.issueDateUtc ? new Date(i.issueDateUtc) : new Date(i.dueDateUtc);
          const t = d.getTime();
          return t >= lastMonthStart && t < thisMonthStart;
        })
        .reduce((acc, i) => acc + Number(i.total), 0),
    [invoices, lastMonthStart, thisMonthStart]
  );
  const revenueTrend = revenueLastMonth > 0 ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100) : (revenueThisMonth > 0 ? 100 : 0);
  const activeProjects = projects.length;
  const pendingTasks = useMemo(() => tasks.filter((t) => t.status !== 3).length, [tasks]);

  const revenueChartData = useMemo(() => {
    const months: { name: string; revenue: number; expenses: number; month: number; year: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        name: MONTH_NAMES[d.getMonth()],
        revenue: 0,
        expenses: 0,
        month: d.getMonth(),
        year: d.getFullYear(),
      });
    }
    invoices.forEach((inv) => {
      const d = inv.issueDateUtc ? new Date(inv.issueDateUtc) : new Date(inv.dueDateUtc);
      const m = months.find((x) => x.month === d.getMonth() && x.year === d.getFullYear());
      if (m) m.revenue += Number(inv.total);
    });
    expenses.forEach((exp) => {
      const d = new Date(exp.expenseDateUtc);
      const m = months.find((x) => x.month === d.getMonth() && x.year === d.getFullYear());
      if (m) m.expenses += Number(exp.amount);
    });
    return months.map(({ name, revenue, expenses }) => ({ name, revenue, expenses }));
  }, [invoices, expenses]);

  const leadsChartData = useMemo(() => {
    const counts: Record<number, number> = {};
    Object.keys(LEAD_STAGE_LABELS).forEach((k) => (counts[Number(k)] = 0));
    leads.forEach((l) => (counts[l.stage] = (counts[l.stage] ?? 0) + 1));
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([stage, value]) => ({
        name: LEAD_STAGE_LABELS[Number(stage)] ?? `Stage ${stage}`,
        value,
        fill: LEAD_STAGE_COLORS[Number(stage)] ?? '#94A3B8',
      }))
      .sort((a, b) => b.value - a.value);
  }, [leads]);

  const upcomingTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status !== 3)
      .sort((a, b) => {
        if (!a.dueDateUtc) return 1;
        if (!b.dueDateUtc) return -1;
        return new Date(a.dueDateUtc).getTime() - new Date(b.dueDateUtc).getTime();
      })
      .slice(0, 5);
  }, [tasks]);

  const outstandingInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const status = Number(inv.status);
      const isUnpaid = status !== 3 && status !== 5;
      const due = new Date(inv.dueDateUtc);
      return isUnpaid && due.getTime() <= now.getTime() + 90 * 24 * 60 * 60 * 1000;
    });
  }, [invoices]);

  const alerts = useMemo(() => {
    const list: { type: 'overdue' | 'due_soon' | 'new_lead'; title: string; message: string }[] = [];
    const overdue = invoices.filter((inv) => {
      const status = Number(inv.status);
      if (status === 3 || status === 5) return false;
      return new Date(inv.dueDateUtc).getTime() < now.getTime();
    });
    overdue.slice(0, 2).forEach((inv) => {
      list.push({
        type: 'overdue',
        title: 'Overdue Invoice',
        message: `${inv.invoiceNumber} – EGP ${Number(inv.total).toLocaleString()} (${inv.customerName}). Follow up required.`,
      });
    });
    const dueSoon = tasks.filter((t) => {
      if (!t.dueDateUtc) return false;
      const d = new Date(t.dueDateUtc).getTime();
      const in3Days = now.getTime() + 3 * 24 * 60 * 60 * 1000;
      return d <= in3Days && d >= now.getTime();
    });
    dueSoon.slice(0, 1).forEach((t) => {
      list.push({
        type: 'due_soon',
        title: 'Task Due Soon',
        message: `${t.title} – due ${new Date(t.dueDateUtc!).toLocaleDateString()}.`,
      });
    });
    const newLeads = leads.filter((l) => l.stage === 0).length;
    if (newLeads > 0) {
      list.push({
        type: 'new_lead',
        title: 'New Leads',
        message: `${newLeads} new lead(s) in pipeline.`,
      });
    }
    return list.slice(0, 3);
  }, [invoices, tasks, leads]);

  const quickActions = [
    { label: 'Add Lead', icon: UserPlus, color: 'bg-blue-500', page: 'leads' as CRMPage },
    { label: 'Create Invoice', icon: FileText, color: 'bg-green-500', page: 'invoices' as CRMPage },
    { label: 'Add Expense', icon: Receipt, color: 'bg-red-500', page: 'expenses' as CRMPage },
    { label: 'New Task', icon: CheckSquare, color: 'bg-purple-500', page: 'tasks' as CRMPage },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-[var(--amd-gray-500)]">Loading dashboard…</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Leads',
      value: totalLeads,
      change: newLeadsThisMonth > 0 ? `+${newLeadsThisMonth} this month` : '0 this month',
      trend: 'up' as const,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'New Leads This Month',
      value: newLeadsThisMonth,
      change: totalLeads > 0 ? `${Math.round((newLeadsThisMonth / totalLeads) * 100)}% of total` : '—',
      trend: 'up' as const,
      icon: UserPlus,
      color: 'bg-indigo-500',
    },
    {
      title: 'Revenue This Month',
      value: `EGP ${revenueThisMonth.toLocaleString()}`,
      change: `${revenueTrend >= 0 ? '+' : ''}${revenueTrend}%`,
      trend: (revenueTrend >= 0 ? 'up' : 'down') as 'up' | 'down',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Active Projects',
      value: activeProjects,
      change: `${pendingTasks} pending tasks`,
      trend: 'up' as const,
      icon: FolderKanban,
      color: 'bg-amber-500',
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-[var(--amd-black)]">
            Dashboard
          </h1>
          <p className="text-[var(--amd-gray-500)] mt-1">
            Welcome back! Here’s what’s happening with your business.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-[var(--amd-gray-500)]"
            onClick={() => {
              setRefreshing(true);
              loadData(false).finally(() => setRefreshing(false));
            }}
            disabled={loading || refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <span className="text-sm text-[var(--amd-gray-500)]">
            <Calendar className="w-4 h-4 inline mr-1" />
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
          {lastUpdated && (
            <span className="ml-3 text-xs">
              Data updated {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-wrap gap-3"
      >
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="border-[var(--amd-gray-200)] hover:bg-[var(--amd-gray-50)]"
            onClick={() => onNavigate?.(action.page)}
          >
            <action.icon className={`w-4 h-4 mr-2 ${action.color.replace('bg-', 'text-')}`} />
            {action.label}
          </Button>
        ))}
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-[var(--amd-gray-500)]">{stat.title}</p>
                    <p className="text-2xl font-bold text-[var(--amd-black)] mt-1">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {stat.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${stat.color} bg-opacity-10 flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-heading text-lg">Revenue vs Expenses</CardTitle>
              {onNavigate && (
                <Button variant="ghost" size="sm" className="text-[var(--amd-gold)]" onClick={() => onNavigate('reports')}>
                  View Report <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {revenueChartData.some((d) => d.revenue > 0 || d.expenses > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                      <XAxis dataKey="name" stroke="#737373" fontSize={12} />
                      <YAxis stroke="#737373" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E5E5E5',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => `EGP ${value.toLocaleString()}`}
                      />
                      <Bar dataKey="revenue" name="Revenue" fill="#0F0F0F" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" name="Expenses" fill="#C9A962" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-[var(--amd-gray-500)]">No revenue or expense data yet</div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-heading text-lg">Leads by Status</CardTitle>
              {onNavigate && (
                <Button variant="ghost" size="sm" className="text-[var(--amd-gold)]" onClick={() => onNavigate('leads')}>
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {leadsChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leadsChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {leadsChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-[var(--amd-gray-500)]">No lead data yet</div>
                )}
              </div>
              {leadsChartData.length > 0 && (
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {leadsChartData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-sm text-[var(--amd-gray-600)]">
                        {item.name} ({item.value})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-heading text-lg">Tasks Due Soon</CardTitle>
              <Badge className="bg-[var(--amd-gold)] text-[var(--amd-black)]">{upcomingTasks.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingTasks.length > 0 ? (
                  upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-[var(--amd-gray-50)] hover:bg-[var(--amd-gray-100)] transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--amd-black)] truncate">{task.title}</p>
                        <p className="text-xs text-[var(--amd-gray-500)]">
                          Due: {task.dueDateUtc ? new Date(task.dueDateUtc).toLocaleDateString() : 'No date'}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {task.status === 0 ? 'To do' : task.status === 1 ? 'In progress' : task.status === 2 ? 'Review' : 'Done'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[var(--amd-gray-500)]">No upcoming tasks</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.45 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-heading text-lg">Outstanding Invoices</CardTitle>
              <Badge className="bg-red-500 text-white">{outstandingInvoices.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {outstandingInvoices.length > 0 ? (
                  outstandingInvoices.slice(0, 5).map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-[var(--amd-gray-50)]"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[var(--amd-black)] flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-[var(--amd-gold)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--amd-black)]">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-[var(--amd-gray-500)] truncate">{invoice.customerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[var(--amd-black)]">
                          EGP {Number(invoice.total).toLocaleString()}
                        </p>
                        <p className="text-xs text-red-500">
                          Due: {new Date(invoice.dueDateUtc).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[var(--amd-gray-500)]">No outstanding invoices</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">Alerts & Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.length > 0 ? (
                  alerts.map((alert, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        alert.type === 'overdue'
                          ? 'bg-red-50 border-red-100'
                          : alert.type === 'due_soon'
                          ? 'bg-amber-50 border-amber-100'
                          : 'bg-blue-50 border-blue-100'
                      }`}
                    >
                      <AlertCircle
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          alert.type === 'overdue' ? 'text-red-500' : alert.type === 'due_soon' ? 'text-amber-500' : 'text-blue-500'
                        }`}
                      />
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            alert.type === 'overdue' ? 'text-red-800' : alert.type === 'due_soon' ? 'text-amber-800' : 'text-blue-800'
                          }`}
                        >
                          {alert.title}
                        </p>
                        <p
                          className={`text-xs ${
                            alert.type === 'overdue' ? 'text-red-600' : alert.type === 'due_soon' ? 'text-amber-600' : 'text-blue-600'
                          }`}
                        >
                          {alert.message}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[var(--amd-gray-500)]">No alerts right now</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
