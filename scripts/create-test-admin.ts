import { createClient } from '@libsql/client';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function createTestAdmin() {
  try {
    const userId = uuidv4();
    const firebaseUid = `test-firebase-${Date.now()}`;

    const result = await client.execute(
      `INSERT INTO users (id, firebase_uid, email, nome, is_admin, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [userId, firebaseUid, 'test@teste.com', 'Test Admin', 1]
    );

    console.log('✅ Usuário admin criado com sucesso!');
    console.log(`📧 Email: test@teste.com`);
    console.log(`🔑 Firebase UID: ${firebaseUid}`);
    console.log(`👤 Status: Administrador`);
    console.log(`\n⏭️  Próximo passo: Tente acessar /admin novamente`);
  } catch (error: any) {
    console.error('❌ Erro ao criar usuário:', error.message);
    process.exit(1);
  }
}

createTestAdmin();
