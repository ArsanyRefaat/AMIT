import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Shield, Users, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { API_BASE } from '@/lib/api';
import type { Permission, Role } from '@/types';

export function RolesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>(['leads', 'customers']);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedPermissions: [] as string[],
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [permRes, roleRes] = await Promise.all([
          fetch(`${API_BASE}/api/permissions`),
          fetch(`${API_BASE}/api/roles`),
        ]);

        const permData = permRes.ok ? await permRes.json() : [];
        const roleData = roleRes.ok ? await roleRes.json() : [];

        setPermissions(permData);
        setRoles(roleData);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const modules = Array.from(new Set(permissions.map(p => p.module)));

  const getPermissionsByModule = (module: string) => {
    return permissions.filter(p => p.module === module);
  };

  const toggleModule = (module: string) => {
    setExpandedModules(prev =>
      prev.includes(module) ? prev.filter(m => m !== module) : [...prev, module]
    );
  };

  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPermissions: prev.selectedPermissions.includes(permissionId)
        ? prev.selectedPermissions.filter(id => id !== permissionId)
        : [...prev.selectedPermissions, permissionId],
    }));
  };

  const selectAllInModule = (module: string, select: boolean) => {
    const modulePermissions = getPermissionsByModule(module).map(p => p.id);
    setFormData(prev => ({
      ...prev,
      selectedPermissions: select
        ? [...new Set([...prev.selectedPermissions, ...modulePermissions])]
        : prev.selectedPermissions.filter(id => !modulePermissions.includes(id)),
    }));
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      permissions: formData.selectedPermissions,
    };

    const res = await fetch(`${API_BASE}/api/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      // In a full app we would show a toast here
      return;
    }

    const created: Role = await res.json();
    setRoles(prev => [...prev, created]);
    setIsCreateDialogOpen(false);
    setFormData({ name: '', description: '', selectedPermissions: [] });
  };

  const handleEdit = async () => {
    if (!selectedRole) return;
    if (!formData.name.trim()) return;

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      permissions: formData.selectedPermissions,
    };

    const res = await fetch(`${API_BASE}/api/roles/${selectedRole.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return;
    }

    const updated: Role = await res.json();
    setRoles(prev => prev.map(r => (r.id === updated.id ? updated : r)));
    setIsEditDialogOpen(false);
    setSelectedRole(null);
  };

  const handleDelete = async () => {
    if (!selectedRole) return;

    const res = await fetch(`${API_BASE}/api/roles/${selectedRole.id}`, {
      method: 'DELETE',
    });

    if (!res.ok && res.status !== 204) {
      return;
    }

    setRoles(prev => prev.filter(r => r.id !== selectedRole.id));
    setIsDeleteDialogOpen(false);
    setSelectedRole(null);
  };

  const openEditDialog = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      selectedPermissions: role.permissions,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  const getModuleLabel = (module: string) => {
    return module.charAt(0).toUpperCase() + module.slice(1).replace('_', ' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-gray-500">Loading roles & permissions…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Roles & Permissions</h1>
          <p className="text-gray-500 mt-1">Manage user roles and access permissions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-black hover:bg-gray-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Marketing Manager"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the role's responsibilities"
                />
              </div>
              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="border rounded-lg divide-y">
                  {modules.map((module) => {
                    const modulePermissions = getPermissionsByModule(module);
                    const allSelected = modulePermissions.every(p =>
                      formData.selectedPermissions.includes(p.id)
                    );
                    const someSelected = modulePermissions.some(p =>
                      formData.selectedPermissions.includes(p.id)
                    );
                    const isExpanded = expandedModules.includes(module);

                    return (
                      <div key={module}>
                        <button
                          onClick={() => toggleModule(module)}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={allSelected}
                              onCheckedChange={(checked) => {
                                selectAllInModule(module, checked as boolean);
                              }}
                              className={someSelected && !allSelected ? 'indeterminate' : ''}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="font-medium">{getModuleLabel(module)}</span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-4 pl-12 space-y-2">
                            {modulePermissions.map((permission) => (
                              <div
                                key={permission.id}
                                className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded"
                              >
                                <Checkbox
                                  checked={formData.selectedPermissions.includes(permission.id)}
                                  onCheckedChange={() => togglePermission(permission.id)}
                                />
                                <div>
                                  <div className="font-medium text-sm">{permission.name}</div>
                                  <div className="text-xs text-gray-500">{permission.description}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreate} className="bg-black hover:bg-gray-800 text-white">
                Create Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#C9A962]" />
              </div>
              <div>
                <div className="text-2xl font-bold">{roles.length}</div>
                <div className="text-sm text-gray-500">Total Roles</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#C9A962]/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#C9A962]" />
              </div>
              <div>
                <div className="text-2xl font-bold">{roles.reduce((acc, r) => acc + r.userCount, 0)}</div>
                <div className="text-sm text-gray-500">Total Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{permissions.length}</div>
                <div className="text-sm text-gray-500">Permissions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roles Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>All Roles</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="font-medium">{role.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {role.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{role.permissions.length}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{role.userCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {role.isSystem ? (
                      <Badge className="bg-blue-100 text-blue-700">System</Badge>
                    ) : (
                      <Badge variant="outline">Custom</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(role)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      {!role.isSystem && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(role)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Role Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <Label>Permissions</Label>
              <div className="border rounded-lg divide-y">
                {modules.map((module) => {
                  const modulePermissions = getPermissionsByModule(module);
                  const allSelected = modulePermissions.every(p =>
                    formData.selectedPermissions.includes(p.id)
                  );
                  const isExpanded = expandedModules.includes(module);

                  return (
                    <div key={module}>
                      <button
                        onClick={() => toggleModule(module)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={allSelected}
                            onCheckedChange={(checked) => {
                              selectAllInModule(module, checked as boolean);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="font-medium">{getModuleLabel(module)}</span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 pl-12 space-y-2">
                          {modulePermissions.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded"
                            >
                              <Checkbox
                                checked={formData.selectedPermissions.includes(permission.id)}
                                onCheckedChange={() => togglePermission(permission.id)}
                              />
                              <div>
                                <div className="font-medium text-sm">{permission.name}</div>
                                <div className="text-xs text-gray-500">{permission.description}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleEdit} className="bg-black hover:bg-gray-800 text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to delete the role <strong>{selectedRole?.name}</strong>? This action cannot be undone.
            </p>
            {selectedRole && selectedRole.userCount > 0 && (
              <div className="mt-4 p-4 bg-amber-50 rounded-lg flex items-start gap-3">
                <div className="text-amber-600 mt-0.5">⚠</div>
                <p className="text-sm text-amber-700">
                  This role is assigned to {selectedRole.userCount} user(s). You must reassign them before deleting.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleDelete}
              variant="destructive"
              disabled={selectedRole ? selectedRole.userCount > 0 : false}
            >
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
