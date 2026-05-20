const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function listUsers() {
  try {
    console.log('📋 Usuários cadastrados:\n');

    const result = await client.execute(
      'SELECT email, is_admin FROM users'
    );

    if (result.rows.length === 0) {
      console.log('Nenhum usuário encontrado');
      process.exit(0);
    }

    result.rows.forEach((user, i) => {
      console.log(`${i + 1}. ${user.email} ${user.is_admin === 1 ? '✅ (Admin)' : ''}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

listUsers();
