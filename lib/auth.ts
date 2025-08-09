// lib/auth.ts
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  linkWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
  Firestore,
} from "firebase/firestore";
import { auth, db } from "./firebase";

/** Convert a username to a synthetic email Firebase accepts. */
export function usernameToEmail(username: string) {
  const clean = username.trim().toLowerCase();
  return `${clean}@memoz.app`; // brand domain
}

/** Reserve a username atomically: /usernames/{name} -> { uid } */
async function reserveUsername(dbRef: Firestore, username: string, uid: string) {
  const key = username.trim().toLowerCase();
  const ref = doc(dbRef, "usernames", key);

  await runTransaction(dbRef, async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists()) throw new Error("Username is taken. Try another one.");
    tx.set(ref, { uid, createdAt: serverTimestamp() });
  });
}

/** Create or update user profile doc. */
async function upsertUserDoc(dbRef: Firestore, uid: string, username: string) {
  const ref = doc(dbRef, "users", uid);
  await setDoc(
    ref,
    { username, updatedAt: serverTimestamp(), createdAt: serverTimestamp() },
    { merge: true }
  );
}

/** Register with username + password (upgrades anonymous user if present). */
export async function registerWithUsername(username: string, password: string) {
  const a = getAuth(); // app already initialized in lib/firebase
  const email = usernameToEmail(username);

  if (a.currentUser && a.currentUser.isAnonymous) {
    // upgrade guest -> permanent
    const cred = EmailAuthProvider.credential(email, password);
    const { user } = await linkWithCredential(a.currentUser, cred);
    await reserveUsername(db, username, user.uid);
    await updateProfile(user, { displayName: username });
    await upsertUserDoc(db, user.uid, username);
    return user;
  } else {
    const { user } = await createUserWithEmailAndPassword(a, email, password);
    await reserveUsername(db, username, user.uid);
    await updateProfile(user, { displayName: username });
    await upsertUserDoc(db, user.uid, username);
    return user;
  }
}

/** Sign in with username + password. */
export async function loginWithUsername(username: string, password: string) {
  const a = getAuth();
  const email = usernameToEmail(username);
  const { user } = await signInWithEmailAndPassword(a, email, password);
  return user;
}

/** Is a username available? */
export async function isUsernameAvailable(username: string) {
  const key = username.trim().toLowerCase();
  const ref = doc(db, "usernames", key);
  const snap = await getDoc(ref);
  return !snap.exists();
}
