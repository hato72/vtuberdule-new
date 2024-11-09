import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userPreferences: UserPreferences | null;
  updateUserPreferences: (data: Partial<UserPreferences>) => Promise<void>;
}

export interface UserPreferences {
  searchHistory: string[];
  selectedGroups: string[];
  lastVisited: string[];
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userPreferences: null,
  updateUserPreferences: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserPreferences(userDoc.data() as UserPreferences);
        } else {
          const initialPreferences: UserPreferences = {
            searchHistory: [],
            selectedGroups: [],
            lastVisited: [],
          };
          await setDoc(doc(db, 'users', user.uid), initialPreferences);
          setUserPreferences(initialPreferences);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateUserPreferences = async (data: Partial<UserPreferences>) => {
    if (!user) return;
    
    const updatedPreferences = {
      ...userPreferences,
      ...data,
    };
    
    await setDoc(doc(db, 'users', user.uid), updatedPreferences, { merge: true });
    setUserPreferences(updatedPreferences as UserPreferences);
  };

  return (
    <AuthContext.Provider value={{ user, loading, userPreferences, updateUserPreferences }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);