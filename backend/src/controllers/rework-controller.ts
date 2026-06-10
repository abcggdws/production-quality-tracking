import { ReworkService, CreateReworkOrderData } from '../services/index.js';
import { requireAuth, requireRole } from '../middleware/index.js';
import { parse } from 'url';

const reworkService = new ReworkService();

export class ReworkController {
  async handleRequest(req: any, res: any, body: any): Promise<void> {
    const { method } = req;
    const parsedUrl = parse(req.url || '', true);
    const pathname = parsedUrl.pathname || '';
    const query = parsedUrl.query;

    if (pathname === '/api/rework' && method === 'POST') {
      await this.createOrder(req, res, body);
      return;
    }

    if (pathname === '/api/rework' && method === 'GET') {
      await this.getOrders(req, res, query);
      return;
    }

    if (pathname.startsWith('/api/rework/') && pathname.endsWith('/start') && method === 'POST') {
      const id = pathname.slice('/api/rework/'.length, -'/start'.length);
      await this.startOrder(req, res, id);
      return;
    }

    if (pathname.startsWith('/api/rework/') && pathname.endsWith('/complete') && method === 'POST') {
      const id = pathname.slice('/api/rework/'.length, -'/complete'.length);
      await this.completeOrder(req, res, id, body);
      return;
    }

    if (pathname.startsWith('/api/rework/') && pathname.endsWith('/cancel') && method === 'POST') {
      const id = pathname.slice('/api/rework/'.length, -'/cancel'.length);
      await this.cancelOrder(req, res, id);
      return;
    }

    if (pathname.startsWith('/api/rework/') && method === 'GET') {
      const id = pathname.slice('/api/rework/'.length);
      await this.getOrderById(req, res, id);
      return;
    }

    if (pathname.startsWith('/api/rework/') && method === 'DELETE') {
      const id = pathname.slice('/api/rework/'.length);
      await this.deleteOrder(req, res, id);
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }

  private async createOrder(req: any, res: any, body: any): Promise<void> {
    try {
      const userId = await requireAuth(req, res);
      if (!userId) return;
      if (!requireRole(userId, ['supervisor', 'manager', 'admin'], res)) return;

      const data: CreateReworkOrderData = {
        orderId: body.orderId,
        defectId: body.defectId,
        reworkType: body.reworkType,
        assignedTo: body.assignedTo,
        notes: body.notes
      };

      const result = await reworkService.createOrder(data);
      if (result.error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: result.error }));
        return;
      }

      res.writeHead(201);
      res.end(JSON.stringify(result.order));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async getOrders(req: any, res: any, query: any): Promise<void> {
    try {
      const userId = await requireAuth(req, res);
      if (!userId) return;

      const status = query.status;
      const assignedTo = query.assignedTo;
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 20;

      const result = await reworkService.getOrders(status, assignedTo, page, limit);

      res.writeHead(200);
      res.end(JSON.stringify(result));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async getOrderById(req: any, res: any, id: string): Promise<void> {
    try {
      const userId = await requireAuth(req, res);
      if (!userId) return;

      const order = await reworkService.getOrderById(id);
      if (!order) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Rework order not found' }));
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify(order));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async startOrder(req: any, res: any, id: string): Promise<void> {
    try {
      const userId = await requireAuth(req, res);
      if (!userId) return;

      const result = await reworkService.startOrder(id);

      if (result.error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: result.error }));
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify(result.order));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async completeOrder(req: any, res: any, id: string, body: any): Promise<void> {
    try {
      const userId = await requireAuth(req, res);
      if (!userId) return;

      const result = await reworkService.completeOrder(id, body.notes);

      if (result.error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: result.error }));
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify(result.order));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async cancelOrder(req: any, res: any, id: string): Promise<void> {
    try {
      const userId = await requireAuth(req, res);
      if (!userId) return;
      if (!requireRole(userId, ['supervisor', 'manager', 'admin'], res)) return;

      const result = await reworkService.cancelOrder(id);

      if (result.error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: result.error }));
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify(result.order));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async deleteOrder(req: any, res: any, id: string): Promise<void> {
    try {
      const userId = await requireAuth(req, res);
      if (!userId) return;
      if (!requireRole(userId, ['manager', 'admin'], res)) return;

      const deleted = await reworkService.deleteOrder(id);
      if (!deleted) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Rework order not found' }));
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify({ message: 'Rework order deleted successfully' }));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }
}