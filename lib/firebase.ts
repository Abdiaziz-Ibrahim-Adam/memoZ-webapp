// lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import Constants from "expo-constants";

// We load native auth bits only if they exist (so web doesn't crash)
let initializeAuth: any;
let getReactNativePersistence: any;
let AsyncStorage: any;

try {
  initializeAuth = require("firebase/auth").initializeAuth;
  getReactNativePersistence = require("firebase/auth/react-native").getReactNativePersistence;
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {
  // On web these may not exist; that's fine.
}

type Extra = {
  FIREBASE_API_KEY?: string;
  FIREBASE_AUTH_DOMAIN?: string;
  FIREBASE_PROJECT_ID?: string;
  FIREBASE_STORAGE_BUCKET?: string;
  FIREBASE_MESSAGING_SENDER_ID?: string;
  FIREBASE_APP_ID?: string;
};

// Works across Expo Web / Go / Dev Client
const extra: Extra =
  (Constants as any)?.expoConfig?.extra ??
  (Constants as any)?.manifest2?.extra ??
  (Constants as any)?.manifest?.extra ??
  {};

function need(k: keyof Extra) {
  if (!extra[k]) throw new Error(`Missing ${k}. Check .env and app.config.js`);
}

(["FIREBASE_API_KEY","FIREBASE_AUTH_DOMAIN","FIREBASE_PROJECT_ID","FIREBASE_STORAGE_BUCKET","FIREBASE_MESSAGING_SENDER_ID","FIREBASE_APP_ID"] as const).forEach(need);

const firebaseConfig = {
  apiKey: extra.FIREBASE_API_KEY!,
  authDomain: extra.FIREBASE_AUTH_DOMAIN!,
  projectId: extra.FIREBASE_PROJECT_ID!,
  storageBucket: extra.FIREBASE_STORAGE_BUCKET!, // e.g. memoz-cf8dd.appspot.com
  messagingSenderId: extra.FIREBASE_MESSAGING_SENDER_ID!,
  appId: extra.FIREBASE_APP_ID!,
};

let _app: any;
let _db: any;
let _auth: any;

export function getFirebase() {
  if (!_app) {
    _app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    _db = getFirestore(_app);

    // Only try native auth if the modules are available (i.e., on device)
    if (initializeAuth && getReactNativePersistence && AsyncStorage) {
      try {
        _auth = initializeAuth(_app, {
          persistence: getReactNativePersistence(AsyncStorage),
        });
      } catch (e) {
        console.warn("Auth init failed (continuing without auth):", e);
      }
    }
  }
  return { app: _app, db: _db, auth: _auth };
}

// Convenience named exports
export const db = (() => getFirebase().db)();
export const auth = (() => getFirebase().auth)();
