export type Role = 'SYSTEM_ADMIN' | 'BD_MANAGER' | 'BD_EXECUTIVE';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: Role;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface College {
  id: string;
  collegeId: string;
  name: string;
  placementOfficerName: string;
  placementOfficerEmail: string;
  placementOfficerPhone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  studentCount: number;
  notes?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdById: string;
  createdBy?: {
    id: string;
    fullName: string;
    email: string;
  };
  proposals?: Proposal[];
  _count?: {
    proposals?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PlanModule {
  id: string;
  planId: string;
  name: string;
  hours: number;
  displayOrder: number;
}

export interface Plan {
  id: string;
  name: string;
  code: string;
  description: string;
  totalHours: number;
  pricingModel: 'HOURLY' | 'FIXED_PLAN' | 'CUSTOM';
  fixedPrice?: number | null;
  displayOrder: number;
  status: 'ACTIVE' | 'INACTIVE';
  modules: PlanModule[];
  createdAt: string;
}

export interface TrainingProgram {
  id: string;
  name: string;
  code: string;
  description: string;
  category: string;
  defaultHours: number;
  pricingType: 'PER_STUDENT' | 'PER_HOUR' | 'FIXED';
  defaultPrice?: number;
  defaultHourlyRate?: number;
  defaultPerStudentRate?: number;
  modules?: string[] | string;
  isActive?: boolean;
  status?: 'ACTIVE' | 'INACTIVE';
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomProgramSelection {
  programId?: string;
  programName?: string;
  name?: string;
  code?: string;
  hours: number;
  pricingType: 'PER_STUDENT' | 'PER_HOUR' | 'FIXED';
  rate?: number;
  unitRate?: number;
  calculatedCost?: number;
}

export interface CustomItem {
  id?: string;
  proposalId?: string;
  name: string;
  description?: string;
  quantity: number;
  pricingType: 'PER_STUDENT' | 'PER_HOUR' | 'FIXED' | 'FLAT' | 'PER_UNIT';
  unitPrice: number;
  calculatedCost?: number;
  totalCost?: number;
}

export interface Addon {
  id: string;
  name: string;
  code: string;
  description: string;
  pricingType: 'PER_STUDENT' | 'PER_HOUR' | 'FIXED';
  price: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export type ProposalStatus =
  | 'DRAFT'
  | 'SHARED'
  | 'VIEWED'
  | 'COLLEGE_MODIFIED'
  | 'PENDING_MANAGER_APPROVAL'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'ARCHIVED';

export interface ProposalAddon {
  id: string;
  proposalId: string;
  addonId: string;
  nameSnapshot: string;
  pricingTypeSnapshot: 'PER_STUDENT' | 'PER_HOUR' | 'FIXED';
  priceSnapshot: number;
  calculatedCost: number;
  addon?: Addon;
}

export interface ProposalVersion {
  id: string;
  proposalId: string;
  versionNumber: number;
  snapshotData: string;
  changedByRole: string;
  changeSummary: string;
  calculatedTotal: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId?: string | null;
  role?: string | null;
  title: string;
  message: string;
  link?: string | null;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface Proposal {
  id: string;
  proposalId: string;
  proposalNumber?: string;
  publicToken: string;
  tokenExpiresAt: string;
  collegeId: string;
  college: College;
  planId: string;
  planType?: string;
  plan: Plan;
  createdById: string;
  createdBy?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
  };
  approvedById?: string | null;
  approvedBy?: {
    id: string;
    fullName: string;
    email: string;
  } | null;

  customProgramsData?: string | null;
  customPrograms?: CustomProgramSelection[];

  studentCount: number;
  minStudents: number;
  maxStudents: number;
  totalHours: number;
  hourlyRateSnapshot: number;
  pricingModelSnapshot: string;
  baseTrainingCost: number;
  addonsTotalCost: number;
  customItemsTotalCost: number;
  subtotal: number;
  discountValue: number;
  discountType: 'FIXED' | 'PERCENTAGE';
  taxableAmount: number;
  costPerStudentBeforeGst?: number;
  gstRate: number;
  gstAmount: number;
  gstPerStudent?: number;
  grandTotal: number;
  finalCostPerStudent?: number;
  finalTotal: number;
  currency: string;

  status: ProposalStatus;
  currentVersion: number;
  submittedAt?: string | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
  notes?: string | null;
  collegeNotes?: string | null;
  isDeleted?: boolean;
  deletedAt?: string | null;
  deletedById?: string | null;
  archiveReason?: string | null;
  shareLink?: string;
  qrCodeDataUrl?: string;

  addons: ProposalAddon[];
  customItems?: CustomItem[];
  versions?: ProposalVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface SystemSetting {
  key: string;
  value: string;
  description: string;
  valueType: 'NUMBER' | 'STRING' | 'JSON' | 'BOOLEAN';
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  user?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  } | null;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: string | null;
  newValue?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  timestamp: string;
}

export interface PricingCalculationResult {
  planId: string;
  planName: string;
  planCode: string;
  totalHours: number;
  studentCount: number;
  pricingModel: string;
  effectiveHourlyRate: number;
  baseTrainingCost: number;
  customPrograms?: CustomProgramSelection[];
  addons: Array<{
    addonId: string;
    name: string;
    code: string;
    pricingType: string;
    price: number;
    calculatedCost: number;
  }>;
  addonsTotalCost: number;
  customItems?: CustomItem[];
  customItemsTotalCost: number;
  subtotal: number;
  discountType: 'FIXED' | 'PERCENTAGE';
  discountValue: number;
  discountAmount: number;
  taxableAmount: number;
  costPerStudentBeforeGst: number;
  gstRate: number;
  gstAmount: number;
  gstPerStudent: number;
  grandTotal: number;
  finalCostPerStudent: number;
  finalTotal: number;
  currency: string;
}

export interface DashboardMetrics {
  metrics: {
    totalColleges: number;
    totalProposals: number;
    activeProposals: number;
    pendingApproval: number;
    approvedProposals: number;
    totalProposalVolume: number;
    pendingApprovalVolume: number;
    approvedDealsVolume: number;
    totalPipelineValue: number;
  };
  statusDistribution: Record<ProposalStatus, number>;
  planDistribution: Array<{
    planId: string;
    planName: string;
    count: number;
    totalValue: number;
  }>;
  recentProposals: Proposal[];
  recentAuditLogs: AuditLog[];
}
