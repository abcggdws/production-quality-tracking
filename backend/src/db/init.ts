import fs from 'fs';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');

async function initDatabase(): Promise<void> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      console.log(`Created data directory: ${DATA_DIR}`);
    }

    const files = [
      'production_orders.json',
      'quality_records.json',
      'defect_entries.json',
      'rework_orders.json',
      'quality_alerts.json',
      'users.json',
      'auth_tokens.json'
    ];

    for (const file of files) {
      const filePath = path.join(DATA_DIR, file);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '[]', 'utf-8');
        console.log(`Created empty file: ${file}`);
      }
    }

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase().catch(console.error);
}

export { initDatabase };
