const { createClient } = require('@libsql/client');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function createAdminUser(email) {
  try {
    console.log(`🔄 Criando usuário admin...`);

    const userId = uuidv4();
    const firebaseUid = 'admin-' + uuidv4();

    // Insert using VALUES clause properly
    await client.execute(
      `INSERT INTO users (id, firebase_uid, email, nome, is_admin, created_at, updated_at) 
       VALUES ('${userId}', '${firebaseUid}', '${email}', 'Admin', 1, ${Math.floor(Date.now() / 1000)}, ${Math.floor(Date.now() / 1000)})`
    );

    console.log(`✅ Usuário admin criado com sucesso!`);
    console.log(`\n📋 Informações da conta:`);
    console.log(`   Email: ${email}`);
    console.log(`   ID: ${userId}`);
    console.log(`   Firebase UID: ${firebaseUid}`);
    console.log(`   Status: ✅ Administrador`);
    console.log(`\n📝 Para acessar o painel admin:`);
    console.log(`   1. Faça login com qualquer conta normalmente`);
    console.log(`   2. Depois acesse /admin`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

createAdminUser('admim@sermonia.com');
