import { ReworkOrder } from '../models/index.js';
import { JsonReworkOrderRepository, JsonDefectRepository } from '../repositories/index.js';
import { generateId, formatDate, paginate } from '../utils/index.js';

const reworkRepo = new JsonReworkOrderRepository();
const defectRepo = new JsonDefectRepository();

export interface CreateReworkOrderData {
  orderId: string;
  defectId: string;
  reworkType: string;
  assignedTo: string;
  notes?: string;
}

export class ReworkService {
  async createOrder(data: CreateReworkOrderData): Promise<{ order: ReworkOrder | null; error?: string }> {
    if (!data.orderId || !data.defectId || !data.reworkType || !data.assignedTo) {
      return { order: null, error: 'Order ID, defect ID, rework type and assigned user are required' };
    }

    const defect = defectRepo.findById(data.defectId);
    if (!defect) {
      return { order: null, error: 'Defect not found' };
    }

    const now = formatDate(new Date());
    const order: ReworkOrder = {
      id: generateId(),
      orderId: data.orderId,
      defectId: data.defectId,
      reworkType: data.reworkType,
      assignedTo: data.assignedTo,
      status: 'pending',
      notes: data.notes,
      createdAt: now,
      updatedAt: now
    };

    reworkRepo.create(order);
    defectRepo.update(data.defectId, { status: 'in_progress' });

    return { order };
  }

  async getOrderById(id: string): Promise<ReworkOrder | null> {
    return reworkRepo.findById(id) || null;
  }

  async getOrders(status?: string, assignedTo?: string, page: number = 1, limit: number = 20): Promise<any> {
    let orders = reworkRepo.findAll();

    if (status) {
      orders = reworkRepo.findByStatus(status);
    }

    if (assignedTo) {
      orders = orders.filter(o => o.assignedTo === assignedTo);
    }

    return paginate(orders, page, limit);
  }

  async startOrder(id: string): Promise<{ order: ReworkOrder | null; error?: string }> {
    const order = reworkRepo.findById(id);
    if (!order) {
      return { order: null, error: 'Rework order not found' };
    }

    if (order.status !== 'pending') {
      return { order: null, error: 'Only pending rework orders can be started' };
    }

    const updated = reworkRepo.update(id, {
      status: 'in_progress',
      startTime: formatDate(new Date())
    });
    return { order: updated || null };
  }

  async completeOrder(id: string, notes?: string): Promise<{ order: ReworkOrder | null; error?: string }> {
    const order = reworkRepo.findById(id);
    if (!order) {
      return { order: null, error: 'Rework order not found' };
    }

    if (order.status !== 'in_progress') {
      return { order: null, error: 'Only in-progress rework orders can be completed' };
    }

    const updated = reworkRepo.update(id, {
      status: 'completed',
      endTime: formatDate(new Date()),
      notes: notes || order.notes
    });

    defectRepo.update(order.defectId, { status: 'resolved', resolvedAt: formatDate(new Date()) });

    return { order: updated || null };
  }

  async cancelOrder(id: string): Promise<{ order: ReworkOrder | null; error?: string }> {
    const order = reworkRepo.findById(id);
    if (!order) {
      return { order: null, error: 'Rework order not found' };
    }

    if (order.status === 'completed') {
      return { order: null, error: 'Completed rework orders cannot be cancelled' };
    }

    const updated = reworkRepo.update(id, { status: 'cancelled' });
    return { order: updated || null };
  }

  async deleteOrder(id: string): Promise<boolean> {
    return reworkRepo.delete(id);
  }
}