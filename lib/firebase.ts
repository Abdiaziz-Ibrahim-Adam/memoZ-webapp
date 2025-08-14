// lib/firebase.ts
import { Platform } from "react-native";
import Constants from "expo-constants";
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

// IMPORTANT: import from "firebase/auth" at top-level so the auth component registers.
import {
  getAuth,
  initializeAuth,
  setPersistence,
  browserLocalPersistence,
  Auth,
} from "firebase/auth";

// Native-only persistence
// (this import must NOT run on web, but it's OK to import — we only use it on native)
import { getReactNativePersistence } from "firebase/auth/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
let _auth: Auth | null = null;

export function getFirebase() {
  if (!_app) {
    _app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    _db = getFirestore(_app);

    // Auth: native uses initializeAuth + AsyncStorage; web uses getAuth + browserLocalPersistence
    try {
      if (Platform.OS === "web") {
        _auth = getAuth(_app);
        // Use browser persistence; ignore errors silently (e.g. in private mode)
        setPersistence(_auth, browserLocalPersistence).catch(() => {});
      } else {
        // On native, initializeAuth is required to set React Native persistence
        _auth = initializeAuth(_app, {
          persistence: getReactNativePersistence(AsyncStorage),
        });
      }
    } catch (e) {
      // Final fallback — should be rare
      console.warn("Auth init failed, falling back to getAuth:", e);
      _auth = getAuth(_app);
    }
  }
  return { app: _app!, db: _db!, auth: _auth! };
}

export const app = getFirebase().app;
export const db = getFirebase().db;
export const auth = getFirebase().auth;
