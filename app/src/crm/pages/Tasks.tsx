import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { Search, Plus, MoreHorizontal, Calendar, Clock, Flag, CheckCircle2, Circle, User as UserIcon, Folder, X, Edit2, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import type { Task, TaskStatus, TaskPriority, User } from '@/types';
import { API_BASE } from '@/lib/api';

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const statusColumns: { id: TaskStatus; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'todo', label: 'To Do', icon: Circle, color: 'text-gray-500' },
  { id: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-blue-500' },
  { id: 'review', label: 'Review', icon: Flag, color: 'text-amber-500' },
  { id: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-green-500' },
];

const UNASSIGNED_VALUE = '__unassigned__';

type ApiTask = {
  id: number;
  projectId: number;
  title: string;
  description?: string;
  status: number;
  assignedToUserId?: string;
  dueDateUtc?: string;
};

const statusFromInt = (value: number): TaskStatus => {
  switch (value) {
    case 0: return 'todo';
    case 1: return 'in_progress';
    case 2: return 'review';
    case 3: return 'completed';
    default: return 'todo';
  }
};

const statusToInt = (status: TaskStatus): number => {
  switch (status) {
    case 'todo': return 0;
    case 'in_progress': return 1;
    case 'review': return 2;
    case 'completed': return 3;
    default: return 0;
  }
};

const toTaskProjectReference = (projectId: string, projectName: string): Task['project'] => {
  const nowIso = new Date().toISOString();
  return {
    id: projectId,
    name: projectName,
    description: '',
    customer: {
      id: '0',
      name: '',
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
    },
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

type TaskFormData = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string;
  project: string;
  dueDate: string;
  estimatedHours: string;
};

function TaskForm({
  formData,
  setFormData,
  users,
  projects,
}: {
  formData: TaskFormData;
  setFormData: Dispatch<SetStateAction<TaskFormData>>;
  users: any[];
  projects: { id: string; name: string }[];
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Task Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter task title"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter task description"
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(v) => setFormData({ ...formData, status: v as TaskStatus })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(v) => setFormData({ ...formData, priority: v as TaskPriority })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="project">Project</Label>
          <Select
            value={formData.project}
            onValueChange={(v) => setFormData({ ...formData, project: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="assignedTo">Assigned To</Label>
          <Select
            value={formData.assignedTo}
            onValueChange={(v) => setFormData({ ...formData, assignedTo: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select user" />
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
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimatedHours">Estimated Hours</Label>
          <Input
            id="estimatedHours"
            type="number"
            value={formData.estimatedHours}
            onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
            placeholder="e.g. 4"
          />
        </div>
      </div>
    </div>
  );
}

export function Tasks() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [, setUpdatingStatusId] = useState<string | null>(null);
  const [assignToUserId, setAssignToUserId] = useState('');
  
  // Form state
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    assignedTo: '',
    project: '',
    dueDate: '',
    estimatedHours: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [userRes, projRes, taskRes] = await Promise.all([
          fetch(`${API_BASE}/api/users`),
          fetch(`${API_BASE}/api/projects`),
          fetch(`${API_BASE}/api/tasks`),
        ]);

        const apiUsers: User[] = userRes.ok ? await userRes.json() : [];
        setUsers(apiUsers);

        if (!projRes.ok || !taskRes.ok) return;

        const projData: { id: number; name: string }[] = await projRes.json();
        const projectList = projData.map(p => ({ id: String(p.id), name: p.name }));
        setProjects(projectList);

        const taskData: ApiTask[] = await taskRes.json();
        const mapped: Task[] = taskData.map(t => {
          const proj = projectList.find(p => p.id === String(t.projectId));
          const assigned = t.assignedToUserId ? apiUsers.find(u => u.id === t.assignedToUserId) : undefined;
          const createdBy = apiUsers[0];
          return {
            id: String(t.id),
            title: t.title,
            description: t.description,
            status: statusFromInt(t.status),
            priority: 'medium',
            assignedTo: assigned,
            project: proj ? toTaskProjectReference(proj.id, proj.name) : undefined,
            dueDate: t.dueDateUtc,
            estimatedHours: undefined,
            tags: [],
            comments: [],
            createdBy: createdBy ?? {
              id: 'system',
              email: 'system@local',
              firstName: 'System',
              lastName: 'User',
              isActive: true,
              createdAt: new Date().toISOString(),
              role: 'super_admin',
            },
            createdAt: t.dueDateUtc ?? new Date().toISOString(),
            updatedAt: t.dueDateUtc ?? new Date().toISOString(),
          };
        });
        setTasks(mapped);
      } catch {
        // ignore
      }
    };

    load();
  }, []);

  const projectsForSelect = useMemo(() => projects, [projects]);

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.project?.name && task.project.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.assignedTo?.firstName && task.assignedTo.firstName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getTasksByStatus = (status: TaskStatus) => filteredTasks.filter((t) => t.status === status);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      assignedTo: '',
      project: '',
      dueDate: '',
      estimatedHours: '',
    });
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a task title.');
      return;
    }
    if (!formData.project) {
      toast.error('Please select a project.');
      return;
    }

    const payload = {
      projectId: Number(formData.project),
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      status: statusToInt(formData.status),
      assignedToUserId: formData.assignedTo || null,
      dueDateUtc: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
    };

    setIsCreating(true);
    try {
      const res = await fetch(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        let msg = errText || 'Failed to create task';
        try {
          const j = JSON.parse(errText);
          if (j?.error) msg = j.error;
        } catch {
          /* use errText */
        }
        toast.error(msg);
        return;
      }

      const created: ApiTask = await res.json();
      const newTask: Task = {
        id: String(created.id),
        title: created.title,
        description: created.description,
        status: statusFromInt(created.status),
        priority: formData.priority,
        assignedTo: created.assignedToUserId ? users.find(u => u.id === created.assignedToUserId) : undefined,
        project: (() => {
          const p = projects.find((x) => x.id === String(created.projectId));
          return p ? toTaskProjectReference(p.id, p.name) : undefined;
        })(),
        dueDate: created.dueDateUtc,
        estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : undefined,
        tags: [],
        comments: [],
        createdBy: users[0] ?? {
          id: 'system',
          email: 'system@local',
          firstName: 'System',
          lastName: 'User',
          isActive: true,
          createdAt: new Date().toISOString(),
          role: 'super_admin',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setTasks([...tasks, newTask]);
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Task created.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create task');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedTask) return;
    if (!formData.title.trim()) {
      toast.error('Please enter a task title.');
      return;
    }
    if (!formData.project) {
      toast.error('Please select a project.');
      return;
    }

    const payload = {
      projectId: Number(formData.project),
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      status: statusToInt(formData.status),
      assignedToUserId: formData.assignedTo || null,
      dueDateUtc: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
    };

    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        let msg = errText || 'Failed to update task';
        try {
          const j = JSON.parse(errText);
          if (j?.error) msg = j.error;
        } catch { /* use errText */ }
        toast.error(msg);
        return;
      }

      const updated: ApiTask = await res.json();
      const updatedTasks = tasks.map(task =>
        task.id === selectedTask.id
          ? {
              ...task,
              title: updated.title,
              description: updated.description ?? undefined,
              status: statusFromInt(updated.status),
              project: (() => {
                const p = projects.find((x) => x.id === String(updated.projectId));
                return p ? toTaskProjectReference(p.id, p.name) : task.project;
              })(),
              assignedTo: updated.assignedToUserId ? users.find(u => u.id === updated.assignedToUserId) : undefined,
              dueDate: updated.dueDateUtc ?? undefined,
              updatedAt: new Date().toISOString(),
            }
          : task
      );
      setTasks(updatedTasks);
      setIsEditDialogOpen(false);
      setSelectedTask(null);
      toast.success('Task updated.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update task');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTask) return;

    try {
      const res = await fetch(`${API_BASE}/api/tasks/${selectedTask.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errText = await res.text();
        let msg = errText || 'Failed to delete task';
        try {
          const j = JSON.parse(errText);
          if (j?.error) msg = j.error;
        } catch {
          // use errText
        }
        toast.error(msg);
        return;
      }

      setTasks(tasks.filter(task => task.id !== selectedTask.id));
      setIsDeleteDialogOpen(false);
      setSelectedTask(null);
      toast.success('Task deleted.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const projectId = task.project?.id ? Number(task.project.id) : 0;
    if (!projectId) {
      toast.error('Task has no project; cannot update status.');
      return;
    }

    const payload = {
      projectId,
      title: task.title,
      description: task.description ?? undefined,
      status: statusToInt(newStatus),
      assignedToUserId: task.assignedTo?.id || null,
      dueDateUtc: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
    };

    setUpdatingStatusId(taskId);
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let msg = text || `Failed to update status (${res.status})`;
      try {
        const j = JSON.parse(text);
        if (j?.error) msg = j.error;
      } catch { /* use msg */ }

      if (!res.ok) {
        toast.error(msg);
        if (res.status === 404) {
          // Refetch tasks so list is in sync (task may have been deleted)
          const taskRes = await fetch(`${API_BASE}/api/tasks`);
          if (taskRes.ok) {
            const taskData: ApiTask[] = await taskRes.json();
            const projectList = projects;
            const mapped: Task[] = taskData.map(t => {
              const proj = projectList.find(p => p.id === String(t.projectId));
              return {
                id: String(t.id),
                title: t.title,
                description: t.description,
                status: statusFromInt(t.status),
                priority: 'medium',
                assignedTo: t.assignedToUserId ? users.find(u => u.id === t.assignedToUserId) : undefined,
                project: proj ? { id: proj.id, name: proj.name } as any : undefined,
                dueDate: t.dueDateUtc,
                estimatedHours: undefined,
                tags: [],
                comments: [],
                createdBy: users[0] ?? {
                  id: 'system',
                  email: 'system@local',
                  firstName: 'System',
                  lastName: 'User',
                  isActive: true,
                  createdAt: new Date().toISOString(),
                  role: 'super_admin',
                },
                createdAt: t.dueDateUtc ?? new Date().toISOString(),
                updatedAt: t.dueDateUtc ?? new Date().toISOString(),
              };
            });
            setTasks(mapped);
          }
        }
        return;
      }

      const updated: ApiTask = JSON.parse(text);
      setTasks(prev => prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              status: statusFromInt(updated.status),
              assignedTo: updated.assignedToUserId ? users.find(u => u.id === updated.assignedToUserId) : undefined,
              updatedAt: new Date().toISOString()
            }
          : t
      ));
      setSelectedTask(prev => prev?.id === taskId
        ? {
            ...prev,
            status: statusFromInt(updated.status),
            assignedTo: updated.assignedToUserId ? users.find(u => u.id === updated.assignedToUserId) : undefined,
            updatedAt: new Date().toISOString()
          }
        : prev);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (task: Task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo?.id || '',
      project: task.project?.id || '',
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      estimatedHours: task.estimatedHours?.toString() || '',
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteDialogOpen(true);
  };

  const openAssignDialog = (task: Task) => {
    setSelectedTask(task);
    setAssignToUserId(task.assignedTo?.id || UNASSIGNED_VALUE);
    setIsAssignDialogOpen(true);
  };

  const handleQuickAssign = async () => {
    if (!selectedTask) return;
    const projectId = selectedTask.project?.id ? Number(selectedTask.project.id) : 0;
    if (!projectId) {
      toast.error('Task has no project; cannot update assignee.');
      return;
    }

    const payload = {
      projectId,
      title: selectedTask.title,
      description: selectedTask.description ?? undefined,
      status: statusToInt(selectedTask.status),
      assignedToUserId: assignToUserId === UNASSIGNED_VALUE ? null : assignToUserId,
      dueDateUtc: selectedTask.dueDate ? new Date(selectedTask.dueDate).toISOString() : undefined,
    };

    setIsAssigning(true);
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        let msg = errText || 'Failed to assign task';
        try {
          const j = JSON.parse(errText);
          if (j?.error) msg = j.error;
        } catch {
          /* use errText */
        }
        toast.error(msg);
        return;
      }

      const updated: ApiTask = await res.json();
      const assignedUser = updated.assignedToUserId ? users.find(u => u.id === updated.assignedToUserId) : undefined;
      setTasks(prev => prev.map(t =>
        t.id === selectedTask.id
          ? {
              ...t,
              assignedTo: assignedUser,
              updatedAt: new Date().toISOString(),
            }
          : t
      ));
      setSelectedTask(prev => prev?.id === selectedTask.id
        ? {
            ...prev,
            assignedTo: assignedUser,
            updatedAt: new Date().toISOString(),
          }
        : prev);
      setIsAssignDialogOpen(false);
      toast.success(assignedUser ? 'Task assigned.' : 'Task unassigned.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to assign task');
    } finally {
      setIsAssigning(false);
    }
  };

  const openViewDialog = (task: Task) => {
    setSelectedTask(task);
    setIsViewDialogOpen(true);
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => openViewDialog(task)}>
      <div className="flex items-start justify-between mb-3">
        <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(task); }}>
              <Edit2 className="w-4 h-4 mr-2" /> Edit Task
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openAssignDialog(task); }}>
              <UserIcon className="w-4 h-4 mr-2" /> Assign To
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
              <MessageSquare className="w-4 h-4 mr-2" /> Add Comment
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openDeleteDialog(task); }} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
      {task.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="space-y-2 mb-3">
        {task.project && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Folder className="w-3 h-3" />
            {task.project.name}
          </div>
        )}
        {task.dueDate && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        {task.assignedTo ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
              <span className="text-xs text-[#C9A962]">
                {task.assignedTo.firstName.charAt(0)}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {task.assignedTo.firstName}
            </span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">Unassigned</span>
        )}
        {task.estimatedHours && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {task.estimatedHours}h
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500 mt-1">Manage and track team tasks</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-black hover:bg-gray-800 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Tasks', value: tasks.length, color: 'bg-blue-500' },
          { label: 'To Do', value: tasks.filter((t) => t.status === 'todo').length, color: 'bg-gray-500' },
          { label: 'In Progress', value: tasks.filter((t) => t.status === 'in_progress').length, color: 'bg-amber-500' },
          { label: 'Completed', value: tasks.filter((t) => t.status === 'completed').length, color: 'bg-green-500' },
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

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 max-w-md"
        />
      </motion.div>

      {/* Kanban Board */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="grid lg:grid-cols-4 gap-6"
      >
        {statusColumns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          const Icon = column.icon;
          return (
            <div key={column.id}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${column.color}`} />
                  {column.label}
                </h3>
                <Badge variant="outline">{columnTasks.length}</Badge>
              </div>
              <div className="space-y-3">
                {columnTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <TaskForm formData={formData} setFormData={setFormData} users={users} projects={projectsForSelect} />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleCreate}
              disabled={isCreating}
              className="bg-black hover:bg-gray-800 text-white"
            >
              {isCreating ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <TaskForm formData={formData} setFormData={setFormData} users={users} projects={projectsForSelect} />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleEdit} disabled={isSaving} className="bg-black hover:bg-gray-800 text-white">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <DialogTitle className="text-xl">{selectedTask?.title}</DialogTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => { setIsViewDialogOpen(false); openEditDialog(selectedTask!); }}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <DialogClose asChild>
                  <Button variant="ghost" size="icon">
                    <X className="w-4 h-4" />
                  </Button>
                </DialogClose>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTask?.description && (
              <p className="text-gray-600">{selectedTask.description}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <Badge className={priorityColors[selectedTask?.priority || 'medium']}>
                {selectedTask?.priority}
              </Badge>
              <Badge variant="outline">{selectedTask?.status.replace('_', ' ')}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {selectedTask?.project && (
                <div>
                  <span className="text-gray-500">Project:</span>
                  <p className="font-medium">{selectedTask.project.name}</p>
                </div>
              )}
              {selectedTask?.assignedTo && (
                <div>
                  <span className="text-gray-500">Assigned To:</span>
                  <p className="font-medium">{selectedTask.assignedTo.firstName} {selectedTask.assignedTo.lastName}</p>
                </div>
              )}
              {selectedTask?.dueDate && (
                <div>
                  <span className="text-gray-500">Due Date:</span>
                  <p className="font-medium">{new Date(selectedTask.dueDate).toLocaleDateString()}</p>
                </div>
              )}
              {selectedTask?.estimatedHours && (
                <div>
                  <span className="text-gray-500">Estimated Hours:</span>
                  <p className="font-medium">{selectedTask.estimatedHours}h</p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <div className="flex gap-2 w-full">
              {selectedTask && selectedTask.status !== 'completed' && (
                <Button 
                  onClick={() => {
                    handleStatusChange(selectedTask.id, 'completed');
                    setIsViewDialogOpen(false);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
              )}
              <Button 
                onClick={() => { setIsViewDialogOpen(false); openDeleteDialog(selectedTask!); }}
                variant="destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Assign Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="quickAssignTo">Assigned To</Label>
            <Select value={assignToUserId} onValueChange={setAssignToUserId}>
              <SelectTrigger id="quickAssignTo">
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNASSIGNED_VALUE}>Unassigned</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.firstName} {u.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleQuickAssign}
              disabled={isAssigning}
              className="bg-black hover:bg-gray-800 text-white"
            >
              {isAssigning ? 'Saving...' : 'Save Assignment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to delete <strong>{selectedTask?.title}</strong>? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleDelete} variant="destructive">
              Delete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
