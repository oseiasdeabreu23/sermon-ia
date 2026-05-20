import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { esbocos, users } from '../../../../db/schema';
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

export async function GET(request: NextRequest) {
  try {
    // Get authorization header (required)
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.substring(7);
    let firebaseUser: VerifiedToken;

    try {
      firebaseUser = await verifyToken(idToken);
      console.log('✅ Token autenticado para:', firebaseUser.uid);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user from database
    const userResult = await db.select().from(users).where(eq(users.firebaseUid, firebaseUser.uid));

    if (!userResult.length) {
      // No user found, return empty array
      return NextResponse.json([]);
    }

    const user = userResult[0];

    // Fetch all sketches for this user
    const userSketches = await db
      .select()
      .from(esbocos)
      .where(eq(esbocos.userId, user.id));

    // Parse conteúdo JSON for each sketch
    const response = userSketches.map((esboço) => {
      let conteudo;
      try {
        conteudo = esboço.conteudoJson ? JSON.parse(esboço.conteudoJson) : null;
      } catch {
        conteudo = null;
      }

      return {
        id: esboço.id || '',
        livro: esboço.livro || '',
        capitulo: esboço.capitulo || 0,
        versiculo: esboço.versiculo || 0,
        tipo: esboço.tipo || '',
        titulo: esboço.titulo || '',
        publicoAlvo: esboço.publicoAlvo || '',
        status: esboço.status || 'completed',
        conteudo: conteudo || {},
        createdAt: esboço.createdAt?.toISOString() || new Date().toISOString(),
      };
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching esboços:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar requisição' },
      { status: 500 }
    );
  }
}
