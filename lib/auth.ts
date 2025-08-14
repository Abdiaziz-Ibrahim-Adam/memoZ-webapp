// lib/auth.ts
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";

function normalizeUsername(u: string) {
  return u.trim().toLowerCase();
}

export function usernameToEmail(username: string) {
  return `${normalizeUsername(username)}@memoz.app`;
}

export async function isUsernameAvailable(username: string) {
  try {
    const key = normalizeUsername(username);
    const snap = await getDoc(doc(db, "usernames", key));
    return !snap.exists();
  } catch (err) {
    console.error("USERNAME CHECK ERROR", err);
    throw new Error("Could not check username availability. Try again.");
  }
}

async function reserveUsernameAtomic(username: string, uid: string) {
  const key = normalizeUsername(username);
  const ref = doc(db, "usernames", key);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists()) {
      throw new Error("That username is already taken.");
    }
    tx.set(ref, { uid, createdAt: serverTimestamp() });
  });
}

export async function registerWithUsername(
  username: string,
  password: string,
  fullName: string
) {
  try {
    const clean = normalizeUsername(username);
    const email = usernameToEmail(clean);

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: fullName });
    await reserveUsernameAtomic(clean, cred.user.uid);
    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid,
      fullName,
      username: clean,
      email,
      createdAt: serverTimestamp(),
    });

    return cred.user;
  } catch (err: any) {
    console.error("REGISTER ERROR", err);
    if (err?.code === "auth/email-already-in-use") {
      throw new Error("An account already exists with that username.");
    }
    if (err?.code === "auth/weak-password") {
      throw new Error("Password should be at least 6 characters.");
    }
    if (err?.message) throw err;
    throw new Error("Could not create account. Please try again.");
  }
}

export async function loginWithUsername(username: string, password: string) {
  try {
    const email = usernameToEmail(username);
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  } catch (err: any) {
    console.error("LOGIN ERROR", err);
    if (err?.code === "auth/invalid-credential" || err?.code === "auth/wrong-password") {
      throw new Error("Wrong password. Please try again.");
    }
    if (err?.code === "auth/user-not-found") {
      throw new Error("No account found with that username.");
    }
    if (err?.message) throw err;
    throw new Error("Could not sign in. Please try again.");
  }
}
