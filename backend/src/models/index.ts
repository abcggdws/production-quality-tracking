export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'operator' | 'supervisor' | 'manager' | 'admin';
  department?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  productName: string;
  batchNumber: string;
  quantity: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  startDate?: string;
  endDate?: string;
  operatorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QualityRecord {
  id: string;
  orderId: string;
  inspectorId: string;
  inspectionDate: string;
  inspectionType: 'incoming' | 'in_process' | 'final';
  result: 'pass' | 'fail' | 'conditional';
  defects?: Defect[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Defect {
  id: string;
  orderId: string;
  qualityRecordId?: string;
  defectType: string;
  severity: 'minor' | 'major' | 'critical';
  description: string;
  location?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReworkOrder {
  id: string;
  orderId: string;
  defectId: string;
  reworkType: string;
  assignedTo: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  startTime?: string;
  endTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  type: 'quality' | 'production' | 'equipment' | 'safety';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  sourceId?: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthToken {
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}