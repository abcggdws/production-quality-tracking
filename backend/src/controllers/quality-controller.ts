import { QualityService, CreateQualityRecordData } from '../services/index.js';
import { requireAuth, requireRole } from '../middleware/index.js';
import { parse } from 'url';

const qualityService = new QualityService();

export class QualityController {
  async handleRequest(req: any, res: any, body: any): Promise<void> {
    const { method } = req;
    const parsedUrl = parse(req.url || '', true);
    const pathname = parsedUrl.pathname || '';
    const query = parsedUrl.query;

    if (pathname === '/api/quality' && method === 'POST') {
      await this.createRecord(req, res, body);
      return;
    }

    if (pathname === '/api/quality' && method === 'GET') {
      await this.getRecords(req, res, query);
      return;
    }

    if (pathname.startsWith('/api/quality/order/') && method === 'GET') {
      const orderId = pathname.slice('/api/quality/order/'.length);
      await this.getRecordsByOrder(req, res, orderId);
      return;
    }

    if (pathname.startsWith('/api/quality/') && method === 'GET') {
      const id = pathname.slice('/api/quality/'.length);
      await this.getRecordById(req, res, id);
      return;
    }

    if (pathname.startsWith('/api/quality/') && method === 'DELETE') {
      const id = pathname.slice('/api/quality/'.length);
      await this.deleteRecord(req, res, id);
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }

  private async createRecord(req: any, res: any, body: any): Promise<void> {
    try {
      const userId = await requireAuth(req, res);
      if (!userId) return;
      if (!requireRole(userId, ['supervisor', 'manager', 'admin'], res)) return;

      const data: CreateQualityRecordData = {
        orderId: body.orderId,
        inspectorId: userId,
        inspectionType: body.inspectionType,
        result: body.result,
        defects: body.defects,
        notes: body.notes
      };

      const result = await qualityService.createRecord(data);
      if (result.error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: result.error }));
        return;
      }

      res.writeHead(201);
      res.end(JSON.stringify(result.record));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async getRecords(req: any, res: any, query: any): Promise<void> {
    try {
      const userId = await requireAuth(req, res);
      if (!userId) return;

      const inspectorId = query.inspectorId;
      const result = query.result;
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 20;

      const records = await qualityService.getRecords(inspectorId, result, page, limit);

      res.writeHead(200);
      res.end(JSON.stringify(records));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async getRecordById(req: any, res: any, id: string): Promise<void> {
    try {
      const userId = await requireAuth(req, res);
      if (!userId) return;

      const record = await qualityService.getRecordById(id);
      if (!record) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Quality record not found' }));
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify(record));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async getRecordsByOrder(req: any, res: any, orderId: string): Promise<void> {
    try {
      const userId = await requireAuth(req, res);
      if (!userId) return;

      const records = await qualityService.getRecordsByOrder(orderId);

      res.writeHead(200);
      res.end(JSON.stringify({ records }));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async deleteRecord(req: any, res: any, id: string): Promise<void> {
    try {
      const userId = await requireAuth(req, res);
      if (!userId) return;
      if (!requireRole(userId, ['manager', 'admin'], res)) return;

      const deleted = await qualityService.deleteRecord(id);
      if (!deleted) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Quality record not found' }));
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify({ message: 'Quality record deleted successfully' }));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }
}