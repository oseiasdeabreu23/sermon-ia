const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function makeAdmin(email) {
  try {
    if (!email) {
      console.error('❌ Email é obrigatório');
      console.log('Uso: node scripts/make-admin.js seu@email.com');
      process.exit(1);
    }

    console.log(`🔄 Tornando ${email} administrador...`);

    await client.execute(
      'UPDATE users SET is_admin = 1 WHERE email = ?',
      [email]
    );

    console.log(`✅ Usuário ${email} é agora administrador!`);
    console.log('Acesse https://sermon-ia.vercel.app/admin para gerenciar APIs');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

makeAdmin(process.argv[2]);
