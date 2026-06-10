import { UserService, CreateUserData } from '../services/index.js';
import { parse } from 'url';

const userService = new UserService();

export class UserController {
  async handleRequest(req: any, res: any, body: any): Promise<void> {
    const { method } = req;
    const parsedUrl = parse(req.url || '', true);
    const pathname = parsedUrl.pathname || '';

    if (pathname === '/api/users/register' && method === 'POST') {
      await this.register(req, res, body);
      return;
    }

    if (pathname === '/api/users/login' && method === 'POST') {
      await this.login(req, res, body);
      return;
    }

    if (pathname === '/api/users/logout' && method === 'POST') {
      await this.logout(req, res, body);
      return;
    }

    if (pathname === '/api/users/me' && method === 'GET') {
      await this.getCurrentUser(req, res);
      return;
    }

    if (pathname === '/api/users' && method === 'GET') {
      await this.getAllUsers(req, res);
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }

  private async register(req: any, res: any, body: any): Promise<void> {
    try {
      const data: CreateUserData = {
        username: body.username,
        email: body.email,
        password: body.password,
        role: body.role,
        department: body.department
      };

      const result = await userService.createUser(data);
      if (result.error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: result.error }));
        return;
      }

      res.writeHead(201);
      res.end(JSON.stringify({ 
        id: result.user!.id,
        username: result.user!.username,
        email: result.user!.email,
        role: result.user!.role
      }));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async login(req: any, res: any, body: any): Promise<void> {
    try {
      const result = await userService.login(body.username || body.email, body.password);
      if (!result.success) {
        res.writeHead(401);
        res.end(JSON.stringify({ error: result.error }));
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify({ 
        token: result.token,
        user: {
          id: result.user!.id,
          username: result.user!.username,
          email: result.user!.email,
          role: result.user!.role
        }
      }));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async logout(req: any, res: any, body: any): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'No token provided' }));
        return;
      }

      const token = authHeader.slice(7);
      await userService.logout(token);

      res.writeHead(200);
      res.end(JSON.stringify({ message: 'Logged out successfully' }));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async getCurrentUser(req: any, res: any): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'No token provided' }));
        return;
      }

      const token = authHeader.slice(7);
      const user = await userService.validateToken(token);

      if (!user) {
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Invalid or expired token' }));
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department
      }));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async getAllUsers(req: any, res: any): Promise<void> {
    try {
      const users = await userService.getAllUsers();
      const safeUsers = users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        department: u.department
      }));

      res.writeHead(200);
      res.end(JSON.stringify({ users: safeUsers }));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }
}