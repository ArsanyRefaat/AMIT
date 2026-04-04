import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import {
  Search, Plus, Filter, MoreHorizontal, Phone, Mail, ChevronLeft, ChevronRight,
  Edit2, Trash2, Eye, X, CheckCircle2, Clock, User
} from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import type { Lead, LeadStatus, User as CrmUser } from '@/types';
import { API_BASE } from '@/lib/api';

type StaffUser = { id: string; firstName: string; lastName: string; email: string };

function staffToLeadUser(s: StaffUser): CrmUser {
  return {
    id: s.id,
    email: s.email,
    firstName: s.firstName,
    lastName: s.lastName,
    role: 'sales_rep',
    isActive: true,
    createdAt: new Date().toISOString(),
  };
}
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  new: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  contacted: 'bg-purple-100 text-purple-700 border-purple-200',
  qualified: 'bg-blue-100 text-blue-700 border-blue-200',
  proposal_sent: 'bg-amber-100 text-amber-700 border-amber-200',
  negotiation: 'bg-orange-100 text-orange-700 border-orange-200',
  won: 'bg-green-100 text-green-700 border-green-200',
  lost: 'bg-red-100 text-red-700 border-red-200',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

const pipelineStages: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'new', label: 'New', color: 'bg-indigo-500' },
  { id: 'contacted', label: 'Contacted', color: 'bg-purple-500' },
  { id: 'qualified', label: 'Qualified', color: 'bg-blue-500' },
  { id: 'proposal_sent', label: 'Proposal', color: 'bg-amber-500' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-orange-500' },
  { id: 'won', label: 'Won', color: 'bg-green-500' },
  { id: 'lost', label: 'Lost', color: 'bg-red-500' },
];

type LeadFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  status: LeadStatus;
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  source: string;
  estimatedValue: string;
  notes: string;
};

