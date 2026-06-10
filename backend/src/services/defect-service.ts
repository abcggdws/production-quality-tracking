import { Defect } from '../models/index.js';
import { JsonDefectRepository } from '../repositories/index.js';
import { generateId, formatDate, paginate } from '../utils/index.js';

const defectRepo = new JsonDefectRepository();

export interface CreateDefectData {
  orderId: string;
  defectType: string;
  severity: 'minor' | 'major' | 'critical';
  description: string;
  location?: string;
}

export interface UpdateDefectData {
  defectType?: string;
  severity?: 'minor' | 'major' | 'critical';
  description?: string;
  location?: string;
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
}

export class DefectService {
  async createDefect(data: CreateDefectData): Promise<{ defect: Defect | null; error?: string }> {
    if (!data.orderId || !data.defectType || !data.severity || !data.description) {
      return { defect: null, error: 'Order ID, defect type, severity and description are required' };
    }

    const now = formatDate(new Date());
    const defect: Defect = {
      id: generateId(),
      orderId: data.orderId,
      defectType: data.defectType,
      severity: data.severity,
      description: data.description,
      location: data.location,
      status: 'open',
      createdAt: now,
      updatedAt: now
    };

    defectRepo.create(defect);
    return { defect };
  }

  async getDefectById(id: string): Promise<Defect | null> {
    return defectRepo.findById(id) || null;
  }

  async getDefects(status?: string, severity?: string, page: number = 1, limit: number = 20): Promise<any> {
    let defects = defectRepo.findAll();

    if (status) {
      defects = defectRepo.findByStatus(status);
    }

    if (severity) {
      defects = defects.filter(d => d.severity === severity);
    }

    return paginate(defects, page, limit);
  }

  async getDefectsByOrder(orderId: string): Promise<Defect[]> {
    return defectRepo.findByOrderId(orderId);
  }

  async updateDefect(id: string, data: UpdateDefectData): Promise<{ defect: Defect | null; error?: string }> {
    const defect = defectRepo.update(id, data);
    return { defect: defect || null };
  }

  async assignDefect(id: string, assignedTo: string): Promise<{ defect: Defect | null; error?: string }> {
    const defect = defectRepo.findById(id);
    if (!defect) {
      return { defect: null, error: 'Defect not found' };
    }

    const updated = defectRepo.update(id, {
      assignedTo,
      status: 'in_progress'
    });
    return { defect: updated || null };
  }

  async resolveDefect(id: string): Promise<{ defect: Defect | null; error?: string }> {
    const defect = defectRepo.findById(id);
    if (!defect) {
      return { defect: null, error: 'Defect not found' };
    }

    const updated = defectRepo.update(id, {
      status: 'resolved',
      resolvedAt: formatDate(new Date())
    });
    return { defect: updated || null };
  }

  async closeDefect(id: string): Promise<{ defect: Defect | null; error?: string }> {
    const defect = defectRepo.findById(id);
    if (!defect) {
      return { defect: null, error: 'Defect not found' };
    }

    if (defect.status !== 'resolved') {
      return { defect: null, error: 'Only resolved defects can be closed' };
    }

    const updated = defectRepo.update(id, { status: 'closed' });
    return { defect: updated || null };
  }

  async deleteDefect(id: string): Promise<boolean> {
    return defectRepo.delete(id);
  }
}