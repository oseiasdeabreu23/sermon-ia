'use client';

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth as getFirebaseAuth, Auth } from 'firebase/auth';

let cachedAuth: Auth | null = null;
let cachedApp: any = null;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('🔍 Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? `✓ (${firebaseConfig.apiKey.slice(0, 10)}...)` : '✗ MISSING',
  authDomain: firebaseConfig.authDomain || '✗ MISSING',
  projectId: firebaseConfig.projectId || '✗ MISSING',
  storageBucket: firebaseConfig.storageBucket || '✗ MISSING',
  messagingSenderId: firebaseConfig.messagingSenderId || '✗ MISSING',
  appId: firebaseConfig.appId || '✗ MISSING',
});

function initializeFirebase() {
  if (typeof window === 'undefined') {
    return null;
  }

  if (cachedAuth && cachedApp) {
    return { auth: cachedAuth, app: cachedApp };
  }

  try {
    if (getApps().length === 0) {
      console.log('📱 Initializing Firebase with config:', firebaseConfig);
      cachedApp = initializeApp(firebaseConfig);
      console.log('✅ Firebase app initialized');
    } else {
      cachedApp = getApp();
      console.log('✅ Using existing Firebase app');
    }

    cachedAuth = getFirebaseAuth(cachedApp);
    console.log('✅ Firebase Auth initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    throw error;
  }

  return { auth: cachedAuth, app: cachedApp };
}

export function getAuth(): Auth {
  try {
    if (!cachedAuth) {
      initializeFirebase();
    }
    if (!cachedAuth) {
      throw new Error('Firebase Auth initialization failed');
    }
    return cachedAuth;
  } catch (error) {
    console.error('❌ Error getting auth:', error);
    throw error;
  }
}
