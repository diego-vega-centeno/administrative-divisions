import { createContext, useEffect, useState } from "react";
import { errorLog, debugLog } from "../utils/logger";

const AuthContext = createContext(null);

// we need to fetch the user so use a wrapper as export
const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUserData() {
      try {
        const response = await fetch(
          import.meta.env.VITE_BACKEND_URL + '/user/me',
          { credentials: 'include' }
        );

        if (response.ok) {
          const dataResponse = await response.json();
          setUserData(dataResponse.data)
        } else {
          debugLog(`Auth failed: ${response.status} - ${response.statusText}`)
          setUserData(null)
        }
      } catch (error) {
        errorLog(`Failed user fetch: ${error}`)
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  return (
    <AuthContext.Provider value={{ userData, setUserData, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthProvider, AuthContext }