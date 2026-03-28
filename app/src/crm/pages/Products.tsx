import { useState, useEffect } from 'react';
import { Search, Plus, MoreHorizontal, Package, Edit, Trash2 } from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import type { ProductService } from '@/types';
import { API_BASE } from '@/lib/api';

type ApiProduct = {
  id: number;
  name: string;
  description: string | null;
  category: string;
  price: number;
  unit: string;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

const UNIT_OPTIONS = ['project', 'month', 'hour', 'year'];

export function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<ProductService[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductService | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    unit: 'project',
    isActive: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products`);
        if (!res.ok) return;
        const raw = await res.json();
        const data: ApiProduct[] = Array.isArray(raw) ? raw : (raw?.value ?? []);
        setProducts(data.map(p => ({
          id: String(p.id),
          name: p.name,
          description: p.description ?? '',
          category: p.category,
          price: Number(p.price),
          unit: p.unit,
          isActive: p.isActive,
          createdAt: p.createdAtUtc,
        })));
      } catch {
        toast.error('Failed to load products');
      }
    };
    load();
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '',
      unit: 'project',
      isActive: true,
    });
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a name.');
      return;
    }
    const price = Number(formData.price);
    if (Number.isNaN(price) || price < 0) {
      toast.error('Please enter a valid price.');
      return;
    }
    setIsCreating(true);
    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          category: formData.category.trim() || 'General',
          price,
          unit: formData.unit,
          isActive: formData.isActive,
        }),
      });
      const text = await res.text();
      if (!res.ok) {
        let msg = text || `Failed to create product (${res.status})`;
        try {
          const j = JSON.parse(text);
          if (j?.error) msg = j.error;
        } catch { /* use msg */ }
        toast.error(msg);
        return;
      }
      const created: ApiProduct = JSON.parse(text);
      setProducts(prev => [...prev, {
        id: String(created.id),
        name: created.name,
        description: created.description ?? '',
        category: created.category,
        price: Number(created.price),
        unit: created.unit,
        isActive: created.isActive,
        createdAt: created.createdAtUtc,
      }]);
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Service added.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create product');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedProduct) return;
    if (!formData.name.trim()) {
      toast.error('Please enter a name.');
      return;
    }
    const price = Number(formData.price);
    if (Number.isNaN(price) || price < 0) {
      toast.error('Please enter a valid price.');
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          category: formData.category.trim() || 'General',
          price,
          unit: formData.unit,
          isActive: formData.isActive,
        }),
      });
      const text = await res.text();
      if (!res.ok) {
        let msg = text || 'Failed to update product';
        try {
          const j = JSON.parse(text);
          if (j?.error) msg = j.error;
        } catch { /* use msg */ }
        toast.error(msg);
        return;
      }
      const updated: ApiProduct = JSON.parse(text);
      setProducts(prev => prev.map(p => p.id === selectedProduct.id ? {
        id: String(updated.id),
        name: updated.name,
        description: updated.description ?? '',
        category: updated.category,
        price: Number(updated.price),
        unit: updated.unit,
        isActive: updated.isActive,
        createdAt: p.createdAt,
      } : p));
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      toast.success('Service updated.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      const res = await fetch(`${API_BASE}/api/products/${selectedProduct.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const text = await res.text();
        let msg = text || 'Failed to delete';
        try {
          const j = JSON.parse(text);
          if (j?.error) msg = j.error;
        } catch { /* use msg */ }
        toast.error(msg);
        return;
      }
      setProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      toast.success('Service deleted.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (product: ProductService) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description ?? '',
      category: product.category,
      price: product.price.toString(),
      unit: product.unit,
      isActive: product.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (product: ProductService) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const avgPrice = products.length ? Math.round(products.reduce((acc, p) => acc + p.price, 0) / products.length) : 0;

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
            Products & Services
          </h1>
          <p className="text-[var(--amd-gray-500)] mt-1">Manage your service offerings and pricing</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-[var(--amd-black)] text-white hover:bg-[var(--amd-charcoal)]">
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Services', value: products.length, color: 'bg-blue-500' },
          { label: 'Active', value: products.filter((p) => p.isActive).length, color: 'bg-green-500' },
          { label: 'Categories', value: new Set(products.map((p) => p.category)).size || 0, color: 'bg-purple-500' },
          { label: 'Avg. Price', value: `EGP ${avgPrice.toLocaleString()}`, color: 'bg-amber-500' },
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
          placeholder="Search services..."
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
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-[var(--amd-black)] flex items-center justify-center">
                  <Package className="w-6 h-6 text-[var(--amd-gold)]" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(product)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDeleteDialog(product)} className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <h3 className="font-heading text-lg font-semibold text-[var(--amd-black)] mb-2">
                {product.name}
              </h3>
              <p className="text-sm text-[var(--amd-gray-500)] mb-4">{product.description}</p>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--amd-gray-200)]">
                <div>
                  <p className="text-xs text-[var(--amd-gray-500)]">Price</p>
                  <p className="text-xl font-bold text-[var(--amd-black)]">
                    EGP {product.price.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--amd-gray-500)]">Unit</p>
                  <p className="text-sm font-medium text-[var(--amd-black)]">{product.unit}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add New Service</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Brand Strategy Package" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Service description" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Branding" />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select value={formData.unit} onValueChange={(v) => setFormData({ ...formData, unit: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent className="z-[9999]">{UNIT_OPTIONS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Price (EGP) *</Label>
              <Input type="number" min={0} value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="0" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="create-active" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded" />
              <Label htmlFor="create-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleCreate} disabled={isCreating} className="bg-[var(--amd-black)] text-white">{isCreating ? 'Adding...' : 'Add Service'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Service</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Brand Strategy Package" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Service description" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Branding" />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select value={formData.unit} onValueChange={(v) => setFormData({ ...formData, unit: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent className="z-[9999]">{UNIT_OPTIONS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Price (EGP) *</Label>
              <Input type="number" min={0} value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="0" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="edit-active" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded" />
              <Label htmlFor="edit-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleEdit} disabled={isSaving} className="bg-[var(--amd-black)] text-white">{isSaving ? 'Saving...' : 'Save Changes'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Service</DialogTitle></DialogHeader>
          <p className="text-[var(--amd-gray-600)] py-4">Are you sure you want to delete <strong>{selectedProduct?.name}</strong>? This cannot be undone.</p>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleDelete} variant="destructive">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
