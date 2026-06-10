import { UserController, ProductionOrderController, QualityController, DefectController, ReworkController, AlertController } from '../controllers/index.js';
import { parse } from 'url';

const userController = new UserController();
const orderController = new ProductionOrderController();
const qualityController = new QualityController();
const defectController = new DefectController();
const reworkController = new ReworkController();
const alertController = new AlertController();

function normalizeApiPath(pathname: string): string {
  let normalized = pathname;

  if (normalized.startsWith('/api/v1/')) {
    normalized = normalized.replace('/api/v1/', '/api/');
  }

  const aliases: Array<[string, string]> = [
    ['/api/quality-records', '/api/quality'],
    ['/api/rework-orders', '/api/rework']
  ];

  for (const [from, to] of aliases) {
    if (normalized === from || normalized.startsWith(`${from}/`)) {
      normalized = normalized.replace(from, to);
    }
  }

  return normalized;
}

export async function handleRequest(req: any, res: any, body: any): Promise<void> {
  const { method } = req;
  const parsedUrl = parse(req.url || '', true);
  const originalPathname = parsedUrl.pathname || '';
  const pathname = normalizeApiPath(originalPathname);
  const search = parsedUrl.search || '';

  if (pathname !== originalPathname) {
    req.url = `${pathname}${search}`;
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (pathname === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'healthy', uptime: process.uptime() }));
    return;
  }

  if (pathname.startsWith('/api/users')) {
    await userController.handleRequest(req, res, body);
    return;
  }

  if (pathname.startsWith('/api/orders')) {
    await orderController.handleRequest(req, res, body);
    return;
  }

  if (pathname.startsWith('/api/quality')) {
    await qualityController.handleRequest(req, res, body);
    return;
  }

  if (pathname.startsWith('/api/defects')) {
    await defectController.handleRequest(req, res, body);
    return;
  }

  if (pathname.startsWith('/api/rework')) {
    await reworkController.handleRequest(req, res, body);
    return;
  }

  if (pathname.startsWith('/api/alerts')) {
    await alertController.handleRequest(req, res, body);
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
}
