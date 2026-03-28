import { useState, useEffect, useMemo } from 'react';
import { Download, Calendar, Users, DollarSign, BarChart3, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';
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
import { toast } from 'sonner';
import { API_BASE } from '@/lib/api';

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

export function Reports() {
  const [dateRange, setDateRange] = useState('this-month');
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<{ id: number; stage: number }[]>([]);
  const [invoices, setInvoices] = useState<{ total: number; issueDateUtc: string }[]>([]);
  const [expenses, setExpenses] = useState<{ amount: number; expenseDateUtc: string }[]>([]);
  const [projects, setProjects] = useState<{ id: number }[]>([]);
  const [products, setProducts] = useState<{ name: string; price: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [leadRes, invRes, expRes, projRes, prodRes] = await Promise.all([
          fetch(`${API_BASE}/api/leads`),
          fetch(`${API_BASE}/api/invoices`),
          fetch(`${API_BASE}/api/expenses`),
          fetch(`${API_BASE}/api/projects`),
          fetch(`${API_BASE}/api/products`),
        ]);
        if (leadRes.ok) {
          const raw = await leadRes.json();
          const data = Array.isArray(raw) ? raw : raw?.value ?? [];
          setLeads(data.map((l: { id: number; stage: number }) => ({ id: l.id, stage: l.stage })));
        }
        if (invRes.ok) {
          const raw = await invRes.json();
          const data = Array.isArray(raw) ? raw : raw?.value ?? [];
          setInvoices(data.map((i: { total: number; issueDateUtc: string }) => ({ total: Number(i.total), issueDateUtc: i.issueDateUtc })));
        }
        if (expRes.ok) {
          const raw = await expRes.json();
          const data = Array.isArray(raw) ? raw : raw?.value ?? [];
          setExpenses(data.map((e: { amount: number; expenseDateUtc: string }) => ({ amount: Number(e.amount), expenseDateUtc: e.expenseDateUtc })));
        }
        if (projRes.ok) {
          const raw = await projRes.json();
          const data = Array.isArray(raw) ? raw : raw?.value ?? [];
          setProjects(data.map((p: { id: number }) => ({ id: p.id })));
        }
        if (prodRes.ok) {
          const raw = await prodRes.json();
          const data = Array.isArray(raw) ? raw : raw?.value ?? [];
          setProducts(data.map((p: { name: string; price: number }) => ({ name: p.name, price: Number(p.price) })));
        }
      } catch {
        toast.error('Failed to load report data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const revenueChartData = useMemo(() => {
    const now = new Date();
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
      const d = new Date(inv.issueDateUtc);
      const m = months.find((x) => x.month === d.getMonth() && x.year === d.getFullYear());
      if (m) m.revenue += inv.total;
    });
    expenses.forEach((exp) => {
      const d = new Date(exp.expenseDateUtc);
      const m = months.find((x) => x.month === d.getMonth() && x.year === d.getFullYear());
      if (m) m.expenses += exp.amount;
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

  const serviceRevenueData = useMemo(() => {
    return products.map((p) => ({ name: p.name.length > 18 ? p.name.slice(0, 18) + '…' : p.name, value: p.price }));
  }, [products]);

  const totalRevenue = useMemo(() => invoices.reduce((acc, i) => acc + i.total, 0), [invoices]);
  const totalExpenses = useMemo(() => expenses.reduce((acc, e) => acc + e.amount, 0), [expenses]);
  const wonLeads = useMemo(() => leads.filter((l) => l.stage === 5).length, [leads]);
  const leadConversionRate = useMemo(() => (leads.length ? Math.round((wonLeads / leads.length) * 100) : 0), [leads.length, wonLeads]);
  const revenueTrendPercent = useMemo(() => {
    if (revenueChartData.length < 2) return 0;
    const prev = revenueChartData[revenueChartData.length - 2]?.revenue ?? 0;
    const curr = revenueChartData[revenueChartData.length - 1]?.revenue ?? 0;
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  }, [revenueChartData]);

  const handleExport = () => {
    const lines = [
      'Report,Value',
      `Total Revenue (EGP),${totalRevenue}`,
      `Total Expenses (EGP),${totalExpenses}`,
      `Total Leads,${leads.length}`,
      `Won Leads,${wonLeads}`,
      `Conversion Rate %,${leadConversionRate}`,
      `Projects,${projects.length}`,
      `Products/Services,${products.length}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports-${dateRange}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  const reportCards = [
    {
      title: 'Lead Report',
      description: 'Track lead generation, conversion rates, and pipeline health',
      icon: Users,
      color: 'bg-blue-500',
      stat: `${leads.length} leads`,
    },
    {
      title: 'Revenue Report',
      description: 'Analyze revenue trends, invoices, and payment status',
      icon: DollarSign,
      color: 'bg-green-500',
      stat: `EGP ${totalRevenue.toLocaleString()}`,
    },
    {
      title: 'Expense Report',
      description: 'Review expenses by category and time period',
      icon: FileText,
      color: 'bg-red-500',
      stat: `EGP ${totalExpenses.toLocaleString()}`,
    },
    {
      title: 'Project Report',
      description: 'Monitor project progress, deadlines, and profitability',
      icon: BarChart3,
      color: 'bg-purple-500',
      stat: `${projects.length} projects`,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-[var(--amd-gray-500)]">Loading reports…</p>
      </div>
    );
  }

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
            Reports & Analytics
          </h1>
          <p className="text-[var(--amd-gray-500)] mt-1">
            Comprehensive insights into your business performance
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Report Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {reportCards.map((report) => (
          <Card key={report.title} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className={`w-12 h-12 rounded-lg ${report.color} bg-opacity-10 flex items-center justify-center mb-4`}>
                <report.icon className={`w-6 h-6 ${report.color.replace('bg-', 'text-')}`} />
              </div>
              <h3 className="font-heading text-lg font-semibold text-[var(--amd-black)] mb-2">
                {report.title}
              </h3>
              <p className="text-sm text-[var(--amd-gray-500)] mb-2">{report.description}</p>
              <p className="text-sm font-semibold text-[var(--amd-black)]">{report.stat}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-heading text-lg">Revenue Trend</CardTitle>
              <Badge className={revenueTrendPercent >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                {revenueTrendPercent >= 0 ? '+' : ''}{revenueTrendPercent}% vs last month
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="h-64">
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
                    <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-heading text-lg">Lead Conversion</CardTitle>
              <Badge className="bg-blue-100 text-blue-700">{leadConversionRate}% conversion rate</Badge>
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
                  <div className="flex items-center justify-center h-64 text-[var(--amd-gray-500)]">No lead data</div>
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

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">Revenue by Service (price)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {serviceRevenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={serviceRevenueData} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                      <XAxis type="number" stroke="#737373" fontSize={12} tickFormatter={(v) => `EGP ${(v / 1000).toFixed(0)}k`} />
                      <YAxis dataKey="name" type="category" stroke="#737373" fontSize={12} width={120} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E5E5E5',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => `EGP ${value.toLocaleString()}`}
                      />
                      <Bar dataKey="value" name="Price" fill="#C9A962" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-[var(--amd-gray-500)]">No products</div>
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
            <CardHeader>
              <CardTitle className="font-heading text-lg">Key Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { label: 'Total Revenue', value: `EGP ${totalRevenue.toLocaleString()}`, change: `${invoices.length} invoices`, positive: true },
                  { label: 'Total Expenses', value: `EGP ${totalExpenses.toLocaleString()}`, change: `${expenses.length} expenses`, positive: false },
                  { label: 'Leads', value: String(leads.length), change: `${wonLeads} won`, positive: true },
                  { label: 'Active Projects', value: String(projects.length), change: `${products.length} services`, positive: true },
                ].map((metric) => (
                  <div key={metric.label} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[var(--amd-gray-500)]">{metric.label}</p>
                      <p className="text-lg font-semibold text-[var(--amd-black)]">{metric.value}</p>
                    </div>
                    <span className="text-sm text-[var(--amd-gray-500)]">{metric.change}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
