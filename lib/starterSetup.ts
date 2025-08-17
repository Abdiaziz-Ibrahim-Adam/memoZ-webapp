// lib/starterSetup.ts
import { auth, db } from "./firebase";
import { doc, setDoc, collection } from "firebase/firestore";

// starter folders
const DEFAULT_FOLDERS = [
  { id: "medicine", name: "Medicine", type: "medicine", slots: 5 },
  { id: "grocery", name: "Groceries", type: "grocery", slots: 0 },
  { id: "todo", name: "To-Do", type: "todo", slots: 0 },
];

export async function createStarterFolders() {
  const user = auth.currentUser;
  if (!user) return;

  const foldersRef = collection(db, "users", user.uid, "folders");

  for (const folder of DEFAULT_FOLDERS) {
    const folderRef = doc(foldersRef, folder.id);

    await setDoc(folderRef, {
      name: folder.name,
      type: folder.type,
      createdAt: Date.now(),
      owner: user.uid,
    });

    if (folder.type === "medicine") {
      const slotsRef = collection(folderRef, "slots");
      for (let i = 1; i <= folder.slots; i++) {
        const slotRef = doc(slotsRef, `slot-${i}`);
        await setDoc(slotRef, {
          index: i,
          medicineName: "",
          dosage: "",
          time: "",
        });
      }
    }
  }
}