function LeadForm({
  formData,
  setFormData,
  staffUsers,
}: {
  formData: LeadFormData;
  setFormData: Dispatch<SetStateAction<LeadFormData>>;
  staffUsers: StaffUser[];
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="jobTitle">Job Title</Label>
          <Input
            id="jobTitle"
            value={formData.jobTitle}
            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(v) => setFormData({ ...formData, status: v as LeadStatus })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pipelineStages.map((stage) => (
                <SelectItem key={stage.id} value={stage.id}>
                  {stage.label}
                </SelectItem>
              ))}
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
        <Label htmlFor="assignedTo">Assigned To</Label>
        <Select
          value={formData.assignedTo}
          onValueChange={(v) => setFormData({ ...formData, assignedTo: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select user" />
          </SelectTrigger>
          <SelectContent>
            {staffUsers.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.firstName} {user.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
          <Input
            id="source"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimatedValue">Estimated Value</Label>
          <Input
            id="estimatedValue"
            type="number"
            value={formData.estimatedValue}
            onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>
    </div>
  );
}

type ApiLead = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source?: string;
  stage: number;
  assignedStaffUserId?: string | null;
};

const stageToStatus: Record<number, LeadStatus> = {
  0: 'new',
  1: 'contacted',
  2: 'qualified',
  3: 'proposal_sent',
  4: 'negotiation',
  5: 'won',
  6: 'lost',
};

const statusToStage: Record<LeadStatus, number> = {
  new: 0,
  contacted: 1,
  qualified: 2,
  proposal_sent: 3,
  negotiation: 4,
  won: 5,
  lost: 6,
};

export function Leads() {
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  
  // Form state
  const [formData, setFormData] = useState<LeadFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    status: 'new' as LeadStatus,
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignedTo: '',
    source: '',
    estimatedValue: '',
    notes: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, leadsRes] = await Promise.all([
          fetch(`${API_BASE}/api/users`),
          fetch(`${API_BASE}/api/leads`),
        ]);
        let staffList: StaffUser[] = [];
        if (usersRes.ok) {
          const udata = await usersRes.json();
          if (Array.isArray(udata)) {
            staffList = udata.map((u: { id: string; firstName?: string; lastName?: string; email?: string }) => ({
              id: u.id,
              firstName: u.firstName ?? '',
              lastName: u.lastName ?? '',
              email: u.email ?? '',
            }));
          }
        }
        setStaffUsers(staffList);
        if (!leadsRes.ok) return;
        const data: ApiLead[] = await leadsRes.json();
        const mapped: Lead[] = data.map((l) => ({
          id: String(l.id),
          firstName: l.name,
          lastName: '',
          email: l.email,
          phone: l.phone,
          company: l.company,
          jobTitle: '',
          source: l.source ?? '',
          status: stageToStatus[l.stage] ?? 'new',
          priority: 'medium',
          assignedTo: (() => {
            const su = l.assignedStaffUserId
              ? staffList.find((u) => u.id === l.assignedStaffUserId)
              : undefined;
            return su ? staffToLeadUser(su) : undefined;
          })(),
          notes: [],
          activities: [],
          estimatedValue: undefined,
          tags: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          convertedToCustomerId: undefined,
        }));
        setLeads(mapped);
      } catch {
        // ignore
      }
    };

    void load();
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      firstName: '', lastName: '', email: '', phone: '', company: '', jobTitle: '',
      status: 'new', priority: 'medium', assignedTo: '', source: '', estimatedValue: '', notes: '',
    });
  };

  const handleCreate = async () => {
    const payload = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      phone: formData.phone || undefined,
      company: formData.company || undefined,
      source: formData.source || undefined,
      notes: formData.notes || undefined,
      assignedStaffUserId: formData.assignedTo || undefined,
    };

    try {
      const res = await fetch(`${API_BASE}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        return;
      }

      const created: ApiLead = await res.json();
      const newLead: Lead = {
        id: String(created.id),
        firstName: created.name,
        lastName: '',
        email: created.email,
        phone: created.phone,
        company: created.company,
        jobTitle: '',
        status: 'new',
        priority: formData.priority,
        assignedTo: (() => {
          const su = staffUsers.find((u) => u.id === formData.assignedTo);
          return su ? staffToLeadUser(su) : undefined;
        })(),
        source: created.source ?? '',
        estimatedValue: formData.estimatedValue ? Number(formData.estimatedValue) : undefined,
        notes: [],
        activities: [],
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        convertedToCustomerId: undefined,
      };

      setLeads([...leads, newLead]);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch {
      // ignore for now
    }
  };

  const handleEdit = async () => {
    if (!selectedLead) return;
    const idNum = Number(selectedLead.id);
    try {
      const res = await fetch(`${API_BASE}/api/leads/${idNum}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone || null,
          company: formData.company || null,
          source: formData.source || null,
          stage: statusToStage[formData.status],
          notes: formData.notes || null,
          assignedStaffUserId: formData.assignedTo || null,
        }),
      });

      if (!res.ok) {
        toast.error('Failed to update lead.');
        return;
      }

      setLeads(leads.map(lead =>
        lead.id === selectedLead.id
          ? {
              ...lead,
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              company: formData.company,
              jobTitle: formData.jobTitle,
              status: formData.status,
              priority: formData.priority,
              assignedTo: (() => {
                const su = staffUsers.find((u) => u.id === formData.assignedTo);
                return su ? staffToLeadUser(su) : undefined;
              })(),
              source: formData.source,
              estimatedValue: formData.estimatedValue ? Number(formData.estimatedValue) : undefined,
              updatedAt: new Date().toISOString(),
            }
          : lead
      ));
      setIsEditDialogOpen(false);
      setSelectedLead(null);
      toast.success('Lead updated.');
    } catch {
      toast.error('Failed to update lead.');
    }
  };

  const handleDelete = async () => {
    if (!selectedLead) return;
    const idNum = Number(selectedLead.id);
    try {
      const res = await fetch(`${API_BASE}/api/leads/${idNum}`, {
        method: 'DELETE',
      });
      if (!res.ok && res.status !== 404) {
        return;
      }
      setLeads(leads.filter((lead) => lead.id !== selectedLead.id));
    } catch {
      // keep existing list if API fails
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedLead(null);
    }
  };

  const handleConvert = async () => {
    if (!selectedLead) return;
    const idNum = Number(selectedLead.id);

    const customerPayload = {
      name: `${selectedLead.firstName} ${selectedLead.lastName}`.trim() || selectedLead.company || 'New Customer',
      email: selectedLead.email,
      phone: selectedLead.phone || null,
      company: selectedLead.company || null,
      address: null as string | null,
    };

    try {
      // 1) Create customer from lead
      const customerRes = await fetch(`${API_BASE}/api/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerPayload),
      });
      if (!customerRes.ok) {
        return;
      }

      // 2) Mark lead as Won in backend
      await fetch(`${API_BASE}/api/leads/${idNum}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 5, notes: 'Converted to customer' }),
      });

      // 3) Update local state
      const updatedLeads = leads.map((lead) =>
        lead.id === selectedLead.id
          ? { ...lead, status: 'won' as LeadStatus, updatedAt: new Date().toISOString() }
          : lead
      );
      setLeads(updatedLeads);
    } catch {
      // keep existing state on error
    } finally {
      setIsConvertDialogOpen(false);
      setSelectedLead(null);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    const idNum = Number(leadId);
    try {
      const res = await fetch(`${API_BASE}/api/leads/${idNum}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: statusToStage[newStatus],
          notes: null,
        }),
      });
      if (!res.ok) {
        toast.error('Failed to update lead status.');
        return;
      }
      setLeads(leads.map(lead =>
        lead.id === leadId ? { ...lead, status: newStatus, updatedAt: new Date().toISOString() } : lead
      ));
    } catch {
      toast.error('Failed to update lead status.');
    }
  };

  const openCreateDialog = () => { resetForm(); setIsCreateDialogOpen(true); };
  
  const openEditDialog = (lead: Lead) => {
    setSelectedLead(lead);
    setFormData({
      firstName: lead.firstName, lastName: lead.lastName, email: lead.email,
      phone: lead.phone || '', company: lead.company || '', jobTitle: lead.jobTitle || '',
      status: lead.status, priority: lead.priority, assignedTo: lead.assignedTo?.id || '',
      source: lead.source || '', estimatedValue: lead.estimatedValue?.toString() || '', notes: '',
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (lead: Lead) => { setSelectedLead(lead); setIsViewDialogOpen(true); };
  const openDeleteDialog = (lead: Lead) => { setSelectedLead(lead); setIsDeleteDialogOpen(true); };
  const openConvertDialog = (lead: Lead) => { setSelectedLead(lead); setIsConvertDialogOpen(true); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Lead Management</h1>
          <p className="text-gray-500 mt-1">Manage and track your sales leads</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-black hover:bg-gray-800 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Lead
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: leads.length, color: 'bg-blue-500' },
          { label: 'New This Month', value: leads.filter(l => new Date(l.createdAt).getMonth() === new Date().getMonth()).length, color: 'bg-indigo-500' },
          { label: 'Qualified', value: leads.filter(l => l.status === 'qualified').length, color: 'bg-green-500' },
          { label: 'In Negotiation', value: leads.filter(l => l.status === 'negotiation').length, color: 'bg-amber-500' },
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

      {/* Pipeline */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}
        className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Sales Pipeline</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {pipelineStages.map((stage, index) => {
            const count = leads.filter(l => l.status === stage.id).length;
            return (
              <div key={stage.id} className="flex items-center">
                <div className="flex flex-col items-center min-w-[80px]">
                  <div className={`w-8 h-8 rounded-full ${stage.color} flex items-center justify-center text-white text-sm font-medium`}>
                    {count}
                  </div>
                  <span className="text-xs text-gray-500 mt-1 whitespace-nowrap">{stage.label}</span>
                </div>
                {index < pipelineStages.length - 1 && <div className="w-8 h-0.5 bg-gray-200 mx-1" />}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search leads..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {pipelineStages.map(stage => <SelectItem key={stage.id} value={stage.id}>{stage.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.25 }}>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Lead</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Assigned</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Value</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                            <span className="text-sm font-medium text-[#C9A962]">{lead.firstName[0]}{lead.lastName[0]}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{lead.firstName} {lead.lastName}</p>
                            <p className="text-sm text-gray-500">{lead.company || 'No company'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                            <Mail className="w-3 h-3" /> {lead.email}
                          </a>
                          {lead.phone && (
                            <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                              <Phone className="w-3 h-3" /> {lead.phone}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="outline" className={`capitalize ${statusColors[lead.status]}`}>
                          {lead.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Badge className={`capitalize ${priorityColors[lead.priority]}`}>{lead.priority}</Badge>
                      </td>
                      <td className="px-4 py-4">
                        {lead.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-xs">{lead.assignedTo.firstName[0]}</span>
                            </div>
                            <span className="text-sm">{lead.assignedTo.firstName}</span>
                          </div>
                        ) : <span className="text-sm text-gray-400">Unassigned</span>}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium">{lead.estimatedValue ? `EGP ${lead.estimatedValue.toLocaleString()}` : '-'}</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openViewDialog(lead)}><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(lead)}><Edit2 className="w-4 h-4 mr-2" /> Edit Lead</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openConvertDialog(lead)}><CheckCircle2 className="w-4 h-4 mr-2" /> Convert to Customer</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDeleteDialog(lead)} className="text-red-600"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">Showing {filteredLeads.length} of {leads.length} leads</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled><ChevronLeft className="w-4 h-4" /></Button>
                <Button variant="outline" size="sm" disabled><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add New Lead</DialogTitle></DialogHeader>
          <LeadForm formData={formData} setFormData={setFormData} staffUsers={staffUsers} />
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleCreate} className="bg-black hover:bg-gray-800 text-white">Add Lead</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Lead</DialogTitle></DialogHeader>
          <LeadForm formData={formData} setFormData={setFormData} staffUsers={staffUsers} />
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleEdit} className="bg-black hover:bg-gray-800 text-white">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center">
                  <span className="text-lg font-medium text-[#C9A962]">{selectedLead?.firstName[0]}{selectedLead?.lastName[0]}</span>
                </div>
                <div>
                  <DialogTitle className="text-xl">{selectedLead?.firstName} {selectedLead?.lastName}</DialogTitle>
                  <p className="text-gray-500">{selectedLead?.company} • {selectedLead?.jobTitle}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => { setIsViewDialogOpen(false); openEditDialog(selectedLead!); }}><Edit2 className="w-4 h-4" /></Button>
                <DialogClose asChild><Button variant="ghost" size="icon"><X className="w-4 h-4" /></Button></DialogClose>
              </div>
            </div>
          </DialogHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-gray-500 text-sm">Email</span><p className="font-medium">{selectedLead?.email}</p></div>
                <div><span className="text-gray-500 text-sm">Phone</span><p className="font-medium">{selectedLead?.phone || '-'}</p></div>
                <div><span className="text-gray-500 text-sm">Source</span><p className="font-medium">{selectedLead?.source || '-'}</p></div>
                <div><span className="text-gray-500 text-sm">Estimated Value</span><p className="font-medium">{selectedLead?.estimatedValue ? `EGP ${selectedLead.estimatedValue.toLocaleString()}` : '-'}</p></div>
              </div>
              <div className="flex gap-2">
                <Badge className={statusColors[selectedLead?.status || 'new']}>{selectedLead?.status.replace('_', ' ')}</Badge>
                <Badge className={priorityColors[selectedLead?.priority || 'medium']}>{selectedLead?.priority}</Badge>
              </div>
              <div className="pt-4 border-t">
                <span className="text-gray-500 text-sm">Quick Actions</span>
                <div className="flex gap-2 mt-2">
                  {selectedLead?.status !== 'won' && selectedLead?.status !== 'lost' && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleStatusChange(selectedLead!.id, 'contacted')}>Mark Contacted</Button>
                      <Button size="sm" variant="outline" onClick={() => handleStatusChange(selectedLead!.id, 'qualified')}>Mark Qualified</Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => { setIsViewDialogOpen(false); openConvertDialog(selectedLead!); }}>Convert</Button>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="activity">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><Clock className="w-4 h-4 text-blue-600" /></div>
                  <div>
                    <p className="text-sm font-medium">Lead created</p>
                    <p className="text-xs text-gray-500">{selectedLead?.createdAt && new Date(selectedLead.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center"><User className="w-4 h-4 text-purple-600" /></div>
                  <div>
                    <p className="text-sm font-medium">Assigned to {selectedLead?.assignedTo?.firstName} {selectedLead?.assignedTo?.lastName}</p>
                    <p className="text-xs text-gray-500">{selectedLead?.updatedAt && new Date(selectedLead.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="notes">
              <div className="space-y-4">
                <Textarea placeholder="Add a note..." rows={3} />
                <Button size="sm">Add Note</Button>
                {selectedLead?.notes?.length === 0 && <p className="text-gray-500 text-sm">No notes yet</p>}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Convert Dialog */}
      <Dialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Convert to Customer</DialogTitle></DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">Are you sure you want to convert <strong>{selectedLead?.firstName} {selectedLead?.lastName}</strong> to a customer?</p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">This will:</p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                <li>• Create a new customer record</li>
                <li>• Mark the lead as won</li>
                <li>• Transfer all lead information</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleConvert} className="bg-green-600 hover:bg-green-700 text-white">Convert to Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Lead</DialogTitle></DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">Are you sure you want to delete <strong>{selectedLead?.firstName} {selectedLead?.lastName}</strong>? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleDelete} variant="destructive">Delete Lead</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
