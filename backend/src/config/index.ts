import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface Config {
  host: string;
  port: number;
  jwtSecret: string;
  dataDir: string;
}

let config: Config | null = null;

export function getConfig(): Config {
  if (config) return config;

  const envPath = join(process.cwd(), '.env');
  const defaultConfig: Config = {
    host: process.env.APP_HOST || process.env.HOST || '0.0.0.0',
    port: parseInt(process.env.APP_PORT || process.env.PORT || '3001', 10),
    jwtSecret: process.env.JWT_SECRET || 'production-quality-secret-key',
    dataDir: process.env.DATA_DIR || join(process.cwd(), 'data')
  };

  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf-8');
    const lines = content.split('\n');
    for (const line of lines) {
      const [key, value] = line.split('=').map(s => s.trim());
      if (key === 'APP_HOST' || key === 'HOST') defaultConfig.host = value || defaultConfig.host;
      if (key === 'APP_PORT' || key === 'PORT') defaultConfig.port = parseInt(value, 10) || defaultConfig.port;
      if (key === 'JWT_SECRET') defaultConfig.jwtSecret = value || defaultConfig.jwtSecret;
      if (key === 'DATA_DIR') defaultConfig.dataDir = value || defaultConfig.dataDir;
    }
  }

  config = defaultConfig;
  return config;
}
