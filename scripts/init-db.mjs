import { initDatabase, closeConnection } from '../lib/db.js';

async function main() {
  try {
    await initDatabase();
    console.log('Database initialization complete!');
    await closeConnection();
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    await closeConnection();
    process.exit(1);
  }
}

main();
