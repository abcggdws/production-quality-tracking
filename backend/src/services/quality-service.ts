import { QualityRecord, Defect } from '../models/index.js';
import { JsonQualityRecordRepository, JsonDefectRepository } from '../repositories/index.js';
import { generateId, formatDate, paginate } from '../utils/index.js';

const qualityRepo = new JsonQualityRecordRepository();
const defectRepo = new JsonDefectRepository();

export interface CreateQualityRecordData {
  orderId: string;
  inspectorId: string;
  inspectionType: 'incoming' | 'in_process' | 'final';
  result: 'pass' | 'fail' | 'conditional';
  defects?: CreateDefectData[];
  notes?: string;
}

export interface CreateDefectData {
  defectType: string;
  severity: 'minor' | 'major' | 'critical';
  description: string;
  location?: string;
}

export class QualityService {
  async createRecord(data: CreateQualityRecordData): Promise<{ record: QualityRecord | null; error?: string }> {
    if (!data.orderId || !data.inspectorId || !data.inspectionType || !data.result) {
      return { record: null, error: 'Order ID, inspector ID, inspection type and result are required' };
    }

    const now = formatDate(new Date());
    const defects: Defect[] = [];

    if (data.defects && data.defects.length > 0) {
      for (const d of data.defects) {
        const defect: Defect = {
          id: generateId(),
          orderId: data.orderId,
          defectType: d.defectType,
          severity: d.severity,
          description: d.description,
          location: d.location,
          status: 'open',
          createdAt: now,
          updatedAt: now
        };
        defects.push(defect);
        defectRepo.create(defect);
      }
    }

    const record: QualityRecord = {
      id: generateId(),
      orderId: data.orderId,
      inspectorId: data.inspectorId,
      inspectionDate: now,
      inspectionType: data.inspectionType,
      result: data.result,
      defects,
      notes: data.notes,
      createdAt: now,
      updatedAt: now
    };

    qualityRepo.create(record);
    return { record };
  }

  async getRecordById(id: string): Promise<QualityRecord | null> {
    return qualityRepo.findById(id) || null;
  }

  async getRecordsByOrder(orderId: string): Promise<QualityRecord[]> {
    return qualityRepo.findByOrderId(orderId);
  }

  async getRecords(inspectorId?: string, result?: string, page: number = 1, limit: number = 20): Promise<any> {
    let records = qualityRepo.findAll();

    if (inspectorId) {
      records = records.filter(r => r.inspectorId === inspectorId);
    }

    if (result) {
      records = records.filter(r => r.result === result);
    }

    return paginate(records, page, limit);
  }

  async deleteRecord(id: string): Promise<boolean> {
    return qualityRepo.delete(id);
  }
}