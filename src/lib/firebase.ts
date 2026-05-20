'use client';

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth as getFirebaseAuth, Auth } from 'firebase/auth';

let cachedAuth: Auth | null = null;
let cachedApp: any = null;

function initializeFirebase() {
  if (typeof window === 'undefined') {
    return null;
  }

  if (cachedAuth && cachedApp) {
    return { auth: cachedAuth, app: cachedApp };
  }

  console.log('🔍 Environment Variables Available:', {
    NEXT_PUBLIC_FIREBASE_API_KEY: typeof process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: typeof process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: typeof process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: typeof process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: typeof process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: typeof process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  console.log('🔍 Firebase Config Values:', {
    apiKey: firebaseConfig.apiKey ? `✓ (${firebaseConfig.apiKey.slice(0, 10)}...)` : '✗ MISSING',
    authDomain: firebaseConfig.authDomain || '✗ MISSING',
    projectId: firebaseConfig.projectId || '✗ MISSING',
    storageBucket: firebaseConfig.storageBucket || '✗ MISSING',
    messagingSenderId: firebaseConfig.messagingSenderId || '✗ MISSING',
    appId: firebaseConfig.appId || '✗ MISSING',
  });

  console.log('📦 Full config object:', firebaseConfig);

  const requiredFields = ['apiKey', 'authDomain', 'projectId'];
  const missingFields = requiredFields.filter((field) => !firebaseConfig[field as keyof typeof firebaseConfig]);

  if (missingFields.length > 0) {
    console.error('❌ Firebase Configuration Missing:', missingFields);
    return null;
  }

  try {
    if (getApps().length === 0) {
      cachedApp = initializeApp(firebaseConfig);
      console.log('✅ Firebase initialized successfully');
    } else {
      cachedApp = getApp();
      console.log('✅ Firebase already initialized');
    }
    cachedAuth = getFirebaseAuth(cachedApp);
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    return null;
  }

  return { auth: cachedAuth, app: cachedApp };
}

export function getAuth(): Auth {
  if (!cachedAuth) {
    initializeFirebase();
  }
  return cachedAuth as Auth;
}
