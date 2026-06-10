import { DefectService } from '../services/index.js';
import type { CreateDefectData as DefectCreateData, UpdateDefectData } from '../services/defect-service.js';
import { requireAuth, requireRole } from '../middleware/index.js';
import { parse } from 'url';

const defectService = new DefectService();

export class DefectController {
  async handleRequest(req: any, res: any, body: any): Promise<void> {
    const { method } = req;
    const parsedUrl = parse(req.url || '', true);
    const pathname = parsedUrl.pathname || '';
    const query = parsedUrl.query;

    if (pathname === '/api/defects' && method === 'POST') {
      await this.createDefect(req, res, body);
      return;
    }

    if (pathname === '/api/defects' && method === 'GET') {
      await this.getDefects(req, res, query);
      return;
    }

    if (pathname.startsWith('/api/defects/order/') && method === 'GET') {
      const orderId = pathname.slice('/api/defects/order/'.length);
      await this.getDefectsByOrder(req, res, orderId);
      return;
    }

    if (pathname.startsWith('/api/defects/') && pathname.endsWith('/assign') && method === 'POST') {
      const id = pathname.slice('/api/defects/'.length, -'/assign'.length);
      await this.assignDefect(req, res, id, body);
      return;
    }

    if (pathname.startsWith('/api/defects/') && pathname.endsWith('/resolve') && method === 'POST') {
      const id = pathname.slice('/api/defects/'.length, -'/resolve'.length);
      await this.resolveDefect(req, res, id);
      return;
    }

    if (pathname.startsWith('/api/defects/') && pathname.endsWith('/close') && method === 'POST') {
      const id = pathname.slice('/api/defects/'.length, -'/close'.length);
      await this.closeDefect(req, res, id);
      return;
    }

    if (pathname.startsWith('/api/defects/') && method === 'GET') {
      const id = pathname.slice('/api/defects/'.length);
      await this.getDefectById(req, res, id);
      return;
    }

    if (pathname.startsWith('/api/defects/') && method === 'PUT') {
      const id = pathname.slice('/api/defects/'.length);
      await this.updateDefect(req, res, id, body);
      return;
    }

    if (pathname.startsWith('/api/defects/') && method === 'DELETE') {
      const id = pathname.slice('/api/defects/'.length);
      await this.deleteDefect(req, res, id);
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }

  private async createDefect(req: any, res: any, body: any): Promise<void> {
    try {
      const userId = await requireAuth(req, res);
      if (!userId) return;

      const data: DefectCreateData = {
        orderId: body.orderId,
        defectType: body.defectType,
        severity: body.severity,
        description: body.description,
        location: body.location
      };

      const result = await defectService.createDefect(data);
      if (result.error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: result.error }));
        return;
      }

      res.writeHead(201);
      res.end(JSON.stringify(result.defect));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async getDefects(req: any, res: any, query: any): Promise<void> {
    try {
      const userId = await requireAuth(req, res);
      if (!userId) return;

      const status = query.status;
      const severity = query.severity;
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 20;

      const result = await defectService.getDefects(status, severity, page, limit);

      res.writeHead(200);
      res.end(JSON.stringify(result));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async getDefectById(req: any, res: any, id: string): Promise<void> {
    try {
      const userId = await requireAuth(req, res);
      if (!userId) return;

      const defect = await defectService.getDefectById(id);
      if (!defect) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Defect not found' }));
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify(defect));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async getDefectsByOrder(req: any, res: any, orderId: string): Promise<void> {
    try {
      const userId = await requireAuth(req, res);
      if (!userId) return;

      const defects = await defectService.getDefectsByOrder(orderId);

      res.writeHead(200);
      res.end(JSON.stringify({ defects }));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async updateDefect(req: any, res: any, id: string, body: any): Promise<void> {
    try {
      const userId = await requireAuth(req, res);
      if (!userId) return;

      const data: UpdateDefectData = body;
      const result = await defectService.updateDefect(id, data);

      if (!result.defect) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Defect not found' }));
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify(result.defect));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async assignDefect(req: any, res: any, id: string, body: any): Promise<void> {
    try {
      const userId = await requireAuth(req, res);
      if (!userId) return;
      if (!requireRole(userId, ['supervisor', 'manager', 'admin'], res)) return;

      const result = await defectService.assignDefect(id, body.assignedTo);

      if (result.error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: result.error }));
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify(result.defect));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async resolveDefect(req: any, res: any, id: string): Promise<void> {
    try {
      const userId = await requireAuth(req, res);
      if (!userId) return;

      const result = await defectService.resolveDefect(id);

      if (result.error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: result.error }));
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify(result.defect));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async closeDefect(req: any, res: any, id: string): Promise<void> {
    try {
      const userId = await requireAuth(req, res);
      if (!userId) return;
      if (!requireRole(userId, ['supervisor', 'manager', 'admin'], res)) return;

      const result = await defectService.closeDefect(id);

      if (result.error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: result.error }));
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify(result.defect));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async deleteDefect(req: any, res: any, id: string): Promise<void> {
    try {
      const userId = await requireAuth(req, res);
      if (!userId) return;
      if (!requireRole(userId, ['manager', 'admin'], res)) return;

      const deleted = await defectService.deleteDefect(id);
      if (!deleted) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Defect not found' }));
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify({ message: 'Defect deleted successfully' }));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }
}