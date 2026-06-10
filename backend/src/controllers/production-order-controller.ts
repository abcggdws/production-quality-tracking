import { ProductionOrderService, CreateProductionOrderData, UpdateProductionOrderData } from '../services/index.js';
import { requireAuth, requireRole } from '../middleware/index.js';
import { parse } from 'url';

const orderService = new ProductionOrderService();

export class ProductionOrderController {
  async handleRequest(req: any, res: any, body: any): Promise<void> {
    const { method } = req;
    const parsedUrl = parse(req.url || '', true);
    const pathname = parsedUrl.pathname || '';
    const query = parsedUrl.query;

    if (pathname === '/api/orders' && method === 'POST') {
      await this.createOrder(req, res, body);
      return;
    }

    if (pathname === '/api/orders' && method === 'GET') {
      await this.getOrders(req, res, query);
      return;
    }

    if (pathname.startsWith('/api/orders/') && pathname.endsWith('/start') && method === 'POST') {
      const id = pathname.slice('/api/orders/'.length, -'/start'.length);
      await this.startOrder(req, res, id, body);
      return;
    }

    if (pathname.startsWith('/api/orders/') && pathname.endsWith('/complete') && method === 'POST') {
      const id = pathname.slice('/api/orders/'.length, -'/complete'.length);
      await this.completeOrder(req, res, id);
      return;
    }

    if (pathname.startsWith('/api/orders/') && pathname.endsWith('/cancel') && method === 'POST') {
      const id = pathname.slice('/api/orders/'.length, -'/cancel'.length);
      await this.cancelOrder(req, res, id);
      return;
    }

    if (pathname.startsWith('/api/orders/') && method === 'GET') {
      const id = pathname.slice('/api/orders/'.length);
      await this.getOrderById(req, res, id);
      return;
    }

    if (pathname.startsWith('/api/orders/') && method === 'PUT') {
      const id = pathname.slice('/api/orders/'.length);
      await this.updateOrder(req, res, id, body);
      return;
    }

    if (pathname.startsWith('/api/orders/') && method === 'DELETE') {
      const id = pathname.slice('/api/orders/'.length);
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

      const data: CreateProductionOrderData = {
        orderNumber: body.orderNumber,
        productName: body.productName,
        batchNumber: body.batchNumber,
        quantity: body.quantity,
        operatorId: body.operatorId
      };

      const result = await orderService.createOrder(data);
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
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 20;

      const result = await orderService.getOrders(status, page, limit);

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

      const order = await orderService.getOrderById(id);
      if (!order) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Order not found' }));
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify(order));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async updateOrder(req: any, res: any, id: string, body: any): Promise<void> {
    try {
      const userId = await requireAuth(req, res);
      if (!userId) return;
      if (!requireRole(userId, ['supervisor', 'manager', 'admin'], res)) return;

      const data: UpdateProductionOrderData = body;
      const result = await orderService.updateOrder(id, data);

      if (!result.order) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Order not found' }));
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify(result.order));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async startOrder(req: any, res: any, id: string, body: any): Promise<void> {
    try {
      const userId = await requireAuth(req, res);
      if (!userId) return;

      const operatorId = body.operatorId || userId;
      const result = await orderService.startOrder(id, operatorId);

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

  private async completeOrder(req: any, res: any, id: string): Promise<void> {
    try {
      const userId = await requireAuth(req, res);
      if (!userId) return;

      const result = await orderService.completeOrder(id);

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

      const result = await orderService.cancelOrder(id);

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

      const deleted = await orderService.deleteOrder(id);
      if (!deleted) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Order not found' }));
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify({ message: 'Order deleted successfully' }));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }
}