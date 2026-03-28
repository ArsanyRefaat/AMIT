import { useEffect, useState } from 'react';
import { Search, Plus, MoreHorizontal, Mail, Phone, MapPin, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { API_BASE } from '@/lib/api';

interface CustomersProps {
  onNavigateToCreateInvoice?: (customerId: string) => void;
}

export function Customers({ onNavigateToCreateInvoice }: CustomersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
  });

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/customers`);
        if (!res.ok) return;
        const data: { id: number; name: string; email: string; phone?: string; company?: string; address?: string }[] = await res.json();
        const mapped = data.map(c => ({
          id: String(c.id),
          name: c.name,
          email: c.email,
          phone: c.phone,
          company: c.company,
          address: c.address,
          industry: c.company ?? '',
          totalRevenue: 0,
          projects: [],
          invoices: [],
        }));
        setCustomers(mapped);
      } catch {
        // ignore for now
      }
    };

    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.industry && customer.industry.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            Customers
          </h1>
          <p className="text-[var(--amd-gray-500)] mt-1">Manage your client relationships</p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-[var(--amd-black)] text-white hover:bg-[var(--amd-charcoal)]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Customers', value: customers.length, color: 'bg-blue-500' },
          { label: 'Active', value: customers.length, color: 'bg-green-500' },
          { label: 'Total Revenue', value: `EGP ${customers.reduce((acc, c) => acc + c.totalRevenue, 0).toLocaleString()}`, color: 'bg-amber-500' },
          { label: 'This Month', value: '3', color: 'bg-purple-500' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${stat.color} bg-opacity-10 flex items-center justify-center`}>
                  <div className={`w-3 h-3 rounded-full ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-[var(--amd-gray-500)]">{stat.label}</p>
                  <p className="text-xl font-bold text-[var(--amd-black)]">{stat.value}</p>
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--amd-gray-400)]" />
        <Input
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 max-w-md"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-[var(--amd-black)] flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-[var(--amd-gold)]" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setIsEditDialogOpen(true);
                        setFormData({
                          name: customer.name,
                          email: customer.email,
                          phone: customer.phone ?? '',
                          company: customer.company ?? '',
                          address: customer.address ?? '',
                        });
                      }}
                    >
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setIsEditDialogOpen(true);
                        setFormData({
                          name: customer.name,
                          email: customer.email,
                          phone: customer.phone ?? '',
                          company: customer.company ?? '',
                          address: customer.address ?? '',
                        });
                      }}
                    >
                      Edit Customer
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onNavigateToCreateInvoice?.(customer.id)}
                    >
                      Create Invoice
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <h3 className="font-heading text-lg font-semibold text-[var(--amd-black)] mb-1">
                {customer.name}
              </h3>
              <p className="text-sm text-[var(--amd-gray-500)] mb-4">{customer.industry}</p>

              <div className="space-y-2 mb-4">
                <a
                  href={`mailto:${customer.email}`}
                  className="flex items-center gap-2 text-sm text-[var(--amd-gray-600)]"
                >
                  <Mail className="w-4 h-4" />
                  {customer.email}
                </a>
                {customer.phone && (
                  <a
                    href={`tel:${customer.phone}`}
                    className="flex items-center gap-2 text-sm text-[var(--amd-gray-600)]"
                  >
                    <Phone className="w-4 h-4" />
                    {customer.phone}
                  </a>
                )}
                {customer.address && (
                  <div className="flex items-center gap-2 text-sm text-[var(--amd-gray-600)]">
                    <MapPin className="w-4 h-4" />
                    {customer.address.city}, {customer.address.country}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[var(--amd-gray-200)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[var(--amd-gray-500)]">Total Revenue</p>
                    <p className="text-lg font-bold text-[var(--amd-black)]">
                      EGP {customer.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{customer.projects.length} Projects</Badge>
                    <Badge variant="outline">{customer.invoices.length} Invoices</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Create Customer Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className="bg-[var(--amd-black)] text-white hover:bg-[var(--amd-charcoal)]"
              onClick={async () => {
                const payload = {
                  name: formData.name,
                  email: formData.email,
                  phone: formData.phone || undefined,
                  company: formData.company || undefined,
                  address: formData.address || undefined,
                };

                const res = await fetch(`${API_BASE}/api/customers`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload),
                });

                if (!res.ok) return;
                const created: { id: number; name: string; email: string; phone?: string; company?: string; address?: string } =
                  await res.json();

                const newCustomer = {
                  id: String(created.id),
                  name: created.name,
                  email: created.email,
                  phone: created.phone,
                  company: created.company,
                  address: created.address,
                  industry: created.company ?? '',
                  totalRevenue: 0,
                  projects: [],
                  invoices: [],
                };

                setCustomers((prev) => [...prev, newCustomer]);
                setIsCreateDialogOpen(false);
                setFormData({ name: '', email: '', phone: '', company: '', address: '' });
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit / View Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-company">Company</Label>
                <Input
                  id="edit-company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className="bg-[var(--amd-black)] text-white hover:bg-[var(--amd-charcoal)]"
              onClick={async () => {
                if (!selectedCustomer) return;
                const payload = {
                  name: formData.name,
                  email: formData.email,
                  phone: formData.phone || undefined,
                  company: formData.company || undefined,
                  address: formData.address || undefined,
                };

                const res = await fetch(`${API_BASE}/api/customers/${selectedCustomer.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload),
                });

                if (!res.ok) return;
                const updated = await res.json();

                setCustomers((prev) =>
                  prev.map((c) =>
                    c.id === selectedCustomer.id
                      ? {
                          ...c,
                          name: updated.name,
                          email: updated.email,
                          phone: updated.phone,
                          company: updated.company,
                          address: updated.address,
                          industry: updated.company ?? '',
                        }
                      : c,
                  ),
                );
                setIsEditDialogOpen(false);
                setSelectedCustomer(null);
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Customer Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-[var(--amd-gray-600)]">
              Are you sure you want to delete{' '}
              <strong>{selectedCustomer?.name}</strong>? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!selectedCustomer) return;
                const res = await fetch(`${API_BASE}/api/customers/${selectedCustomer.id}`, {
                  method: 'DELETE',
                });
                if (!res.ok && res.status !== 204) return;

                setCustomers((prev) => prev.filter((c) => c.id !== selectedCustomer.id));
                setIsDeleteDialogOpen(false);
                setSelectedCustomer(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
