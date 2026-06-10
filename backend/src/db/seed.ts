import fs from 'fs';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const now = '2026-06-10T08:00:00Z';

const seedData = {
  production_orders: [
    {
      id: 'order-001',
      orderNumber: 'PO-2026-0001',
      productName: '精密齿轮组件',
      batchNumber: 'B-2026-001',
      quantity: 100,
      status: 'completed',
      operatorId: 'user-002',
      startDate: '2026-06-01T08:00:00Z',
      endDate: '2026-06-01T16:00:00Z',
      createdAt: '2026-06-01T08:00:00Z',
      updatedAt: '2026-06-01T16:00:00Z'
    },
    {
      id: 'order-002',
      orderNumber: 'PO-2026-0002',
      productName: '轴承套件',
      batchNumber: 'B-2026-002',
      quantity: 200,
      status: 'in_progress',
      operatorId: 'user-003',
      startDate: '2026-06-02T08:00:00Z',
      createdAt: '2026-06-02T08:00:00Z',
      updatedAt: '2026-06-02T12:00:00Z'
    },
    {
      id: 'order-003',
      orderNumber: 'PO-2026-0003',
      productName: '电机外壳',
      batchNumber: 'B-2026-003',
      quantity: 150,
      status: 'pending',
      createdAt: '2026-06-03T08:00:00Z',
      updatedAt: '2026-06-03T08:00:00Z'
    }
  ],
  quality_records: [
    {
      id: 'qr-001',
      orderId: 'order-001',
      inspectorId: 'user-002',
      inspectionDate: '2026-06-01T15:30:00Z',
      inspectionType: 'final',
      result: 'pass',
      defects: [],
      notes: '全部检验合格',
      createdAt: '2026-06-01T15:30:00Z',
      updatedAt: '2026-06-01T15:30:00Z'
    },
    {
      id: 'qr-002',
      orderId: 'order-002',
      inspectorId: 'user-003',
      inspectionDate: '2026-06-02T10:00:00Z',
      inspectionType: 'in_process',
      result: 'conditional',
      defects: [
        {
          id: 'defect-001',
          orderId: 'order-002',
          qualityRecordId: 'qr-002',
          defectType: 'scratch',
          severity: 'minor',
          description: '表面轻微划痕',
          location: '齿轮表面',
          status: 'resolved',
          assignedTo: 'user-003',
          resolvedAt: '2026-06-02T11:30:00Z',
          createdAt: '2026-06-02T10:05:00Z',
          updatedAt: '2026-06-02T11:30:00Z'
        }
      ],
      notes: '半成品检验发现轻微表面问题，已返工',
      createdAt: '2026-06-02T10:00:00Z',
      updatedAt: '2026-06-02T11:30:00Z'
    }
  ],
  defect_entries: [
    {
      id: 'defect-001',
      orderId: 'order-002',
      qualityRecordId: 'qr-002',
      defectType: 'scratch',
      severity: 'minor',
      description: '表面轻微划痕',
      location: '齿轮表面',
      status: 'resolved',
      assignedTo: 'user-003',
      resolvedAt: '2026-06-02T11:30:00Z',
      createdAt: '2026-06-02T10:05:00Z',
      updatedAt: '2026-06-02T11:30:00Z'
    }
  ],
  rework_orders: [
    {
      id: 'rework-001',
      orderId: 'order-002',
      defectId: 'defect-001',
      reworkType: 'polish',
      assignedTo: 'user-003',
      status: 'completed',
      startTime: '2026-06-02T10:30:00Z',
      endTime: '2026-06-02T11:30:00Z',
      notes: '表面抛光处理完成',
      createdAt: '2026-06-02T10:20:00Z',
      updatedAt: '2026-06-02T11:30:00Z'
    }
  ],
  quality_alerts: [
    {
      id: 'alert-001',
      type: 'quality',
      severity: 'medium',
      sourceId: 'order-002',
      message: '发现轻微表面缺陷',
      acknowledged: true,
      acknowledgedBy: 'user-001',
      acknowledgedAt: '2026-06-02T11:00:00Z',
      createdAt: '2026-06-02T10:05:00Z',
      updatedAt: '2026-06-02T11:00:00Z'
    }
  ],
  users: [
    {
      id: 'user-001',
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      department: 'quality',
      createdAt: '2026-06-01T00:00:00Z',
      updatedAt: '2026-06-01T00:00:00Z'
    },
    {
      id: 'user-002',
      username: 'zhang',
      email: 'zhang@example.com',
      password: 'zhang123',
      role: 'supervisor',
      department: 'line-a',
      createdAt: '2026-06-01T00:00:00Z',
      updatedAt: '2026-06-01T00:00:00Z'
    },
    {
      id: 'user-003',
      username: 'li',
      email: 'li@example.com',
      password: 'li123',
      role: 'operator',
      department: 'line-b',
      createdAt: '2026-06-01T00:00:00Z',
      updatedAt: '2026-06-01T00:00:00Z'
    }
  ],
  auth_tokens: [
    {
      userId: 'user-001',
      token: 'seed-token-admin',
      expiresAt: '2026-12-31T23:59:59Z',
      createdAt: now
    }
  ]
};

async function seedDatabase(): Promise<void> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    for (const [fileName, data] of Object.entries(seedData)) {
      const filePath = path.join(DATA_DIR, `${fileName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`Seeded ${fileName}.json (${data.length} records)`);
    }

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().catch(console.error);
}

export { seedDatabase };
