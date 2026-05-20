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

export async function getAdminUser(firebaseUid: string) {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, firebaseUid));

    if (result.length === 0 || result[0].isAdmin !== 1) {
      return null;
    }

    return result[0];
  } catch (error) {
    return null;
  }
}
