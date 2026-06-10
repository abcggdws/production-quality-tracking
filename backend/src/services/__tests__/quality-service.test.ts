import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { QualityService } from '../quality-service.js';
import { ProductionOrderService } from '../production-order-service.js';

describe('QualityService', () => {
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

  it('creates a quality record', async () => {
    const orderService = new ProductionOrderService();
    const order = await orderService.createOrder({
      orderNumber: 'PO-TEST-QR-001',
      productName: 'Test Product',
      batchNumber: 'B-TEST-001',
      quantity: 100
    });

    const qualityService = new QualityService();
    const result = await qualityService.createRecord({
      orderId: order.order!.id,
      inspectorId: 'inspector-1',
      inspectionType: 'final',
      result: 'pass'
    });

    expect(result.error).toBeUndefined();
    expect(result.record?.orderId).toBe(order.order?.id);
    expect(result.record?.result).toBe('pass');
  });

  it('creates and persists defects with a quality record', async () => {
    const orderService = new ProductionOrderService();
    const order = await orderService.createOrder({
      orderNumber: 'PO-TEST-QR-002',
      productName: 'Defect Product',
      batchNumber: 'B-TEST-002',
      quantity: 100
    });

    const qualityService = new QualityService();
    const result = await qualityService.createRecord({
      orderId: order.order!.id,
      inspectorId: 'inspector-2',
      inspectionType: 'in_process',
      result: 'fail',
      defects: [
        {
          defectType: 'scratch',
          severity: 'major',
          description: 'Surface scratch'
        }
      ]
    });

    expect(result.record?.defects).toHaveLength(1);
    expect(result.record?.defects?.[0].defectType).toBe('scratch');
  });

  it('gets records by order', async () => {
    const orderService = new ProductionOrderService();
    const order = await orderService.createOrder({
      orderNumber: 'PO-TEST-QR-003',
      productName: 'Lookup Product',
      batchNumber: 'B-TEST-003',
      quantity: 100
    });

    const qualityService = new QualityService();

    await qualityService.createRecord({
      orderId: order.order!.id,
      inspectorId: 'inspector-3',
      inspectionType: 'in_process',
      result: 'pass'
    });

    await qualityService.createRecord({
      orderId: order.order!.id,
      inspectorId: 'inspector-3',
      inspectionType: 'final',
      result: 'pass'
    });

    const records = await qualityService.getRecordsByOrder(order.order!.id);
    expect(records).toHaveLength(2);
  });
});
