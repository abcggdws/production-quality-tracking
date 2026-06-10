import { randomUUID, createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DEFAULT_DATA_DIR = join(process.cwd(), 'data');

function getDataDir(): string {
  return process.env.DATA_DIR || DEFAULT_DATA_DIR;
}

export function generateId(): string {
  return randomUUID();
}

export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function generateToken(userId: string, secret: string): string {
  const timestamp = Date.now();
  const payload = `${userId}:${timestamp}`;
  const signature = createHash('sha256').update(`${payload}:${secret}`).digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64');
}

export function parseToken(token: string): { userId: string; timestamp: number } | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length !== 3) return null;
    return { userId: parts[0], timestamp: parseInt(parts[1], 10) };
  } catch {
    return null;
  }
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function loadData<T>(filename: string): T[] {
  ensureDataDir();
  const filepath = join(getDataDir(), filename);
  if (!existsSync(filepath)) {
    writeFileSync(filepath, '[]', 'utf-8');
    return [];
  }
  const content = readFileSync(filepath, 'utf-8');
  try {
    return JSON.parse(content) as T[];
  } catch {
    return [];
  }
}

export function saveData<T>(filename: string, data: T[]): void {
  ensureDataDir();
  const filepath = join(getDataDir(), filename);
  writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
}

function ensureDataDir(): void {
  const dataDir = getDataDir();
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
}

export function paginate<T>(items: T[], page: number = 1, limit: number = 10): { data: T[]; total: number; page: number; limit: number; totalPages: number } {
  const total = items.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const end = start + limit;
  const data = items.slice(start, end);
  return { data, total, page, limit, totalPages };
}

export function logger(level: string, message: string, data?: unknown): void {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, level, message, data };
  console.log(JSON.stringify(logEntry));
}
