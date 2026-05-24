import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Timestamp } from 'firebase/firestore';
import { getUserProfile, createUserProfile, getUserByEmail } from '../services/carService';

interface AuthContextType {
  user: User | null;
  currentUser: FirebaseUser | null;
  userRole: string | null;
  userEmail: string | null;
  userName: string | null;
  login: (email: string, password: string) => Promise<UserRole>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'yashkamble200325@gmail.com';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setCurrentUser(firebaseUser);
      if (firebaseUser && firebaseUser.email) {
        const normalizedEmail = firebaseUser.email.toLowerCase();
        
        // 1. Fetch user doc
        let profile: any = null;
        try {
          profile = await getUserProfile(firebaseUser.uid);
          if (!profile) {
            profile = await getUserProfile(normalizedEmail);
            if (profile) {
              // Migrate email doc to UID doc
              await createUserProfile(firebaseUser.uid, {
                ...profile,
                uid: firebaseUser.uid,
                email: normalizedEmail
              });
            }
          }
          if (!profile) {
            profile = await getUserByEmail(normalizedEmail);
          }
        } catch (err) {
          console.error("Failed to fetch user profile, creating default:", err);
        }

        let role: UserRole = 'user';
        let name = firebaseUser.displayName || normalizedEmail.split('@')[0];
        let dealerId = normalizedEmail.endsWith('@quotalo.com') ? normalizedEmail.split('@')[0] : undefined;

        if (profile) {
          role = profile.role as UserRole;
          name = profile.name || name;
          dealerId = profile.dealerId || dealerId;
        } else {
          // Initialize new profile
          role = normalizedEmail === ADMIN_EMAIL ? 'admin' : 
                 (normalizedEmail.includes('dealer') || normalizedEmail.endsWith('@quotalo.com')) ? 'dealer' : 'user';
          
          try {
            await createUserProfile(firebaseUser.uid, {
              email: normalizedEmail,
              name,
              role,
              uid: firebaseUser.uid,
              dealerId
            });
          } catch (createErr) {
            console.error("Failed to create user profile in onAuthStateChanged:", createErr);
          }
        }

        // Security override to prevent role elevation/leak issues
        if (role === 'admin' && normalizedEmail !== ADMIN_EMAIL) {
          role = 'dealer';
        }

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role,
          name,
          dealerId
        });

        setUserRole(role);
        setUserEmail(normalizedEmail);
        setUserName(name);

        // Sync localStorage
        localStorage.setItem("userRole", role);
        localStorage.setItem("userEmail", normalizedEmail);
        localStorage.setItem("userName", name);
      } else {
        setUser(null);
        setUserRole(null);
        setUserEmail(null);
        setUserName(null);
        localStorage.removeItem("userRole");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<UserRole> => {
    try {
      const normalizedEmail = email.toLowerCase();
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = credential.user;
      
      let profile: any = null;
      try {
        profile = await getUserProfile(firebaseUser.uid);
        if (!profile) {
          profile = await getUserProfile(normalizedEmail) || await getUserByEmail(normalizedEmail);
        }
      } catch (err) {
        console.error("Failed to query profile in login, ignoring", err);
      }

      let role: UserRole = 'user';
      let name = normalizedEmail.split('@')[0];
      let dealerId = normalizedEmail.endsWith('@quotalo.com') ? normalizedEmail.split('@')[0] : undefined;

      if (profile) {
        role = profile.role as UserRole;
        name = profile.name || name;
        dealerId = profile.dealerId || dealerId;
      } else {
        role = normalizedEmail === ADMIN_EMAIL ? 'admin' : 
               (normalizedEmail.includes('dealer') || normalizedEmail.endsWith('@quotalo.com')) ? 'dealer' : 'user';
        
        try {
          await createUserProfile(firebaseUser.uid, {
            email: normalizedEmail,
            name,
            role,
            uid: firebaseUser.uid,
            dealerId,
            createdAt: Timestamp.now()
          });
        } catch (createErr) {
          console.error("Failed to save profile during login:", createErr);
        }
      }
      
      // Security override to prevent role elevation/leak issues
      if (role === 'admin' && normalizedEmail !== ADMIN_EMAIL) {
        role = 'dealer';
      }
      
      setUser({
        uid: firebaseUser.uid,
        email: normalizedEmail,
        role,
        name,
        dealerId
      });

      setUserRole(role);
      setUserEmail(normalizedEmail);
      setUserName(name);

      // Store in localStorage for persistence
      localStorage.setItem("userRole", role);
      localStorage.setItem("userEmail", normalizedEmail);
      localStorage.setItem("userName", name);
      
      return role;
    } catch (error: any) {
      console.error("Login error in AuthContext:", error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    const normalizedEmail = email.toLowerCase();
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const role: UserRole = normalizedEmail === ADMIN_EMAIL ? 'admin' : 
                        (normalizedEmail.includes('dealer') || normalizedEmail.endsWith('@quotalo.com')) ? 'dealer' : 'user';
    
    // Security override to prevent role elevation/leak issues
    const verifiedRole = (role === 'admin' && normalizedEmail !== ADMIN_EMAIL) ? 'dealer' : role;
    
    let dealerId = normalizedEmail.endsWith('@quotalo.com') ? normalizedEmail.split('@')[0] : undefined;

    try {
      await createUserProfile(credential.user.uid, {
        email: normalizedEmail,
        name,
        role: verifiedRole,
        uid: credential.user.uid,
        dealerId
      });
    } catch (createErr) {
      console.error("Failed to create profile during registration:", createErr);
    }

    setUser({
      uid: credential.user.uid,
      email: normalizedEmail,
      role: verifiedRole,
      name,
      dealerId
    });

    setUserRole(verifiedRole);
    setUserEmail(normalizedEmail);
    setUserName(name);

    // Store in localStorage
    localStorage.setItem("userRole", verifiedRole);
    localStorage.setItem("userEmail", normalizedEmail);
    localStorage.setItem("userName", name);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserRole(null);
    setUserEmail(null);
    setUserName(null);
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      currentUser,
      userRole,
      userEmail,
      userName,
      login, 
      register, 
      logout, 
      isLoading,
      loading: isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
