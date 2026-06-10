import { IncomingMessage } from 'http';
import { JsonAuthTokenRepository, JsonUserRepository } from '../repositories/index.js';
import { parseToken } from '../utils/index.js';

const tokenRepo = new JsonAuthTokenRepository();
const userRepo = new JsonUserRepository();

export interface AuthResult {
  success: boolean;
  userId?: string;
  error?: string;
}

export async function authenticate(req: IncomingMessage): Promise<AuthResult> {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return { success: false, error: 'No authorization header' };
  }

  if (!authHeader.startsWith('Bearer ')) {
    return { success: false, error: 'Invalid authorization format' };
  }

  const token = authHeader.slice(7);
  
  const parsed = parseToken(token);
  if (!parsed) {
    return { success: false, error: 'Invalid token format' };
  }

  const storedToken = tokenRepo.findByToken(token);
  if (!storedToken) {
    return { success: false, error: 'Token not found' };
  }

  const expiresAt = new Date(storedToken.expiresAt);
  if (expiresAt < new Date()) {
    tokenRepo.delete(token);
    return { success: false, error: 'Token expired' };
  }

  return { success: true, userId: parsed.userId };
}

export async function requireAuth(req: IncomingMessage, res: any): Promise<string | null> {
  const result = await authenticate(req);
  if (!result.success) {
    res.writeHead(401);
    res.end(JSON.stringify({ error: result.error }));
    return null;
  }
  return result.userId!;
}

export function requireRole(userId: string, roles: string[], res: any): boolean {
  const user = userRepo.findById(userId);
  if (!user || !roles.includes(user.role)) {
    res.writeHead(403);
    res.end(JSON.stringify({ error: 'Insufficient permissions' }));
    return false;
  }
  return true;
}