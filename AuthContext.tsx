
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import firebase from 'firebase/compat/app'; // Import for compat types and providers
import 'firebase/compat/auth'; // Ensure firebase.auth is populated
import { auth as compatAuthService } from '../services/firebaseConfig'; // Import the compat auth instance

// FirebaseUser type will now be firebase.User
type FirebaseUser = firebase.User;

interface AuthContextType {
  currentUser: FirebaseUser | null;
  loadingAuth: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

  useEffect(() => {
    // onAuthStateChanged now uses the compatAuthService instance
    const unsubscribe = compatAuthService.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoadingAuth(false);
    });
    return unsubscribe; // Unsubscribe on unmount
  }, []);

  const signInWithGoogle = async () => {
    // Use compat GoogleAuthProvider
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      // Use signInWithPopup from the compatAuthService instance
      await compatAuthService.signInWithPopup(provider);
      // User will be set by onAuthStateChanged
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      // Handle error (e.g., display a message to the user)
    }
  };

  const signOutUser = async () => {
    try {
      // Use signOut from the compatAuthService instance
      await compatAuthService.signOut();
      // User will be set to null by onAuthStateChanged
    } catch (error) {
      console.error("Error during sign-out:", error);
      // Handle error
    }
  };

  const value = {
    currentUser,
    loadingAuth,
    signInWithGoogle,
    signOutUser,
  };

  return <AuthContext.Provider value={value}>{!loadingAuth && children}</AuthContext.Provider>;
};
