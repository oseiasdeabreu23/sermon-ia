import { db } from './db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';

export async function checkAdminByFirebaseUid(firebaseUid: string): Promise<boolean> {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, firebaseUid));

    return result.length > 0 && result[0].isAdmin === 1;
  } catch (error) {
    return false;
  }
}

export async function getAdminUser(firebaseUidOrEmail: string) {
  try {
    // Tenta primeiro por Firebase UID
    let result = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, firebaseUidOrEmail));

    // Se não encontrar e parece um email, tenta por email
    if (result.length === 0 && firebaseUidOrEmail.includes('@')) {
      result = await db
        .select()
        .from(users)
        .where(eq(users.email, firebaseUidOrEmail));
    }

    if (result.length === 0 || result[0].isAdmin !== 1) {
      return null;
    }

    return result[0];
  } catch (error) {
    return null;
  }
}
