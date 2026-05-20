const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function checkAdmin(email) {
  try {
    if (!email) {
      console.error('❌ Email é obrigatório');
      console.log('Uso: node scripts/check-admin.js seu@email.com');
      process.exit(1);
    }

    console.log(`🔍 Verificando status de ${email}...`);

    const result = await client.execute(
      'SELECT id, email, is_admin, firebase_uid FROM users WHERE email = ?',
      [email]
    );

    if (result.rows.length === 0) {
      console.log(`❌ Usuário ${email} não encontrado no banco de dados`);
      console.log('Verifique o email ou crie uma conta primeiro');
      process.exit(1);
    }

    const user = result.rows[0];
    console.log('\n📋 Informações do usuário:');
    console.log(`   Email: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Firebase UID: ${user.firebase_uid}`);
    console.log(`   Is Admin: ${user.is_admin === 1 ? '✅ SIM' : '❌ NÃO'}`);

    if (user.is_admin !== 1) {
      console.log('\n⚠️  Este usuário NÃO é administrador');
    } else {
      console.log('\n✅ Este usuário É administrador');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

checkAdmin(process.argv[2]);
