import { Alert } from '../models/index.js';
import { JsonAlertRepository } from '../repositories/index.js';
import { generateId, formatDate, paginate } from '../utils/index.js';

const alertRepo = new JsonAlertRepository();

export interface CreateAlertData {
  type: 'quality' | 'production' | 'equipment' | 'safety';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  sourceId?: string;
}

export class AlertService {
  async createAlert(data: CreateAlertData): Promise<{ alert: Alert | null; error?: string }> {
    if (!data.type || !data.severity || !data.message) {
      return { alert: null, error: 'Type, severity and message are required' };
    }

    const now = formatDate(new Date());
    const alert: Alert = {
      id: generateId(),
      type: data.type,
      severity: data.severity,
      message: data.message,
      sourceId: data.sourceId,
      acknowledged: false,
      createdAt: now,
      updatedAt: now
    };

    alertRepo.create(alert);
    return { alert };
  }

  async getAlertById(id: string): Promise<Alert | null> {
    return alertRepo.findById(id) || null;
  }

  async getAlerts(type?: string, severity?: string, acknowledged?: boolean, page: number = 1, limit: number = 20): Promise<any> {
    let alerts = alertRepo.findAll();

    if (type) {
      alerts = alertRepo.findByType(type);
    }

    if (severity) {
      alerts = alerts.filter(a => a.severity === severity);
    }

    if (acknowledged !== undefined) {
      alerts = acknowledged ? alerts.filter(a => a.acknowledged) : alertRepo.findUnacknowledged();
    }

    return paginate(alerts, page, limit);
  }

  async acknowledgeAlert(id: string, userId: string): Promise<{ alert: Alert | null; error?: string }> {
    const alert = alertRepo.findById(id);
    if (!alert) {
      return { alert: null, error: 'Alert not found' };
    }

    if (alert.acknowledged) {
      return { alert: null, error: 'Alert already acknowledged' };
    }

    const updated = alertRepo.update(id, {
      acknowledged: true,
      acknowledgedBy: userId,
      acknowledgedAt: formatDate(new Date())
    });
    return { alert: updated || null };
  }

  async deleteAlert(id: string): Promise<boolean> {
    return alertRepo.delete(id);
  }
}