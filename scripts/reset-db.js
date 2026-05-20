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
    
    // Drop new tables if they exist
    try {
      await client.execute('DROP TABLE IF EXISTS api_configs;');
      console.log('  ✓ Dropped api_configs table');
    } catch (e) {
      console.log('  - api_configs table not found');
    }

    try {
      await client.execute('DROP TABLE IF EXISTS app_settings;');
      console.log('  ✓ Dropped app_settings table');
    } catch (e) {
      console.log('  - app_settings table not found');
    }

    // Create users table
    await client.execute(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY NOT NULL,
        firebase_uid TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        nome TEXT,
        is_admin INTEGER DEFAULT 0,
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

    // Create api_configs table
    await client.execute(`
      CREATE TABLE api_configs (
        id TEXT PRIMARY KEY NOT NULL,
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        api_key TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);
    console.log('  ✓ Created api_configs table');

    // Create app_settings table
    await client.execute(`
      CREATE TABLE app_settings (
        id TEXT PRIMARY KEY NOT NULL,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);
    console.log('  ✓ Created app_settings table');

    console.log('\n✅ Database reset complete!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

resetDatabase();
