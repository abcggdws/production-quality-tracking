import { ProductionOrder } from '../models/index.js';
import { JsonProductionOrderRepository } from '../repositories/index.js';
import { generateId, formatDate, paginate } from '../utils/index.js';

const orderRepo = new JsonProductionOrderRepository();

export interface CreateProductionOrderData {
  orderNumber: string;
  productName: string;
  batchNumber: string;
  quantity: number;
  operatorId?: string;
}

export interface UpdateProductionOrderData {
  productName?: string;
  batchNumber?: string;
  quantity?: number;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  operatorId?: string;
  startDate?: string;
  endDate?: string;
}

export class ProductionOrderService {
  async createOrder(data: CreateProductionOrderData): Promise<{ order: ProductionOrder | null; error?: string }> {
    if (!data.orderNumber || !data.productName || !data.batchNumber || !data.quantity) {
      return { order: null, error: 'Order number, product name, batch number and quantity are required' };
    }

    if (data.quantity <= 0) {
      return { order: null, error: 'Quantity must be positive' };
    }

    if (orderRepo.findByOrderNumber(data.orderNumber)) {
      return { order: null, error: 'Order number already exists' };
    }

    const now = formatDate(new Date());
    const order: ProductionOrder = {
      id: generateId(),
      orderNumber: data.orderNumber,
      productName: data.productName,
      batchNumber: data.batchNumber,
      quantity: data.quantity,
      status: 'pending',
      operatorId: data.operatorId,
      createdAt: now,
      updatedAt: now
    };

    orderRepo.create(order);
    return { order };
  }

  async getOrderById(id: string): Promise<ProductionOrder | null> {
    return orderRepo.findById(id) || null;
  }

  async getOrders(status?: string, page: number = 1, limit: number = 20): Promise<any> {
    let orders = orderRepo.findAll();

    if (status) {
      orders = orderRepo.findByStatus(status);
    }

    return paginate(orders, page, limit);
  }

  async updateOrder(id: string, data: UpdateProductionOrderData): Promise<{ order: ProductionOrder | null; error?: string }> {
    const order = orderRepo.update(id, data);
    return { order: order || null };
  }

  async startOrder(id: string, operatorId: string): Promise<{ order: ProductionOrder | null; error?: string }> {
    const order = orderRepo.findById(id);
    if (!order) {
      return { order: null, error: 'Order not found' };
    }

    if (order.status !== 'pending') {
      return { order: null, error: 'Only pending orders can be started' };
    }

    const updated = orderRepo.update(id, {
      status: 'in_progress',
      operatorId,
      startDate: formatDate(new Date())
    });
    return { order: updated || null };
  }

  async completeOrder(id: string): Promise<{ order: ProductionOrder | null; error?: string }> {
    const order = orderRepo.findById(id);
    if (!order) {
      return { order: null, error: 'Order not found' };
    }

    if (order.status !== 'in_progress') {
      return { order: null, error: 'Only in-progress orders can be completed' };
    }

    const updated = orderRepo.update(id, {
      status: 'completed',
      endDate: formatDate(new Date())
    });
    return { order: updated || null };
  }

  async cancelOrder(id: string): Promise<{ order: ProductionOrder | null; error?: string }> {
    const order = orderRepo.findById(id);
    if (!order) {
      return { order: null, error: 'Order not found' };
    }

    if (order.status === 'completed') {
      return { order: null, error: 'Completed orders cannot be cancelled' };
    }

    const updated = orderRepo.update(id, { status: 'cancelled' });
    return { order: updated || null };
  }

  async deleteOrder(id: string): Promise<boolean> {
    return orderRepo.delete(id);
  }
}