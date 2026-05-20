import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getApps } from 'firebase-admin/app';
import { db } from '@/lib/db';
import { users } from '../../../../../db/schema';
import { eq } from 'drizzle-orm';

let firebaseAuth: any;
try {
  const apps = getApps();
  firebaseAuth = apps.length ? getAuth(apps[0]) : null;
} catch (error) {
  console.warn('Firebase Admin not available');
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({
        error: 'Sem autorização',
        details: 'Authorization header ausente ou inválido'
      }, { status: 401 });
    }

    const token = authHeader.substring(7);

    if (!firebaseAuth) {
      return NextResponse.json({
        error: 'Firebase Admin não configurado',
        firebaseAuthStatus: 'null'
      }, { status: 500 });
    }

    const decodedToken = await firebaseAuth.verifyIdToken(token);

    console.log('🔍 Token decodificado:', {
      uid: decodedToken.uid,
      email: decodedToken.email,
    });

    // Procura usuário por UID
    const userByUid = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, decodedToken.uid));

    console.log('Resultado por UID:', userByUid);

    // Procura usuário por email
    let userByEmail: any = [];
    if (decodedToken.email) {
      userByEmail = await db
        .select()
        .from(users)
        .where(eq(users.email, decodedToken.email));

      console.log('Resultado por email:', userByEmail);
    }

    return NextResponse.json({
      success: true,
      token: {
        uid: decodedToken.uid,
        email: decodedToken.email,
      },
      database: {
        userByUid: userByUid.length > 0 ? {
          email: userByUid[0].email,
          isAdmin: userByUid[0].isAdmin,
        } : null,
        userByEmail: userByEmail.length > 0 ? {
          email: userByEmail[0].email,
          isAdmin: userByEmail[0].isAdmin,
        } : null,
      },
      allUsers: (await db.select().from(users)).map(u => ({
        email: u.email,
        firebaseUid: u.firebaseUid,
        isAdmin: u.isAdmin,
      })),
    });
  } catch (error: any) {
    console.error('❌ Erro debug:', error);
    return NextResponse.json({
      error: error.message,
      details: error.code,
    }, { status: 500 });
  }
}
