import { useState, useRef, useEffect } from 'react';
import { Search, Plus, MoreHorizontal, FileText, Send, Eye, X, Trash2, CheckCircle2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { API_BASE } from '@/lib/api';
import { toast } from 'sonner';
import type { Invoice, InvoiceStatus, InvoiceLineItem } from '@/types';

const STATUS_STR: Record<number, string> = {
  0: 'draft', 1: 'sent', 2: 'viewed', 3: 'paid', 4: 'overdue', 5: 'cancelled',
};
const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  viewed: 'bg-purple-100 text-purple-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

type ApiInvoice = {
  id: number;
  invoiceNumber: string;
  customerId: number;
  customerName: string;
  projectId: number | null;
  projectName: string | null;
  status: number;
  issueDateUtc: string;
  dueDateUtc: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  notes: string | null;
  lineItems: { id: number; description: string; quantity: number; unitPrice: number; total: number }[];
};

type CustomerOption = { id: number; name: string };
type ProjectOption = { id: number; name: string };

interface InvoicesProps {
  createForCustomerId?: string | null;
  onClearCreateForCustomer?: () => void;
}

export function Invoices({ createForCustomerId, onClearCreateForCustomer }: InvoicesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const toCustomerReference = (id: number, name: string): Invoice['customer'] => {
    const nowIso = new Date().toISOString();
    return {
      id: String(id),
      name,
      email: '',
      contacts: [],
      tags: [],
      notes: [],
      activities: [],
      projects: [],
      invoices: [],
      totalRevenue: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
  };

  const toProjectReference = (projectId: number | null, projectName: string | null): Invoice['project'] => {
    if (projectId == null || !projectName) return undefined;
    const nowIso = new Date().toISOString();
    return {
      id: String(projectId),
      name: projectName,
      description: '',
      customer: toCustomerReference(0, ''),
      status: 'planning',
      priority: 'medium',
      teamMembers: [],
      tasks: [],
      invoices: [],
      expenses: [],
      deliverables: [],
      notes: [],
      progress: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
  };

  const [formData, setFormData] = useState({
    customer: '',
    project: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
    lineItems: [{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }] as InvoiceLineItem[],
  });

  const mapApiToInvoice = (api: ApiInvoice): Invoice => ({
    id: String(api.id),
    invoiceNumber: api.invoiceNumber,
    customer: toCustomerReference(api.customerId, api.customerName),
    project: toProjectReference(api.projectId, api.projectName),
    issueDate: api.issueDateUtc,
    dueDate: api.dueDateUtc,
    status: STATUS_STR[api.status] as InvoiceStatus ?? 'draft',
    lineItems: api.lineItems.map((li) => ({ id: String(li.id), description: li.description, quantity: li.quantity, unitPrice: li.unitPrice, total: li.total })),
    subtotal: api.subtotal,
    taxRate: api.taxRate,
    taxAmount: api.taxAmount,
    total: api.total,
    amountPaid: api.amountPaid,
    balanceDue: api.balanceDue,
    notes: api.notes ?? undefined,
    createdBy: {} as any,
    createdAt: '',
    updatedAt: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [invRes, custRes, projRes] = await Promise.all([
          fetch(`${API_BASE}/api/invoices`),
          fetch(`${API_BASE}/api/customers`),
          fetch(`${API_BASE}/api/projects`),
        ]);
        if (invRes.ok) {
          const data: ApiInvoice[] = await invRes.json();
          setInvoices(data.map(mapApiToInvoice));
        }
        if (custRes.ok) {
          const data: { id: number; name: string }[] = await custRes.json();
          setCustomers(data.map((c) => ({ id: c.id, name: c.name })));
        }
        if (projRes.ok) {
          const data: { id: number; name: string }[] = await projRes.json();
          setProjects(data.map((p) => ({ id: p.id, name: p.name })));
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (createForCustomerId && customers.length > 0) {
      setFormData((prev) => ({ ...prev, customer: createForCustomerId }));
      setIsCreateDialogOpen(true);
      onClearCreateForCustomer?.();
    }
  }, [createForCustomerId, customers.length, onClearCreateForCustomer]);

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOutstanding = invoices
    .filter((i) => i.status === 'sent' || i.status === 'overdue')
    .reduce((acc, i) => acc + i.balanceDue, 0);

  const totalOverdue = invoices
    .filter((i) => i.status === 'overdue')
    .reduce((acc, i) => acc + i.balanceDue, 0);

  const resetForm = () => {
    setFormData({
      customer: '',
      project: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      notes: '',
      lineItems: [{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }],
    });
  };

  const calculateTotals = (items: InvoiceLineItem[]) => {
    const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const taxRate = 14;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const updateLineItem = (index: number, field: keyof InvoiceLineItem, value: string | number) => {
    const newItems = [...formData.lineItems];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    setFormData({ ...formData, lineItems: newItems });
  };

  const addLineItem = () => {
    setFormData({
      ...formData,
      lineItems: [...formData.lineItems, { id: String(formData.lineItems.length + 1), description: '', quantity: 1, unitPrice: 0, total: 0 }],
    });
  };

  const removeLineItem = (index: number) => {
    setFormData({
      ...formData,
      lineItems: formData.lineItems.filter((_, i) => i !== index),
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!formData.customer || formData.dueDate === '') {
      toast.error('Please select a customer and due date.');
      return;
    }
    setIsCreatingInvoice(true);
    try {
      const payload = {
        customerId: Number(formData.customer),
        projectId: formData.project ? Number(formData.project) : null,
        issueDateUtc: new Date(formData.issueDate).toISOString(),
        dueDateUtc: new Date(formData.dueDate).toISOString(),
        notes: formData.notes || null,
        lineItems: formData.lineItems.map((li) => ({
          description: li.description || 'Item',
          quantity: li.quantity,
          unitPrice: Number(li.unitPrice),
        })),
      };
      const res = await fetch(`${API_BASE}/api/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errText = await res.text();
        let message = errText || 'Failed to create invoice';
        try {
          const errJson = JSON.parse(errText);
          if (errJson?.error) message = errJson.error;
        } catch {
          /* use errText as message */
        }
        toast.error(message);
        return;
      }
      const created: ApiInvoice = await res.json();
      setInvoices((prev) => [...prev, mapApiToInvoice(created)]);
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Invoice created.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create invoice');
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedInvoice) return;
    const res = await fetch(`${API_BASE}/api/invoices/${selectedInvoice.id}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) return;
    setInvoices((prev) => prev.filter((inv) => inv.id !== selectedInvoice.id));
    setIsDeleteDialogOpen(false);
    setSelectedInvoice(null);
  };

  const handleMarkPaid = async () => {
    if (!selectedInvoice) return;
    const res = await fetch(`${API_BASE}/api/invoices/${selectedInvoice.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 3 }),
    });
    if (!res.ok) return;
    const updated: ApiInvoice = await res.json();
    setInvoices((prev) => prev.map((inv) => (inv.id === selectedInvoice.id ? mapApiToInvoice(updated) : inv)));
    setSelectedInvoice(mapApiToInvoice(updated));
  };

  const handleSendInvoice = async (invoice?: Invoice) => {
    const inv = invoice ?? selectedInvoice;
    if (!inv) return;
    const res = await fetch(`${API_BASE}/api/invoices/${inv.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 1 }),
    });
    if (!res.ok) return;
    const updated: ApiInvoice = await res.json();
    setInvoices((prev) => prev.map((i) => (i.id === inv.id ? mapApiToInvoice(updated) : i)));
    if (selectedInvoice?.id === inv.id) setSelectedInvoice(mapApiToInvoice(updated));
  };

  const openViewDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewDialogOpen(true);
  };
  const openDeleteDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDeleteDialogOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const { subtotal, taxAmount, total } = calculateTotals(formData.lineItems);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-gray-500">Loading invoices...</p>
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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-500 mt-1">Manage client invoices and payments</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-black hover:bg-gray-800 text-white">
          <Plus className="w-4 h-4 mr-2" /> Create Invoice
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Invoices', value: invoices.length, color: 'bg-blue-500' },
          { label: 'Paid', value: invoices.filter((i) => i.status === 'paid').length, color: 'bg-green-500' },
          { label: 'Outstanding', value: `EGP ${totalOutstanding.toLocaleString()}`, color: 'bg-amber-500' },
          { label: 'Overdue', value: `EGP ${totalOverdue.toLocaleString()}`, color: 'bg-red-500' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${stat.color} bg-opacity-10 flex items-center justify-center`}>
                  <div className={`w-3 h-3 rounded-full ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search invoices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 max-w-md"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Invoice</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Balance</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                            <FileText className="w-5 h-5 text-[#C9A962]" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                            {invoice.project && <p className="text-xs text-gray-500">{invoice.project.name}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-900">{invoice.customer.name}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <p>Issued: {new Date(invoice.issueDate).toLocaleDateString()}</p>
                          <p className="text-gray-500">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge className={statusColors[invoice.status]}>{invoice.status}</Badge>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <p className="font-medium">EGP {invoice.total.toLocaleString()}</p>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <p className={`font-medium ${invoice.balanceDue > 0 ? 'text-red-600' : ''}`}>
                          EGP {invoice.balanceDue.toLocaleString()}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openViewDialog(invoice)}>
                              <Eye className="w-4 h-4 mr-2" /> View
                            </DropdownMenuItem>
                            {invoice.status !== 'paid' && (
                              <DropdownMenuItem onClick={() => handleSendInvoice(invoice)}>
                                <Send className="w-4 h-4 mr-2" /> Send
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => openDeleteDialog(invoice)} className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Customer *</Label>
                <Select value={formData.customer} onValueChange={(v) => setFormData({ ...formData, customer: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent className="z-[100]">
                    {customers.length === 0 ? (
                      <div className="py-2 px-2 text-sm text-muted-foreground">No customers yet. Add one from Customers.</div>
                    ) : (
                      customers.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Project</Label>
                <Select value={formData.project} onValueChange={(v) => setFormData({ ...formData, project: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent className="z-[100]">
                    {projects.length === 0 ? (
                      <div className="py-2 px-2 text-sm text-muted-foreground">No projects yet.</div>
                    ) : (
                      projects.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Issue Date</Label>
                <Input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Line Items</Label>
              <div className="space-y-2">
                {formData.lineItems.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', Number(e.target.value))}
                      className="w-20"
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(index, 'unitPrice', Number(e.target.value))}
                      className="w-28"
                    />
                    <div className="w-24 py-2 text-right font-medium">EGP {item.total.toLocaleString()}</div>
                    {formData.lineItems.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeLineItem(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addLineItem}>
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal:</span>
                <span>EGP {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax (14%):</span>
                <span>EGP {taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>EGP {total.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleCreate}
              disabled={isCreatingInvoice}
              className="bg-black hover:bg-gray-800 text-white"
            >
              {isCreatingInvoice ? 'Creating...' : 'Create Invoice'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between no-print">
              <DialogTitle className="text-xl">Invoice {selectedInvoice?.invoiceNumber}</DialogTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" /> Print
                </Button>
                {selectedInvoice?.status !== 'paid' && (
                  <Button
                    size="sm"
                    onClick={handleMarkPaid}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Paid
                  </Button>
                )}
                <DialogClose asChild>
                  <Button variant="ghost" size="icon">
                    <X className="w-4 h-4" />
                  </Button>
                </DialogClose>
              </div>
            </div>
          </DialogHeader>
          <div ref={invoiceRef} className="p-8 bg-white print:p-0">
            <div className="border-b pb-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <img src="/images/amt-logo.png" alt="AMT Solutions" className="h-12 mb-2" />
                  <p className="text-gray-500 text-sm">
                    123 Nile Corniche, Suite 500<br />Cairo, Egypt
                  </p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold">INVOICE</h2>
                  <p className="text-gray-500">{selectedInvoice?.invoiceNumber}</p>
                  <Badge className={statusColors[selectedInvoice?.status || 'draft']}>
                    {selectedInvoice?.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 mb-6">
              <div>
                <h3 className="font-semibold text-gray-500 mb-2">Bill To:</h3>
                <p className="font-medium">{selectedInvoice?.customer.name}</p>
                <p className="text-gray-500 text-sm">{selectedInvoice?.customer.email}</p>
                <p className="text-gray-500 text-sm">{selectedInvoice?.customer.phone}</p>
              </div>
              <div className="text-right">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Issue Date:</span>
                    <span>
                      {selectedInvoice?.issueDate &&
                        new Date(selectedInvoice.issueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Due Date:</span>
                    <span>
                      {selectedInvoice?.dueDate &&
                        new Date(selectedInvoice.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <table className="w-full mb-6">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold">Description</th>
                  <th className="text-right p-3 text-sm font-semibold">Quantity</th>
                  <th className="text-right p-3 text-sm font-semibold">Unit Price</th>
                  <th className="text-right p-3 text-sm font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice?.lineItems.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-3">{item.description}</td>
                    <td className="p-3 text-right">{item.quantity}</td>
                    <td className="p-3 text-right">EGP {item.unitPrice.toLocaleString()}</td>
                    <td className="p-3 text-right">EGP {item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal:</span>
                  <span>EGP {selectedInvoice?.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax (14%):</span>
                  <span>EGP {selectedInvoice?.taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>EGP {selectedInvoice?.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Amount Paid:</span>
                  <span>EGP {selectedInvoice?.amountPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-red-600 font-medium">
                  <span>Balance Due:</span>
                  <span>EGP {selectedInvoice?.balanceDue.toLocaleString()}</span>
                </div>
              </div>
            </div>
            {selectedInvoice?.notes && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-500 mb-2">Notes:</h3>
                <p className="text-gray-600 text-sm">{selectedInvoice.notes}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to delete invoice <strong>{selectedInvoice?.invoiceNumber}</strong>? This
              action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleDelete} variant="destructive">
              Delete Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          [data-state="open"] > [data-radix-dialog-content] { max-width: 100% !important; width: 100% !important; height: 100% !important; max-height: 100% !important; }
        }
      `}</style>
    </div>
  );
}
