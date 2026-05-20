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
    console.log('📍 [GET /api/esbocos] Iniciando requisição');

    // Get authorization header (required)
    const authHeader = request.headers.get('authorization');
    console.log('📍 Auth header:', authHeader ? 'presente' : 'ausente');

    if (!authHeader?.startsWith('Bearer ')) {
      console.warn('⚠️  Sem autenticação válida');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.substring(7);
    let firebaseUser: VerifiedToken;

    try {
      firebaseUser = await verifyToken(idToken);
      console.log('✅ Token autenticado para:', firebaseUser.uid);
    } catch (error: any) {
      console.error('❌ Erro ao verificar token:', error.message);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user from database
    console.log('📍 Buscando usuário com firebaseUid:', firebaseUser.uid);
    const userResult = await db.select().from(users).where(eq(users.firebaseUid, firebaseUser.uid));
    console.log('📍 Usuários encontrados:', userResult.length);

    if (!userResult.length) {
      // No user found, return empty array
      console.log('⚠️  Usuário não encontrado, retornando array vazio');
      return NextResponse.json([]);
    }

    const user = userResult[0];
    console.log('✅ Usuário encontrado:', user.id);

    // Fetch all sketches for this user
    console.log('📍 Buscando esboços para userId:', user.id);
    const userSketches = await db
      .select()
      .from(esbocos)
      .where(eq(esbocos.userId, user.id));

    console.log('✅ Esboços encontrados:', userSketches.length);

    // Parse conteúdo JSON for each sketch
    const response = userSketches.map((esboço) => {
      let conteudo;
      try {
        conteudo = esboço.conteudoJson ? JSON.parse(esboço.conteudoJson) : null;
      } catch {
        conteudo = null;
      }

      // Safe date conversion
      let createdAtString;
      try {
        if (esboço.createdAt instanceof Date) {
          createdAtString = esboço.createdAt.toISOString();
        } else if (esboço.createdAt) {
          createdAtString = new Date(esboço.createdAt).toISOString();
        } else {
          createdAtString = new Date().toISOString();
        }
      } catch (e) {
        console.warn('⚠️  Invalid date for esboço', esboço.id, ':', esboço.createdAt);
        createdAtString = new Date().toISOString();
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
        createdAt: createdAtString,
      };
    });

    console.log('✅ Retornando', response.length, 'esboços');
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('❌ Erro ao processar /api/esbocos:', error);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar requisição' },
      { status: 500 }
    );
  }
}
