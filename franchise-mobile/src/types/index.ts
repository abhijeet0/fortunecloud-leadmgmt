// ============================
// API Response Types
// ============================

export interface User {
  id: string;
  firebaseUid: string;
  franchiseName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  isVerified: boolean;
  commissionPercentage: number;
  status: 'active' | 'inactive' | 'suspended';
}

// ============================
// Lead Types
// ============================

export type LeadStatus =
  | 'Submitted'
  | 'Lead acknowledged'
  | 'HOT'
  | 'WARM'
  | 'Unspoken'
  | 'COLD'
  | 'Visited'
  | 'Enrolled';

export interface Lead {
  _id: string;
  franchiseId: string;
  studentName: string;
  qualification: string;
  stream: string;
  yearOfPassing?: number;
  city: string;
  phone: string;
  email?: string;
  currentStatus: LeadStatus;
  remarks?: string;
  admissionAmount?: number;
  enrollmentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadStatusHistoryItem {
  _id: string;
  leadId: string;
  status: LeadStatus;
  remarks?: string;
  updatedBy: string;
  updatedAt: string;
  createdAt: string;
}

export interface LeadCreatePayload {
  studentName: string;
  qualification: string;
  stream: string;
  yearOfPassing?: string;
  city: string;
  phone: string;
  email?: string;
}

// ============================
// Commission Types
// ============================

export type CommissionStatus = 'Pending' | 'Approved' | 'Paid';

export interface Commission {
  _id: string;
  leadId: {
    _id: string;
    studentName: string;
    admissionAmount?: number;
  };
  franchiseId: string;
  admissionAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  status: CommissionStatus;
  remarks?: string;
  paidDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================
// API Response Shapes
// ============================

export interface LoginResponse {
  message: string;
  token: string;
  franchise: User;
}

export interface SignupResponse {
  message: string;
  franchiseId: string;
  uid: string;
}

export interface LeadsListResponse {
  leads: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface LeadDetailResponse {
  lead: Lead;
  history: LeadStatusHistoryItem[];
  commission: Commission | null;
}

export interface DashboardResponse {
  franchise: {
    name: string;
    owner: string;
    email: string;
    city: string;
    commissionPercentage: number;
  };
  statistics: {
    totalLeads: number;
    leadsByStatus: Array<{_id: LeadStatus; count: number}>;
    totalCommissionEarned: number;
    paidCommission: number;
    pendingCommission: number;
  };
}

export interface CommissionsResponse {
  total: number;
  pending: number;
  approved: number;
  paid: number;
  commissions: Commission[];
}

export interface LeadsQueryParams {
  status?: LeadStatus;
  searchTerm?: string;
  page?: number;
  limit?: number;
}
