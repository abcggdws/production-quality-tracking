import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

interface BackendPageResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface BackendProductionOrder {
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

interface BackendDefect {
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

interface BackendQualityRecord {
  id: string;
  orderId: string;
  inspectorId: string;
  inspectionDate: string;
  inspectionType: 'incoming' | 'in_process' | 'final';
  result: 'pass' | 'fail' | 'conditional';
  defects?: BackendDefect[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface BackendReworkOrder {
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

interface BackendAlert {
  id: string;
  type: 'quality' | 'production' | 'equipment' | 'safety';
  severity: 'low' | 'medium' | 'high' | 'critical';
  sourceId?: string;
  message: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionOrder {
  id: string;
  order_number: string;
  product_code: string;
  product_name: string;
  planned_quantity: number;
  completed_quantity: number;
  workstation: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  start_date: string;
  due_date: string;
  created_at: string;
  updated_at: string;
}

export interface QualityRecord {
  id: string;
  order_id: string;
  workstation_id: string;
  inspector: string;
  check_point: string;
  result: 'pass' | 'fail' | 'conditional';
  defect_type?: string;
  defect_quantity?: number;
  remarks?: string;
  inspected_at: string;
  created_at: string;
}

export interface DefectEntry {
  id: string;
  record_id: string;
  defect_code: string;
  defect_description: string;
  severity: 'critical' | 'major' | 'minor';
  quantity: number;
  handled: boolean;
  handling_method?: string;
  handled_by?: string;
}

export interface ReworkOrder {
  id: string;
  original_record_id: string;
  order_id: string;
  defect_description: string;
  quantity: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: string;
  completed_quantity: number;
  created_at: string;
  completed_at?: string;
}

export interface QualityAlert {
  id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source_id?: string;
  message: string;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  created_at: string;
}

function unwrapPage<T>(payload: BackendPageResponse<T> | T[]): T[] {
  return Array.isArray(payload) ? payload : payload.data;
}

function mapProductionOrder(order: BackendProductionOrder): ProductionOrder {
  return {
    id: order.id,
    order_number: order.orderNumber,
    product_code: order.batchNumber,
    product_name: order.productName,
    planned_quantity: order.quantity,
    completed_quantity: order.status === 'completed' ? order.quantity : 0,
    workstation: order.operatorId || '-',
    status: order.status,
    start_date: order.startDate || order.createdAt,
    due_date: order.endDate || order.updatedAt,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
  };
}

function mapQualityRecord(record: BackendQualityRecord): QualityRecord {
  const firstDefect = record.defects?.[0];
  return {
    id: record.id,
    order_id: record.orderId,
    workstation_id: '',
    inspector: record.inspectorId,
    check_point: record.inspectionType,
    result: record.result,
    defect_type: firstDefect?.defectType,
    defect_quantity: record.defects?.length || 0,
    remarks: record.notes,
    inspected_at: record.inspectionDate,
    created_at: record.createdAt,
  };
}

function mapDefect(defect: BackendDefect): DefectEntry {
  return {
    id: defect.id,
    record_id: defect.qualityRecordId || '',
    defect_code: defect.defectType,
    defect_description: defect.description,
    severity: defect.severity,
    quantity: 1,
    handled: defect.status === 'resolved' || defect.status === 'closed',
    handled_by: defect.assignedTo,
    handling_method: defect.status,
  };
}

function mapReworkOrder(order: BackendReworkOrder): ReworkOrder {
  return {
    id: order.id,
    original_record_id: order.defectId,
    order_id: order.orderId,
    defect_description: order.notes || order.reworkType,
    quantity: 1,
    status: order.status,
    assigned_to: order.assignedTo,
    completed_quantity: order.status === 'completed' ? 1 : 0,
    created_at: order.createdAt,
    completed_at: order.endTime,
  };
}

function mapAlert(alert: BackendAlert): QualityAlert {
  return {
    id: alert.id,
    alert_type: alert.type,
    severity: alert.severity,
    source_id: alert.sourceId,
    message: alert.message,
    acknowledged: alert.acknowledged,
    acknowledged_by: alert.acknowledgedBy,
    acknowledged_at: alert.acknowledgedAt,
    created_at: alert.createdAt,
  };
}

function toOrderPayload(data: Partial<ProductionOrder>) {
  return {
    orderNumber: data.order_number,
    productName: data.product_name,
    batchNumber: data.product_code,
    quantity: data.planned_quantity,
    operatorId: data.workstation,
    status: data.status,
    startDate: data.start_date,
    endDate: data.due_date,
  };
}

function toQualityPayload(data: Partial<QualityRecord>) {
  return {
    orderId: data.order_id,
    inspectionType: data.check_point,
    result: data.result,
    notes: data.remarks,
  };
}

export const productionApi = {
  getOrders: (status?: string) =>
    api
      .get<BackendPageResponse<BackendProductionOrder>>('/orders', { params: status ? { status } : undefined })
      .then(r => unwrapPage(r.data).map(mapProductionOrder)),

  getOrderById: (id: string) =>
    api.get<BackendProductionOrder>(`/orders/${id}`).then(r => mapProductionOrder(r.data)),

  getOrderMetrics: async (id: string) => {
    const order = await api.get<BackendProductionOrder>(`/orders/${id}`).then(r => r.data);
    return {
      order: mapProductionOrder(order),
      completion_rate: order.status === 'completed' ? 100 : 0,
      defect_rate: 0,
      pass_rate: 100,
    };
  },

  createOrder: (data: Partial<ProductionOrder>) =>
    api.post<BackendProductionOrder>('/orders', toOrderPayload(data)).then(r => mapProductionOrder(r.data)),

  updateOrder: (id: string, data: Partial<ProductionOrder>) =>
    api.put<BackendProductionOrder>(`/orders/${id}`, toOrderPayload(data)).then(r => mapProductionOrder(r.data)),

  deleteOrder: (id: string) => api.delete(`/orders/${id}`),

  getPendingOrders: () => productionApi.getOrders('pending'),

  getInProgressOrders: () => productionApi.getOrders('in_progress'),
};

export const qualityApi = {
  getRecordsByOrder: (orderId: string) =>
    api.get<{ records: BackendQualityRecord[] }>(`/quality-records/order/${orderId}`).then(r => r.data.records.map(mapQualityRecord)),

  getRecordById: (id: string) =>
    api.get<BackendQualityRecord>(`/quality-records/${id}`).then(r => mapQualityRecord(r.data)),

  createRecord: (data: Partial<QualityRecord>) =>
    api.post<BackendQualityRecord>('/quality-records', toQualityPayload(data)).then(r => mapQualityRecord(r.data)),

  getPassRate: async (orderId: string) => {
    const records = await qualityApi.getRecordsByOrder(orderId);
    const passCount = records.filter(record => record.result === 'pass').length;
    const pass_rate = records.length === 0 ? 0 : (passCount / records.length) * 100;
    return { pass_rate };
  },

  getDefectRate: async (orderId: string) => {
    const records = await qualityApi.getRecordsByOrder(orderId);
    const defects = records.reduce((total, record) => total + (record.defect_quantity || 0), 0);
    const defect_rate = records.length === 0 ? 0 : (defects / records.length) * 100;
    return { defect_rate };
  },

  getDefectsByRecord: async (recordId: string) => {
    const record = await api.get<BackendQualityRecord>(`/quality-records/${recordId}`).then(r => r.data);
    return (record.defects || []).map(mapDefect);
  },

  handleDefect: (id: string, handlingMethod: string, handledBy: string) =>
    api.put<BackendDefect>(`/defects/${id}`, { status: handlingMethod, assignedTo: handledBy }).then(r => mapDefect(r.data)),
};

export const reworkApi = {
  getReworkOrders: (status?: string) =>
    api
      .get<BackendPageResponse<BackendReworkOrder>>('/rework-orders', { params: status ? { status } : undefined })
      .then(r => unwrapPage(r.data).map(mapReworkOrder)),

  getReworkOrderById: (id: string) =>
    api.get<BackendReworkOrder>(`/rework-orders/${id}`).then(r => mapReworkOrder(r.data)),

  getReworkOrdersByOrder: async (orderId: string) => {
    const orders = await reworkApi.getReworkOrders();
    return orders.filter(order => order.order_id === orderId);
  },

  createReworkOrder: (data: Partial<ReworkOrder>) =>
    api
      .post<BackendReworkOrder>('/rework-orders', {
        orderId: data.order_id,
        defectId: data.original_record_id,
        reworkType: data.defect_description,
        assignedTo: data.assigned_to,
        notes: data.defect_description,
      })
      .then(r => mapReworkOrder(r.data)),

  updateReworkOrder: async (id: string, data: Partial<ReworkOrder>) => {
    if (data.status === 'in_progress') {
      return api.post<BackendReworkOrder>(`/rework-orders/${id}/start`, {}).then(r => mapReworkOrder(r.data));
    }

    if (data.status === 'completed') {
      return api
        .post<BackendReworkOrder>(`/rework-orders/${id}/complete`, { notes: data.defect_description })
        .then(r => mapReworkOrder(r.data));
    }

    if (data.status === 'cancelled') {
      return api.post<BackendReworkOrder>(`/rework-orders/${id}/cancel`, {}).then(r => mapReworkOrder(r.data));
    }

    return reworkApi.getReworkOrderById(id);
  },

  getPendingReworkOrders: () => reworkApi.getReworkOrders('pending'),
};

export const alertApi = {
  getAlerts: (acknowledged?: boolean) =>
    api
      .get<BackendPageResponse<BackendAlert>>('/alerts', { params: acknowledged !== undefined ? { acknowledged: String(acknowledged) } : undefined })
      .then(r => unwrapPage(r.data).map(mapAlert)),

  getAlertById: (id: string) => api.get<BackendAlert>(`/alerts/${id}`).then(r => mapAlert(r.data)),

  getCriticalAlerts: () => api.get<BackendPageResponse<BackendAlert>>('/alerts', { params: { severity: 'critical' } }).then(r => unwrapPage(r.data).map(mapAlert)),

  getUnacknowledgedCount: async () => {
    const alerts = await alertApi.getAlerts(false);
    return { count: alerts.length };
  },

  acknowledgeAlert: (id: string, _acknowledgedBy: string) =>
    api.post<BackendAlert>(`/alerts/${id}/acknowledge`, {}).then(r => mapAlert(r.data)),
};

export default api;
