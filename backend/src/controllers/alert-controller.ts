import { AlertService, CreateAlertData } from '../services/index.js';
import { requireAuth, requireRole } from '../middleware/index.js';
import { parse } from 'url';

const alertService = new AlertService();

export class AlertController {
  async handleRequest(req: any, res: any, body: any): Promise<void> {
    const { method } = req;
    const parsedUrl = parse(req.url || '', true);
    const pathname = parsedUrl.pathname || '';
    const query = parsedUrl.query;

    if (pathname === '/api/alerts' && method === 'POST') {
      await this.createAlert(req, res, body);
      return;
    }

    if (pathname === '/api/alerts' && method === 'GET') {
      await this.getAlerts(req, res, query);
      return;
    }

    if (pathname.startsWith('/api/alerts/') && pathname.endsWith('/acknowledge') && method === 'POST') {
      const id = pathname.slice('/api/alerts/'.length, -'/acknowledge'.length);
      await this.acknowledgeAlert(req, res, id);
      return;
    }

    if (pathname.startsWith('/api/alerts/') && method === 'GET') {
      const id = pathname.slice('/api/alerts/'.length);
      await this.getAlertById(req, res, id);
      return;
    }

    if (pathname.startsWith('/api/alerts/') && method === 'DELETE') {
      const id = pathname.slice('/api/alerts/'.length);
      await this.deleteAlert(req, res, id);
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }

  private async createAlert(req: any, res: any, body: any): Promise<void> {
    try {
      const userId = await requireAuth(req, res);
      if (!userId) return;

      const data: CreateAlertData = {
        type: body.type,
        severity: body.severity,
        message: body.message,
        sourceId: body.sourceId
      };

      const result = await alertService.createAlert(data);
      if (result.error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: result.error }));
        return;
      }

      res.writeHead(201);
      res.end(JSON.stringify(result.alert));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async getAlerts(req: any, res: any, query: any): Promise<void> {
    try {
      const userId = await requireAuth(req, res);
      if (!userId) return;

      const type = query.type;
      const severity = query.severity;
      const acknowledged = query.acknowledged === 'true' ? true : query.acknowledged === 'false' ? false : undefined;
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 20;

      const result = await alertService.getAlerts(type, severity, acknowledged, page, limit);

      res.writeHead(200);
      res.end(JSON.stringify(result));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async getAlertById(req: any, res: any, id: string): Promise<void> {
    try {
      const userId = await requireAuth(req, res);
      if (!userId) return;

      const alert = await alertService.getAlertById(id);
      if (!alert) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Alert not found' }));
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify(alert));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async acknowledgeAlert(req: any, res: any, id: string): Promise<void> {
    try {
      const userId = await requireAuth(req, res);
      if (!userId) return;

      const result = await alertService.acknowledgeAlert(id, userId);

      if (result.error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: result.error }));
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify(result.alert));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async deleteAlert(req: any, res: any, id: string): Promise<void> {
    try {
      const userId = await requireAuth(req, res);
      if (!userId) return;
      if (!requireRole(userId, ['manager', 'admin'], res)) return;

      const deleted = await alertService.deleteAlert(id);
      if (!deleted) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Alert not found' }));
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify({ message: 'Alert deleted successfully' }));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }
}