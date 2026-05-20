import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiConfigs } from '../../../../../db/schema';
import { getAuth } from 'firebase-admin/auth';
import { getApps } from 'firebase-admin/app';
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

  // Tenta verificar admin primeiro pelo UID, depois pelo email
  let admin = await getAdminUser(decodedToken.uid);
  if (!admin && decodedToken.email) {
    admin = await getAdminUser(decodedToken.email);
  }

  if (!admin) {
    throw new Error('Acesso negado: usuário não é administrador');
  }

  return decodedToken;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    await verifyAdminToken(token);

    const configs = await db.select().from(apiConfigs);

    return NextResponse.json({
      configs: configs.map(c => ({
        ...c,
        apiKey: c.apiKey ? `${c.apiKey.substring(0, 10)}...` : '',
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar configurações' },
      { status: 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    await verifyAdminToken(token);

    const body = await request.json();
    const { provider, model, apiKey } = body;

    if (!provider || !model || !apiKey) {
      return NextResponse.json(
        { error: 'Provider, model e apiKey são obrigatórios' },
        { status: 400 }
      );
    }

    const configId = uuidv4();
    await db.insert(apiConfigs).values({
      id: configId,
      provider,
      model,
      apiKey,
      isActive: 0,
    });

    return NextResponse.json({
      id: configId,
      provider,
      model,
      message: 'Configuração adicionada com sucesso',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao adicionar configuração' },
      { status: 400 }
    );
  }
}
