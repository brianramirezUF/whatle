'use client'
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/config/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  imgurTokens: {
    accessToken: string;
    refreshToken: string;
  } | null;
  loading: boolean;
  refreshImgurTokens: (uid: string, refreshToken: string) => Promise<{ accessToken: string, refreshToken: string } | null>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  imgurTokens: null,
  loading: true,
  refreshImgurTokens: async () => { return null }
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [imgurTokens, setImgurTokens] = useState<{
    accessToken: string;
    refreshToken: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshImgurTokens = async (uid: string, refreshToken: string) => {
    const refreshUrl = `/api/auth/imgur-callback?access_token=${encodeURIComponent(refreshToken)}&state=${encodeURIComponent(uid)}`;
    await fetch(refreshUrl);
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const updatedTokens = {
        accessToken: userData.imgurAccessToken,
        refreshToken: userData.imgurRefreshToken
      };
      setImgurTokens(updatedTokens);
      return updatedTokens;
    }
    return null;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setImgurTokens({
              accessToken: userData.imgurAccessToken || null,
              refreshToken: userData.imgurRefreshToken || null
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setImgurTokens(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    imgurTokens,
    loading,
    refreshImgurTokens
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}