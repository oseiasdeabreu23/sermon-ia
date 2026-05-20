import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiConfigs } from '../../../../../../db/schema';
import { eq } from 'drizzle-orm';
import { getAuth } from 'firebase-admin/auth';
import { getApps } from 'firebase-admin/app';
import { createClient } from '@libsql/client';
import { v4 as uuidv4 } from 'uuid';
import { getAdminUser } from '@/lib/admin-check';

let firebaseAuth: any;
try {
  const apps = getApps();
  firebaseAuth = apps.length ? getAuth(apps[0]) : null;
} catch (error) {
  console.warn('Firebase Admin not available');
}

async function verifyAdminToken(token: string) {
  if (!firebaseAuth) {
    throw new Error('Firebase Admin not configured');
  }

  const decodedToken = await firebaseAuth.verifyIdToken(token);
  const admin = await getAdminUser(decodedToken.uid);

  if (!admin) {
    throw new Error('Acesso negado: usuário não é administrador');
  }

  return decodedToken;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    await verifyAdminToken(token);

    await db.delete(apiConfigs).where(eq(apiConfigs.id, params.id));

    return NextResponse.json({ message: 'Configuração deletada com sucesso' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar configuração' },
      { status: 400 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    await verifyAdminToken(token);

    const body = await request.json();
    const action = body.action;

    if (action === 'activate') {
      // Desativar todas as outras
      await db.update(apiConfigs).set({ isActive: 0 });

      // Ativar esta
      await db
        .update(apiConfigs)
        .set({ isActive: 1 })
        .where(eq(apiConfigs.id, params.id));

      // Atualizar setting usando libsql client direto para evitar problemas com Drizzle
      const libsqlClient = createClient({
        url: process.env.TURSO_CONNECTION_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN!,
      });

      const settingId = uuidv4();
      await libsqlClient.execute(
        `INSERT INTO app_settings (id, key, value) VALUES ('${settingId}', 'active_ai_provider', '${params.id}')`
      );

      return NextResponse.json({ message: 'Configuração ativada com sucesso' });
    }

    return NextResponse.json({ error: 'Ação desconhecida' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao processar ação' },
      { status: 400 }
    );
  }
}
