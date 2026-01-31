import { createContext, useEffect, useState } from "react";
import { errorLog, debugLog } from "../utils/logger";

const AuthContext = createContext(null);

// we need to fetch the user so use a wrapper as export
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      try {
        const response = await fetch(
          import.meta.env.VITE_BACKEND_URL + '/user/me',
          { credentials: 'include' }
        );

        if (response.ok) {
          const user = await response.json();
          setUser(user)
        } else {
          debugLog(`Auth failed: ${response.status} - ${response.statusText}`)
          setUser(null)
        }
      } catch (error) {
        errorLog(`Failed user fetch: ${error}`)
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthProvider, AuthContext }