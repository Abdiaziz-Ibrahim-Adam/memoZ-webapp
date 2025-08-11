// lib/firebase.ts
import { initializeApp, getApps, FirebaseApp } from "firebase/app";

import { getFirestore, Firestore } from "firebase/firestore";
import Constants from "expo-constants";

// Try to load native-only auth; if not present (web), we'll fall back to getAuth(app)
let initializeAuth: any;
let getReactNativePersistence: any;
let AsyncStorage: any;
let getAuthWeb: any;

try {
  initializeAuth = require("firebase/auth").initializeAuth;
  getAuthWeb = require("firebase/auth").getAuth;
  getReactNativePersistence = require("firebase/auth/react-native").getReactNativePersistence;
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {
  // Web build path — fallback handled below
}

type Extra = {
  FIREBASE_API_KEY?: string;
  FIREBASE_AUTH_DOMAIN?: string;
  FIREBASE_PROJECT_ID?: string;
  FIREBASE_STORAGE_BUCKET?: string;
  FIREBASE_MESSAGING_SENDER_ID?: string;
  FIREBASE_APP_ID?: string;
};

const extra: Extra =
  (Constants as any)?.expoConfig?.extra ??
  (Constants as any)?.manifest2?.extra ??
  (Constants as any)?.manifest?.extra ??
  {};

function need(k: keyof Extra) {
  if (!extra[k]) throw new Error(`Missing ${k}. Check .env and app.config.js`);
}

(
  [
    "FIREBASE_API_KEY",
    "FIREBASE_AUTH_DOMAIN",
    "FIREBASE_PROJECT_ID",
    "FIREBASE_STORAGE_BUCKET",
    "FIREBASE_MESSAGING_SENDER_ID",
    "FIREBASE_APP_ID",
  ] as const
).forEach(need);

const firebaseConfig = {
  apiKey: extra.FIREBASE_API_KEY!,
  authDomain: extra.FIREBASE_AUTH_DOMAIN!,
  projectId: extra.FIREBASE_PROJECT_ID!,
  storageBucket: extra.FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: extra.FIREBASE_MESSAGING_SENDER_ID!,
  appId: extra.FIREBASE_APP_ID!,
};

let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _auth: any | null = null;

export function getFirebase() {
  if (!_app) {
    _app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    _db = getFirestore(_app);

    // Native auth if available
    if (initializeAuth && getReactNativePersistence && AsyncStorage) {
      try {
        _auth = initializeAuth(_app, {
          persistence: getReactNativePersistence(AsyncStorage),
        });
      } catch (e) {
        console.warn("Auth init (native) failed, falling back to web getAuth:", e);
      }
    }

    // Fallback for web (or if native init failed)
    if (!_auth && getAuthWeb) {
      try {
        _auth = getAuthWeb(_app);
      } catch (e) {
        console.warn("Web getAuth failed:", e);
      }
    }
  }
  return { app: _app!, db: _db!, auth: _auth };
}

// Convenience named exports
export const app = getFirebase().app;
export const db = getFirebase().db;
export const auth = getFirebase().auth;
