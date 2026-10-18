import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  orderBy,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, WalletTransaction } from '../types/tournament';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  userTransactions: WalletTransaction[];
  loading: boolean;
  signup: (email: string, pass: string, ign: string, ffUid: string, phone?: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userTransactions, setUserTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync auth state & listen to individual player document in real-time
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;
    let unsubscribeTxs: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      // Clean up previous listeners
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }
      if (unsubscribeTxs) {
        unsubscribeTxs();
        unsubscribeTxs = null;
      }

      setUser(currentUser);

      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);

        // Ensure user document exists or create initial one
        try {
          const snap = await getDoc(userDocRef);
          if (!snap.exists()) {
            const initialProfile: UserProfile = {
              id: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Player',
              ffUid: '10' + Math.floor(10000000 + Math.random() * 90000000),
              walletBalance: 0,
              role: 'player',
              registeredTournaments: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, initialProfile);
          }
        } catch (e) {
          console.warn('User doc check/creation warning:', e);
        }

        // Attach real-time listener so wallet balance updates instantly when Admin approves deposit!
        unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          }
        }, (err) => {
          console.error('Error listening to user profile:', err);
        });

        // Listen to individual transactions ledger
        try {
          const txsColRef = collection(db, 'users', currentUser.uid, 'transactions');
          unsubscribeTxs = onSnapshot(txsColRef, (snapshot) => {
            const txs: WalletTransaction[] = [];
            snapshot.forEach((d) => {
              txs.push({ id: d.id, ...d.data() } as WalletTransaction);
            });
            // Sort by latest first
            txs.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
            setUserTransactions(txs);
          }, (err) => {
            console.error('Error listening to transactions:', err);
          });
        } catch (err) {
          console.warn('Transactions listener error:', err);
        }
      } else {
        setUserProfile(null);
        setUserTransactions([]);
      }

      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribeTxs) unsubscribeTxs();
    };
  }, []);

  const signup = async (
    email: string,
    pass: string,
    ign: string,
    ffUid: string,
    phone?: string
  ) => {
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const uid = credential.user.uid;

    const newProfile: UserProfile = {
      id: uid,
      email: email.trim(),
      displayName: ign.trim() || 'FF・Contender',
      ffUid: ffUid.trim() || '10' + Math.floor(10000000 + Math.random() * 90000000),
      phone: phone?.trim() || '',
      walletBalance: 0, // Starts at 0; player deposits via EasyPaisa/JazzCash, approved by Admin
      role: 'player',
      registeredTournaments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', uid), newProfile);
    setUserProfile(newProfile);
  };

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), pass);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
    setUserTransactions([]);
  };

  const updateProfileData = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        userTransactions,
        loading,
        signup,
        login,
        logout,
        updateProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
