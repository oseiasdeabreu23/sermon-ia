const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function markAdmin(email) {
  try {
    if (!email) {
      console.error('❌ Email é obrigatório');
      console.log('Uso: node scripts/mark-admin.js seu@email.com');
      process.exit(1);
    }

    console.log(`🔍 Procurando usuário ${email}...`);

    await client.execute(
      'UPDATE users SET is_admin = 1 WHERE email = ?',
      [email]
    );

    console.log(`✅ ${email} agora é administrador!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

markAdmin(process.argv[2]);
