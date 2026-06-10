import { createServer } from 'http';
import { handleRequest } from './routes/index.js';
import { getConfig } from './config/index.js';
import { logger } from './utils/index.js';

async function main(): Promise<void> {
  const config = getConfig();

  const server = createServer(async (req, res) => {
    let body = '';
    await new Promise<void>((resolve) => {
      req.on('data', (chunk: Buffer) => {
        body += chunk.toString();
      });
      req.on('end', resolve);
    });

    let jsonBody: any = {};
    try {
      if (body) jsonBody = JSON.parse(body);
    } catch {
      jsonBody = {};
    }

    try {
      await handleRequest(req, res, jsonBody);
    } catch (e) {
      logger('error', 'Request handling error', String(e));
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  });

  server.listen(config.port, config.host, () => {
    logger('info', `Production Quality Tracking System started on ${config.host}:${config.port}`);
    logger('info', `Configuration: ${JSON.stringify(config)}`);
  });
}

main().catch(e => {
  logger('error', 'Fatal error', String(e));
  process.exit(1);
});
