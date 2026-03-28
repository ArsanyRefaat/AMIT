// AMT Solutions - Type Definitions

// ==================== WEBSITE TYPES ====================

export interface Service {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  icon: string;
  image?: string;
  order: number;
  isActive: boolean;
}

export interface PortfolioItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  client: string;
  shortDescription: string;
  problem: string;
  solution: string;
  deliverables: string[];
  results: {
    metric: string;
    value: string;
  }[];
  images: string[];
  featuredImage: string;
  testimonial?: Testimonial;
  date: string;
  isFeatured: boolean;
  isActive: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  position: string;
  company: string;
  image?: string;
  content: string;
  rating: number;
  project?: string;
  isActive: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio: string;
  image?: string;
  linkedin?: string;
  email?: string;
  order: number;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: TeamMember;
  category: string;
  tags: string[];
  featuredImage?: string;
  publishedAt: string;
  readTime: number;
  isPublished: boolean;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  message: string;
}

export interface ProposalFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  budget: string;
  services: string[];
  timeline: string;
  message: string;
}

// ==================== CRM TYPES ====================

export type UserRole = 'super_admin' | 'admin' | 'sales_manager' | 'sales_rep' | 'project_manager' | 'project_member' | 'finance_manager' | 'finance_staff' | 'content_manager';

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: 'leads' | 'customers' | 'projects' | 'tasks' | 'invoices' | 'expenses' | 'reports' | 'users' | 'roles' | 'settings' | 'website';
  action: 'view' | 'create' | 'edit' | 'delete' | 'export' | 'approve';
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Permission IDs
  isSystem: boolean;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  roleId?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  phone?: string;
  department?: string;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiation' | 'won' | 'lost';

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  source: string;
  status: LeadStatus;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: User;
  notes: Note[];
  activities: Activity[];
  estimatedValue?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  convertedToCustomerId?: string;
}

export interface Note {
  id: string;
  content: string;
  createdBy: User;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'status_change' | 'task';
  description: string;
  createdBy: User;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  industry?: string;
  address?: Address;
  logo?: string;
  contacts: ContactPerson[];
  tags: string[];
  notes: Note[];
  activities: Activity[];
  projects: string[];
  invoices: string[];
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
  originalLeadId?: string;
  assignedTo?: User;
}

export interface ContactPerson {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position?: string;
  isPrimary: boolean;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface ProductService {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  cost?: number;
  unit: string;
  isActive: boolean;
  createdAt: string;
}

export type ProjectStatus = 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold' | 'cancelled';

export interface Project {
  id: string;
  name: string;
  description: string;
  customer: Customer;
  status: ProjectStatus;
  priority: 'low' | 'medium' | 'high';
  startDate?: string;
  endDate?: string;
  budget?: number;
  actualCost?: number;
  teamMembers: User[];
  projectManager?: User;
  tasks: string[];
  invoices: string[];
  expenses: string[];
  deliverables: Deliverable[];
  notes: Note[];
  progress: number;
  createdAt: string;
  updatedAt: string;
  /** When true, project can appear on the public Work / portfolio pages */
  showOnPublicWebsite?: boolean;
  /** Label on the public site (e.g. Branding). Optional. */
  websiteCategory?: string | null;
}

export interface Deliverable {
  id: string;
  name: string;
  description?: string;
  dueDate?: string;
  completedAt?: string;
  status: 'pending' | 'in_progress' | 'completed';
  attachments?: string[];
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: User;
  project?: Project;
  customer?: Customer;
  lead?: Lead;
  dueDate?: string;
  completedAt?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  comments: Comment[];
  attachments?: string[];
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  createdBy: User;
  createdAt: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: Customer;
  project?: Project;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount?: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  notes?: string;
  terms?: string;
  paymentInstructions?: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  paidAt?: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  product?: ProductService;
}

export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  vendor?: string;
  project?: Project;
  customer?: Customer;
  receipt?: string;
  notes?: string;
  createdBy: User;
  createdAt: string;
}

// ==================== DASHBOARD TYPES ====================

export interface DashboardStats {
  totalLeads: number;
  newLeadsThisMonth: number;
  totalCustomers: number;
  totalRevenue: number;
  revenueThisMonth: number;
  outstandingInvoices: number;
  overdueInvoices: number;
  activeProjects: number;
  completedProjectsThisMonth: number;
  pendingTasks: number;
  tasksDueToday: number;
  totalExpensesThisMonth: number;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface ReportFilter {
  dateRange: {
    start: string;
    end: string;
  };
  customer?: string;
  project?: string;
  user?: string;
  status?: string;
}

// ==================== WEBSITE CMS TYPES ====================

export interface HomepageSection {
  id: string;
  type: 'hero' | 'services' | 'portfolio' | 'testimonials' | 'cta' | 'stats';
  title?: string;
  subtitle?: string;
  content?: string;
  image?: string;
  ctaText?: string;
  ctaLink?: string;
  isActive: boolean;
  order: number;
}

export interface WebsiteSettings {
  companyName: string;
  tagline?: string;
  logo?: string;
  favicon?: string;
  primaryColor: string;
  accentColor: string;
  contactEmail: string;
  contactPhone?: string;
  address?: Address;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };
  seo: {
    title?: string;
    description?: string;
    keywords?: string;
  };
}
