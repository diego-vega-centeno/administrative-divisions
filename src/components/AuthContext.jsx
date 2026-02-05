import { createContext, useEffect, useState } from "react";
import logger from "../utils/logger";

const AuthContext = createContext(null);
let logout = null;

// we need to fetch the user so use a wrapper as export
function AuthProvider({ children }) {
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
          logger.info(`Auth failed: ${response.status} - ${response.statusText}`)
          setUserData(null)
        }
      } catch (error) {
        logger.error(`Failed user fetch: ${error}`)
      } finally {
        setLoading(false);
      }
    };

    // set logout from outer scope
    // so we can export it from this module and reference the setUserData
    logout = () => setUserData(null);

    getUserData();
  }, []);

  return (
    <AuthContext.Provider value={{ userData, setUserData, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthProvider, AuthContext, logout }