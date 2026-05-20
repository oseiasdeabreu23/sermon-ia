const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function resetDatabase() {
  try {
    console.log('🔄 Resetting database...');
    
    // Drop existing tables
    try {
      await client.execute('DROP TABLE IF EXISTS esbocos;');
      console.log('  ✓ Dropped esbocos table');
    } catch (e) {
      console.log('  - esbocos table not found');
    }
    
    try {
      await client.execute('DROP TABLE IF EXISTS users;');
      console.log('  ✓ Dropped users table');
    } catch (e) {
      console.log('  - users table not found');
    }
    
    // Create users table
    await client.execute(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY NOT NULL,
        firebase_uid TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        nome TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);
    console.log('  ✓ Created users table');
    
    // Create esbocos table
    await client.execute(`
      CREATE TABLE esbocos (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE cascade,
        livro TEXT NOT NULL,
        capitulo INTEGER NOT NULL,
        versiculo INTEGER NOT NULL,
        tipo TEXT NOT NULL,
        titulo TEXT NOT NULL,
        publico_alvo TEXT,
        conteudo_json TEXT,
        status TEXT DEFAULT 'pending',
        erro TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);
    console.log('  ✓ Created esbocos table');
    
    console.log('\n✅ Database reset complete!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

resetDatabase();
