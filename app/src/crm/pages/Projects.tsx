import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { Search, Plus, MoreHorizontal, Calendar, Users, CheckCircle2, FolderKanban, Edit2, Trash2, Eye, X, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { users } from '@/data/mockData';
import type { Expense, Invoice, Project, ProjectStatus } from '@/types';
import { API_BASE } from '@/lib/api';

const statusColors: Record<string, string> = {
  planning: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  review: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  on_hold: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

type ProjectTaskSummary = {
  id: string;
  title: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
};

type ApiTaskForProject = {
  id: number;
  projectId: number;
  title: string;
  status: number;
};

type ProjectFormData = {
  name: string;
  description: string;
  customer: string;
  status: ProjectStatus;
  priority: 'low' | 'medium' | 'high';
  projectManager: string;
  startDate: string;
  endDate: string;
  budget: string;
};

function toCustomerReference(id: string, name: string): Project['customer'] {
  const nowIso = new Date().toISOString();
  return {
    id,
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
}

function ProjectForm({
  formData,
  setFormData,
  customers,
}: {
  formData: ProjectFormData;
  setFormData: Dispatch<SetStateAction<ProjectFormData>>;
  customers: { id: string; name: string }[];
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Project Name *</Label>
        <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="customer">Customer *</Label>
        <Select value={formData.customer} onValueChange={(v) => setFormData({ ...formData, customer: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(v) => setFormData({ ...formData, status: v as ProjectStatus })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(v) =>
              setFormData({ ...formData, priority: v as 'low' | 'medium' | 'high' })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="projectManager">Project Manager</Label>
        <Select
          value={formData.projectManager}
          onValueChange={(v) => setFormData({ ...formData, projectManager: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select manager" />
          </SelectTrigger>
          <SelectContent>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.firstName} {u.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="budget">Budget (EGP)</Label>
        <Input
          id="budget"
          type="number"
          value={formData.budget}
          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
        />
      </div>
    </div>
  );
}

export function Projects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectTasks, setProjectTasks] = useState<Record<string, ProjectTaskSummary[]>>({});
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Form state
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    customer: '',
    status: 'planning' as ProjectStatus,
    priority: 'medium' as 'low' | 'medium' | 'high',
    projectManager: '',
    startDate: '',
    endDate: '',
    budget: '',
  });

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/customers`);
        if (!res.ok) return;
        const data: { id: number; name: string }[] = await res.json();
        setCustomers(data.map(c => ({ id: String(c.id), name: c.name })));
      } catch {
        // ignore
      }
    };

    const loadProjects = async () => {
      try {
        const [projRes, taskRes] = await Promise.all([
          fetch(`${API_BASE}/api/projects`),
          fetch(`${API_BASE}/api/tasks`),
        ]);

        if (!projRes.ok) return;

        const projData: {
          id: number;
          customerId: number;
          customerName: string;
          name: string;
          description?: string;
          budget: number;
          progressPercent?: number;
          startDateUtc?: string;
          endDateUtc?: string;
          showOnPublicWebsite?: boolean;
          websiteCategory?: string | null;
        }[] = await projRes.json();

        let tasksMap: Record<string, ProjectTaskSummary[]> = {};

        if (taskRes.ok) {
          const taskData: ApiTaskForProject[] = await taskRes.json();
          taskData.forEach((t) => {
            const projectId = String(t.projectId);
            const status =
              t.status === 3
                ? 'completed'
                : t.status === 1
                ? 'in_progress'
                : t.status === 2
                ? 'review'
                : 'todo';

            if (!tasksMap[projectId]) {
              tasksMap[projectId] = [];
            }

            tasksMap[projectId].push({
              id: String(t.id),
              title: t.title,
              status,
              priority: 'medium',
            });
          });
        }

        const mapped: Project[] = projData.map((p) => {
          const id = String(p.id);
          const tasksForProject = tasksMap[id] ?? [];
          const totalTasks = tasksForProject.length;
          const completedTasks = tasksForProject.filter((t) => t.status === 'completed').length;
          const taskBasedProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
          const progress =
            typeof p.progressPercent === 'number' && p.progressPercent > 0
              ? Math.round(p.progressPercent)
              : taskBasedProgress;

          return {
            id,
            name: p.name,
            description: p.description ?? '',
            customer: toCustomerReference(String(p.customerId), p.customerName),
            status: 'planning',
            priority: 'medium',
            startDate: p.startDateUtc,
            endDate: p.endDateUtc,
            budget: p.budget,
            actualCost: 0,
            progress,
            showOnPublicWebsite: p.showOnPublicWebsite ?? false,
            websiteCategory: p.websiteCategory ?? null,
            teamMembers: [],
            tasks: tasksForProject.map((t) => t.id),
            invoices: [],
            expenses: [],
            deliverables: [],
            notes: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        });

        setProjects(mapped);
        setProjectTasks(tasksMap);
      } catch {
        // ignore
      }
    };

    loadCustomers();
    loadProjects();
  }, []);

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '', description: '', customer: '', status: 'planning', priority: 'medium',
      projectManager: '', startDate: '', endDate: '', budget: '',
    });
  };

  const handleCreateAsync = async () => {
    const payload = {
      customerId: Number(formData.customer || '0'),
      name: formData.name,
      description: formData.description || undefined,
      budget: Number(formData.budget || '0'),
      startDateUtc: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
      endDateUtc: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      showOnPublicWebsite: false,
      websiteCategory: null as string | null,
    };

    const res = await fetch(`${API_BASE}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return;
    const created: {
      id: number;
      customerId: number;
      customerName: string;
      name: string;
      description?: string;
      budget: number;
      progressPercent: number;
      startDateUtc?: string;
      endDateUtc?: string;
      showOnPublicWebsite?: boolean;
      websiteCategory?: string | null;
    } = await res.json();

    const newProject: Project = {
      id: String(created.id),
      name: created.name,
      description: created.description ?? '',
      customer: toCustomerReference(String(created.customerId), created.customerName),
      status: 'planning',
      priority: formData.priority,
      projectManager: users.find(u => u.id === formData.projectManager),
      startDate: created.startDateUtc,
      endDate: created.endDateUtc,
      budget: created.budget,
      actualCost: 0,
      progress: Number(created.progressPercent ?? 0),
      showOnPublicWebsite: created.showOnPublicWebsite ?? false,
      websiteCategory: created.websiteCategory ?? null,
      teamMembers: [],
      tasks: [],
      invoices: [],
      expenses: [],
      deliverables: [],
      notes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjects([...projects, newProject]);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEdit = async () => {
    if (!selectedProject) return;
    try {
      const payload = {
        customerId: Number(formData.customer || '0'),
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        budget: Number(formData.budget || '0'),
        startDateUtc: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDateUtc: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        showOnPublicWebsite: selectedProject.showOnPublicWebsite ?? false,
        websiteCategory: selectedProject.websiteCategory ?? null,
      };

      const res = await fetch(`${API_BASE}/api/projects/${selectedProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      if (!res.ok) {
        let msg = text || 'Failed to update project';
        try {
          const j = JSON.parse(text);
          if (j?.error) msg = j.error;
        } catch {
          // use text
        }
        toast.error(msg);
        return;
      }

      const updated: {
        id: number;
        customerId: number;
        customerName: string;
        name: string;
        description?: string;
        budget: number;
        progressPercent?: number;
        startDateUtc?: string;
        endDateUtc?: string;
        showOnPublicWebsite?: boolean;
        websiteCategory?: string | null;
      } = JSON.parse(text);

      setProjects((prev) => prev.map((project) =>
        project.id === selectedProject.id
          ? {
              ...project,
              name: updated.name,
              description: updated.description ?? '',
              customer: toCustomerReference(String(updated.customerId), updated.customerName),
              status: formData.status,
              priority: formData.priority,
              projectManager: users.find(u => u.id === formData.projectManager),
              startDate: updated.startDateUtc,
              endDate: updated.endDateUtc,
              budget: updated.budget,
              progress: Number(updated.progressPercent ?? project.progress ?? 0),
              showOnPublicWebsite: updated.showOnPublicWebsite ?? project.showOnPublicWebsite,
              websiteCategory: updated.websiteCategory ?? project.websiteCategory,
              updatedAt: new Date().toISOString(),
            }
          : project
      ));

      setIsEditDialogOpen(false);
      setSelectedProject(null);
      toast.success('Project updated.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update project');
    }
  };

  const handleDelete = async () => {
    if (!selectedProject) return;
    try {
      const res = await fetch(`${API_BASE}/api/projects/${selectedProject.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const text = await res.text();
        let msg = text || 'Failed to delete project';
        try {
          const j = JSON.parse(text);
          if (j?.error) msg = j.error;
        } catch {
          // use text
        }
        toast.error(msg);
        return;
      }

      setProjects(projects.filter(project => project.id !== selectedProject.id));
      setIsDeleteDialogOpen(false);
      setSelectedProject(null);
      toast.success('Project deleted.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete project');
    }
  };

  const openCreateDialog = () => { resetForm(); setIsCreateDialogOpen(true); };
  
  const openEditDialog = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name, description: project.description, customer: project.customer.id,
      status: project.status, priority: project.priority,
      projectManager: project.projectManager?.id || '',
      startDate: project.startDate || '', endDate: project.endDate || '',
      budget: project.budget?.toString() || '',
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (project: Project) => { setSelectedProject(project); setIsViewDialogOpen(true); };
  const openDeleteDialog = (project: Project) => { setSelectedProject(project); setIsDeleteDialogOpen(true); };

  const getProjectTasks = (projectId: string) => projectTasks[projectId] ?? [];
  const getProjectInvoices = (_projectId: string): Invoice[] => [];
  const getProjectExpenses = (_projectId: string): Expense[] => [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">Manage client projects and deliverables</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-black hover:bg-gray-800 text-white">
          <Plus className="w-4 h-4 mr-2" /> New Project
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', value: projects.length, color: 'bg-blue-500' },
          { label: 'In Progress', value: projects.filter(p => p.status === 'in_progress').length, color: 'bg-amber-500' },
          { label: 'Completed', value: projects.filter(p => p.status === 'completed').length, color: 'bg-green-500' },
          { label: 'On Hold', value: projects.filter(p => p.status === 'on_hold').length, color: 'bg-red-500' },
        ].map(stat => (
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

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}
        className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Search projects..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 max-w-md" />
      </motion.div>

      {/* Projects Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openViewDialog(project)}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center">
                  <FolderKanban className="w-6 h-6 text-[#C9A962]" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[project.status]}>{project.status.replace('_', ' ')}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openViewDialog(project); }}><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(project); }}><Edit2 className="w-4 h-4 mr-2" /> Edit Project</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}><CheckCircle2 className="w-4 h-4 mr-2" /> Add Task</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}><Receipt className="w-4 h-4 mr-2" /> Create Invoice</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openDeleteDialog(project); }} className="text-red-600"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{project.customer.name}</p>
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not started'}
                  {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString()}`}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  {project.teamMembers.length} team members
                </div>
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Progress</span>
                  <span className="text-sm font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
              <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">{project.tasks.length} tasks</span>
                </div>
                {project.budget && (
                  <div className="text-sm">
                    <span className="text-gray-500">Budget: </span>
                    <span className="font-medium">EGP {project.budget.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create New Project</DialogTitle></DialogHeader>
          <ProjectForm formData={formData} setFormData={setFormData} customers={customers} />
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleCreateAsync} className="bg-black hover:bg-gray-800 text-white">Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Project</DialogTitle></DialogHeader>
          <ProjectForm formData={formData} setFormData={setFormData} customers={customers} />
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleEdit} className="bg-black hover:bg-gray-800 text-white">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-xl">{selectedProject?.name}</DialogTitle>
                <p className="text-gray-500">{selectedProject?.customer.name}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => { setIsViewDialogOpen(false); openEditDialog(selectedProject!); }}><Edit2 className="w-4 h-4" /></Button>
                <DialogClose asChild><Button variant="ghost" size="icon"><X className="w-4 h-4" /></Button></DialogClose>
              </div>
            </div>
          </DialogHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-gray-500 text-sm">Status</span><Badge className={statusColors[selectedProject?.status || 'planning']}>{selectedProject?.status.replace('_', ' ')}</Badge></div>
                <div><span className="text-gray-500 text-sm">Priority</span><Badge className={priorityColors[selectedProject?.priority || 'medium']}>{selectedProject?.priority}</Badge></div>
                <div><span className="text-gray-500 text-sm">Project Manager</span><p className="font-medium">{selectedProject?.projectManager ? `${selectedProject.projectManager.firstName} ${selectedProject.projectManager.lastName}` : 'Not assigned'}</p></div>
                <div><span className="text-gray-500 text-sm">Budget</span><p className="font-medium">{selectedProject?.budget ? `EGP ${selectedProject.budget.toLocaleString()}` : 'Not set'}</p></div>
                <div><span className="text-gray-500 text-sm">Start Date</span><p className="font-medium">{selectedProject?.startDate ? new Date(selectedProject.startDate).toLocaleDateString() : 'Not set'}</p></div>
                <div><span className="text-gray-500 text-sm">End Date</span><p className="font-medium">{selectedProject?.endDate ? new Date(selectedProject.endDate).toLocaleDateString() : 'Not set'}</p></div>
              </div>
              <div><span className="text-gray-500 text-sm">Description</span><p className="text-gray-700">{selectedProject?.description}</p></div>
              <div>
                <span className="text-gray-500 text-sm">Progress</span>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={selectedProject?.progress} className="flex-1 h-2" />
                  <span className="text-sm font-medium">{selectedProject?.progress}%</span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="tasks">
              <div className="space-y-2">
                {getProjectTasks(selectedProject?.id || '').length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No tasks for this project</p>
                ) : (
                  getProjectTasks(selectedProject?.id || '').map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-gray-500">{task.status} • {task.priority}</p>
                      </div>
                      <Badge>{task.status}</Badge>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            <TabsContent value="invoices">
              <div className="space-y-2">
                {getProjectInvoices(selectedProject?.id || '').length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No invoices for this project</p>
                ) : (
                  getProjectInvoices(selectedProject?.id || '').map(invoice => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-gray-500">{new Date(invoice.issueDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">EGP {invoice.total.toLocaleString()}</p>
                        <Badge className={invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>{invoice.status}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            <TabsContent value="expenses">
              <div className="space-y-2">
                {getProjectExpenses(selectedProject?.id || '').length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No expenses for this project</p>
                ) : (
                  getProjectExpenses(selectedProject?.id || '').map(expense => (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-gray-500">{expense.category} • {new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                      <p className="font-medium text-red-600">EGP {expense.amount.toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Project</DialogTitle></DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">Are you sure you want to delete <strong>{selectedProject?.name}</strong>? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleDelete} variant="destructive">Delete Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
