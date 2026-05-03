import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig'; 
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Context define karna
const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged tab fire hota hai jab user login/logout kare ya page refresh ho
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true); // Data fetch karna shuru
      
      if (currentUser) {
        setUser(currentUser);
        
        try {
          // Firestore se user ka data nikalna[cite: 1]
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Check: kya status 'active' hai?[cite: 1]
            if (userData.subscriptionStatus === "active") {
              setIsSubscribed(true);
            } else {
              setIsSubscribed(false);
            }
          } else {
            // Agar doc hi nahi hai, toh subscribed nahi hai
            setIsSubscribed(false);
          }
        } catch (error) {
          console.error("Error fetching subscription status:", error);
          setIsSubscribed(false);
        }
      } else {
        // User logout ho chuka hai[cite: 1]
        setUser(null);
        setIsSubscribed(false);
      }
      
      setLoading(false); // Sab checks khatam, ab app dikhao[cite: 1]
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isSubscribed, loading }}>
      {!loading && children} 
    </AuthContext.Provider>
  );
};

// Custom hook banaya hai taaki components mein asani se use ho sake[cite: 1]
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};