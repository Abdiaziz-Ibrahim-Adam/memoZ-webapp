import { db } from './firebase';
import {
  collection,
  query,
  where,
  getDocs,
  DocumentData,
} from 'firebase/firestore';

export const getTasksForDate = async (date: string, type?: string) => {
  try {
    const constraints = [where('date', '==', date)];
    if (type) constraints.push(where('type', '==', type));

    const q = query(collection(db, 'tasks'), ...constraints);
    const snapshot = await getDocs(q);

    const tasks: DocumentData[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return tasks;
  } catch (error) {
    console.error('❌ Firestore-fel:', error);
    return [];
  }
};
