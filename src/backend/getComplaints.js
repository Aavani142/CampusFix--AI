import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config';

// Ensure that '../config' exports a properly initialized Firestore instance like:
// import { initializeApp } from 'firebase/app';
// import { getFirestore } from 'firebase/firestore';
// const firebaseConfig = { /* your config */ };
// const app = initializeApp(firebaseConfig);
// export const db = getFirestore(app);

/**
 * Fetch complaints submitted by a specific user
 * @param {string} uid - The Firebase Auth UID of the user
 * @returns {Promise<Array>} - List of complaint objects
 */
export async function getUserComplaints(uid) {
  if (!uid || typeof uid !== 'string') {
    console.error('Invalid UID provided');
    return [];
  }

  try {
    const q = query(collection(db, 'complaints'), where('userId', '==', uid));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data() || {};
      return {
        id: doc.id,
        ...data
      };
    });
  } catch (err) {
    console.error('Error fetching user complaints:', err);
    return [];
  }
}

