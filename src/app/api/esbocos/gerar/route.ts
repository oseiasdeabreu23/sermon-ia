import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { esbocos, users } from '../../../../../db/schema';
import { eq } from 'drizzle-orm';
import { generateSermonOutline } from '@/lib/ai-provider';
import { obterVersiculo } from '@/lib/bible-service';
import { v4 as uuidv4 } from 'uuid';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin
let firebaseAuth: any;
try {
  const apps = getApps();
  if (!apps.length) {
    const serviceAccount = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
      const app = initializeApp({
        credential: cert(serviceAccount as any),
      });
      firebaseAuth = getAuth(app);
    }
  } else {
    firebaseAuth = getAuth(apps[0]);
  }
} catch (error) {
  console.warn('Firebase Admin not configured, using token verification fallback');
}

interface VerifiedToken {
  uid: string;
  email?: string;
}

async function verifyToken(token: string): Promise<VerifiedToken> {
  if (!firebaseAuth) {
    // Fallback: If Firebase Admin is not configured, we'll trust the token
    // In production, you should always verify tokens
    console.warn('Warning: Token not verified - Firebase Admin not configured');
    // For now, we'll return a dummy verification
    // In production, set up Firebase Admin properly with service account
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


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, livro, capitulo, versiculo, tipo, titulo, publicoAlvo } = body;

    if (!livro || !capitulo || !versiculo || !tipo || !titulo) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

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

    // Get user from database
    const userResult = await db.select().from(users).where(eq(users.firebaseUid, firebaseUser.uid));

    let userId: string;
    if (!userResult.length) {
      // Create user if doesn't exist
      userId = uuidv4();

      // Try to get email from Firebase Admin SDK if available
      let userEmail = firebaseUser.email || 'unknown@example.com';
      if (!firebaseUser.email && firebaseAuth) {
        try {
          const firebaseUserData = await firebaseAuth.getUser(firebaseUser.uid);
          userEmail = firebaseUserData.email || userEmail;
        } catch (e) {
          console.warn('Could not fetch user email from Firebase Admin');
        }
      }

      await db.insert(users).values({
        id: userId,
        firebaseUid: firebaseUser.uid,
        email: userEmail,
        nome: '',
      });
    } else {
      userId = userResult[0].id;
    }

    // Create esboço record
    const esbocoId = uuidv4();

    // Get Bible verse text
    const textoVersiculo = await obterVersiculo(livro, capitulo, versiculo);

    // Generate with AI Provider
    let conteudo;
    try {
      console.log('🔄 Iniciando geração de esboço...');
      conteudo = await generateSermonOutline({
        livro,
        capitulo,
        versiculo,
        tipo: tipo as any,
        titulo,
        publicoAlvo: publicoAlvo || 'Comunidade geral',
        textoVersiculo,
      });
      console.log('✅ Esboço gerado com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao gerar esboço:', error.message);
      console.error('Stack:', error.stack);

      await db.insert(esbocos).values({
        id: esbocoId,
        userId,
        livro,
        capitulo,
        versiculo,
        tipo,
        titulo,
        publicoAlvo,
        status: 'failed',
        erro: error.message || 'Erro ao gerar com IA',
      });

      return NextResponse.json(
        {
          error: 'Erro ao gerar esboço',
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Save to database
    await db.insert(esbocos).values({
      id: esbocoId,
      userId,
      livro,
      capitulo,
      versiculo,
      tipo,
      titulo,
      publicoAlvo,
      conteudoJson: JSON.stringify(conteudo),
      status: 'completed',
    });

    return NextResponse.json({
      esbocoId,
      jobId,
      status: 'completed',
    });
  } catch (error: any) {
    console.error('Error generating esboço:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar requisição' },
      { status: 500 }
    );
  }
}
