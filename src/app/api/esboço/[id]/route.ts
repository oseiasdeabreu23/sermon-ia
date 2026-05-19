'use server';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { esbocos, users } from '../../../../../db/schema';
import { eq } from 'drizzle-orm';
import { getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let firebaseAuth: any;
try {
  const apps = getApps();
  firebaseAuth = apps.length ? getAuth(apps[0]) : null;
} catch (error) {
  console.warn('Firebase Admin not available');
}

interface VerifiedToken {
  uid: string;
  email?: string;
}

async function verifyToken(token: string): Promise<VerifiedToken> {
  if (!firebaseAuth) {
    console.warn('Warning: Token not verified - Firebase Admin not configured');
    return { uid: 'unverified-user' };
  }

  try {
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
  } catch (error) {
    throw new Error('Invalid token');
  }
}

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
    let firebaseUser: VerifiedToken;

    try {
      firebaseUser = await verifyToken(idToken);
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

    // Get user by userId
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, esboço.userId));

    if (!userResult.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult[0];

    // Check if user's firebaseUid matches the token
    if (user.firebaseUid !== firebaseUser.uid) {
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
