import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { Task } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyC59HV4_pYHNebXpPlugXDTsFqtwmNaSOk",
  authDomain: "brain-dump-f2e60.firebaseapp.com",
  projectId: "brain-dump-f2e60",
  storageBucket: "brain-dump-f2e60.firebasestorage.app",
  messagingSenderId: "147479928446",
  appId: "1:147479928446:web:cf7be0d1d44d832501c22f",
  measurementId: "G-1BDSVM3YF6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

// Auth functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};


export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// User data interface
export interface UserData {
  tasks: Task[];
  preferences: {
    theme?: 'light' | 'dark';
  };
  lastUpdated: any;
}

// Firestore functions
export const saveUserData = async (userId: string, tasks: Task[]) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      tasks,
      lastUpdated: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
};

export const getUserData = async (userId: string): Promise<Task[] | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data().tasks || [];
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

export const subscribeToUserData = (
  userId: string, 
  callback: (tasks: Task[]) => void
) => {
  const userRef = doc(db, 'users', userId);
  return onSnapshot(
    userRef, 
    (doc) => {
      if (doc.exists()) {
        callback(doc.data().tasks || []);
      }
    },
    (error) => {
      console.error('Error in real-time subscription:', error);
    }
  );
};
