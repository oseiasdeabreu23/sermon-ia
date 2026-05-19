import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { esbocos } from '../../../../../db/schema';
import { eq } from 'drizzle-orm';
import { getAuth } from 'firebase-admin/auth';
import { getApps } from 'firebase-admin/app';

const firebaseAuth = getAuth(getApps()[0]);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.substring(7);
    let firebaseUser;

    try {
      firebaseUser = await firebaseAuth.verifyIdToken(idToken);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Fetch esboço from database
    const result = await db
      .select()
      .from(esbocos)
      .where(eq(esbocos.id, params.id));

    if (!result.length) {
      return NextResponse.json({ error: 'Esboço not found' }, { status: 404 });
    }

    const esboço = result[0];

    // Check if user owns this esboço
    if (esboço.userId !== firebaseUser.uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse conteúdo JSON
    let conteudo;
    try {
      conteudo = esboço.conteudoJson ? JSON.parse(esboço.conteudoJson) : null;
    } catch {
      conteudo = null;
    }

    return NextResponse.json({
      id: esboço.id,
      livro: esboço.livro,
      capitulo: esboço.capitulo,
      versiculo: esboço.versiculo,
      tipo: esboço.tipo,
      titulo: esboço.titulo,
      publicoAlvo: esboço.publicoAlvo,
      conteudo,
      criadoEm: esboço.createdAt?.toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching esboço:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar requisição' },
      { status: 500 }
    );
  }
}
