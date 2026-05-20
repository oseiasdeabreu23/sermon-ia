import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiConfigs } from '../../../../../db/schema';
import { v4 as uuidv4 } from 'uuid';

// Verificação de admin removida temporariamente para testes

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Temporariamente: permitir qualquer usuário autenticado
    console.log('✅ GET /api/admin/ai-configs - Permitindo acesso a qualquer usuário autenticado');

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
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Temporariamente: permitir qualquer usuário autenticado
    console.log('✅ POST /api/admin/ai-configs - Permitindo acesso a qualquer usuário autenticado');

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
      { status: 500 }
    );
  }
}
