'use client';

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

let auth: Auth | null = null;
let app: any = null;

function initializeFirebase() {
  // Only initialize in browser
  if (typeof window === 'undefined') {
    return null;
  }

  // Return existing instance if already initialized
  if (auth && app) {
    return { auth, app };
  }

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  console.log('🔍 Firebase Config Debug:', {
    apiKey: firebaseConfig.apiKey ? `✓ (${firebaseConfig.apiKey.slice(0, 10)}...)` : '✗ MISSING',
    authDomain: firebaseConfig.authDomain ? `✓ (${firebaseConfig.authDomain})` : '✗ MISSING',
    projectId: firebaseConfig.projectId ? `✓ (${firebaseConfig.projectId})` : '✗ MISSING',
    storageBucket: firebaseConfig.storageBucket ? `✓ (${firebaseConfig.storageBucket})` : '✗ MISSING',
    messagingSenderId: firebaseConfig.messagingSenderId ? `✓ (${firebaseConfig.messagingSenderId})` : '✗ MISSING',
    appId: firebaseConfig.appId ? `✓ (${firebaseConfig.appId})` : '✗ MISSING',
  });

  // Validate required fields
  const requiredFields = ['apiKey', 'authDomain', 'projectId'];
  const missingFields = requiredFields.filter((field) => !firebaseConfig[field as keyof typeof firebaseConfig]);

  if (missingFields.length > 0) {
    console.error('❌ Firebase Configuration Missing:', missingFields);
    return null;
  }

  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase initialized successfully');
    } else {
      app = getApp();
      console.log('✅ Firebase already initialized');
    }
    auth = getAuth(app);
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    return null;
  }

  return { auth, app };
}

// Lazy initialize when first accessed
export function getFirebaseAuth(): Auth | null {
  if (!auth) {
    initializeFirebase();
  }
  return auth;
}

export { getFirebaseAuth as auth };

const firebaseModule = {
  get auth() {
    return getFirebaseAuth();
  },
};

export default firebaseModule;
