import { NextRequest, NextResponse } from 'next/server';
import { auth } from 'firebase-admin/app';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { db } from '@/lib/db';
import { esbocos } from '../../../../../db/schema';
import { gerarEsboço } from '@/lib/claude';
import { v4 as uuidv4 } from 'uuid';

// Initialize Firebase Admin
let firebaseApp: any;
if (!getApps().length) {
  firebaseApp = initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
} else {
  firebaseApp = getApps()[0];
}

const firebaseAuth = getAuth(firebaseApp);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, livro, capitulo, versiculo, tipo, titulo, publicoAlvo } = body;

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

    // Create esboço record
    const esbocoId = uuidv4();
    const now = new Date();

    // Generate with Claude
    let conteudo;
    try {
      conteudo = await gerarEsboço({
        livro,
        capitulo,
        versiculo,
        tipo,
        titulo,
        publicoAlvo,
        textoVersiculo: `${livro} ${capitulo}:${versiculo}`, // TODO: Get actual text
      });
    } catch (error: any) {
      await db.insert(esbocos).values({
        id: esbocoId,
        userId: firebaseUser.uid,
        livro,
        capitulo,
        versiculo,
        tipo,
        titulo,
        publicoAlvo,
        status: 'failed',
        erro: error.message,
      });

      return NextResponse.json(
        { error: 'Erro ao gerar esboço', details: error.message },
        { status: 500 }
      );
    }

    // Save to database
    await db.insert(esbocos).values({
      id: esbocoId,
      userId: firebaseUser.uid,
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
