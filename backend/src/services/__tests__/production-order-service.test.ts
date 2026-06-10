import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { ProductionOrderService } from '../production-order-service.js';

describe('ProductionOrderService', () => {
  const testDataDir = path.join(process.cwd(), 'data-test');

  beforeEach(() => {
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
    process.env.DATA_DIR = testDataDir;
  });

  afterEach(() => {
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
    delete process.env.DATA_DIR;
  });

  it('creates a new production order', async () => {
    const service = new ProductionOrderService();
    const result = await service.createOrder({
      orderNumber: 'PO-TEST-001',
      productName: 'Test Product',
      batchNumber: 'B-TEST-001',
      quantity: 100
    });

    expect(result.error).toBeUndefined();
    expect(result.order).toBeDefined();
    expect(result.order?.orderNumber).toBe('PO-TEST-001');
    expect(result.order?.status).toBe('pending');
  });

  it('returns paginated orders', async () => {
    const service = new ProductionOrderService();

    await service.createOrder({
      orderNumber: 'PO-TEST-001',
      productName: 'Test Product 1',
      batchNumber: 'B-TEST-001',
      quantity: 100
    });

    await service.createOrder({
      orderNumber: 'PO-TEST-002',
      productName: 'Test Product 2',
      batchNumber: 'B-TEST-002',
      quantity: 200
    });

    const orders = await service.getOrders(undefined, 1, 10);
    expect(orders.total).toBe(2);
    expect(orders.data).toHaveLength(2);
  });

  it('finds order by id', async () => {
    const service = new ProductionOrderService();
    const created = await service.createOrder({
      orderNumber: 'PO-TEST-003',
      productName: 'Lookup Product',
      batchNumber: 'B-TEST-003',
      quantity: 50
    });

    const found = await service.getOrderById(created.order!.id);
    expect(found?.id).toBe(created.order?.id);
    expect(found?.orderNumber).toBe('PO-TEST-003');
  });

  it('starts an order and updates status', async () => {
    const service = new ProductionOrderService();
    const created = await service.createOrder({
      orderNumber: 'PO-TEST-004',
      productName: 'Startable Product',
      batchNumber: 'B-TEST-004',
      quantity: 60
    });

    const started = await service.startOrder(created.order!.id, 'operator-1');
    expect(started.error).toBeUndefined();
    expect(started.order?.status).toBe('in_progress');
    expect(started.order?.operatorId).toBe('operator-1');
  });

  it('returns null when order is not found', async () => {
    const service = new ProductionOrderService();
    const found = await service.getOrderById('non-existent-id');
    expect(found).toBeNull();
  });
});
