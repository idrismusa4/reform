"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  Suspense,
} from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { TFirestoreUser } from "@/types/user";
import { doc, onSnapshot } from "firebase/firestore";
import FullPageLoader from "@/components/FullPageLoader";
import { usePathname, useSearchParams } from "next/navigation";

// Define the shape of your context
interface AuthContextType {
  user: TFirestoreUser | null;
  setUser: React.Dispatch<React.SetStateAction<TFirestoreUser | null>>;
  loading: boolean;
  loginUrl: string;
  signupUrl: string;
  updateUserProfile: (user: Partial<TFirestoreUser>) => void;
  logout: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<TFirestoreUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const pathname = usePathname(); // Get the current path, e.g., "/dashboard"
  const searchParams = useSearchParams(); // Get the current query parameters

  // Construct query parameters string
  const params = new URLSearchParams(searchParams);

  // Build the redirect URL: path + query params
  const redirect_url = `${pathname}?${params.toString()}`;

  // Construct the login URL with the redirect_url
  const loginUrl = `/auth/login?redirect_url=${encodeURIComponent(
    redirect_url
  )}&${params.toString()}`;

  // Construct the login URL with the redirect_url
  const signupUrl = `/auth/signup?redirect_url=${encodeURIComponent(
    redirect_url
  )}&${params.toString()}`;

  const updateUserProfile = (user: Partial<TFirestoreUser>) => {
    console.log(user);
  };

  const logout = () => signOut(auth);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (firebaseUser: User | null) => {
        setLoading(true);
        if (firebaseUser) {
          const userDocRef = doc(db, "users", firebaseUser.uid);

          // Listen to real-time updates of the user's Firestore document
          const unsubscribeFirestore = onSnapshot(userDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
              setUser(docSnapshot.data() as TFirestoreUser); // Update user state with real-time data
            } else {
              setUser(null);
            }
            setLoading(false);
          });

          return () => {
            unsubscribeFirestore(); // Unsubscribe from Firestore listener
          };
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => unsubscribeAuth(); // Unsubscribe from auth state listener
  }, []);

  return (
    <Suspense fallback={<FullPageLoader />}>
      <AuthContext.Provider
        value={{
          user,
          setUser,
          loading,
          loginUrl,
          signupUrl,
          updateUserProfile,
          logout,
        }}
      >
        {!loading ? children : <FullPageLoader />}
      </AuthContext.Provider>
    </Suspense>
  );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
