import { createContext, useEffect, useState } from "react";
import logger from "../utils/logger";

export interface AuthContextType {
  userData: any;
  setUserData: (data: any) => void;
  loading: boolean;
  wakeUpMessage: string | null;
  setWakeUpMessage: (message: string | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
let logout: (() => void) | null = null;

interface AuthProviderProps {
  children: React.ReactNode;
}

// we need to fetch the user so use a wrapper as export
function AuthProvider({ children }: AuthProviderProps) {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [wakeUpMessage, setWakeUpMessage] = useState<string | null>(null);

  useEffect(() => {
    let wakeUpTimeout: ReturnType<typeof setTimeout> | null = null;

    async function getUserData() {
      setLoading(true);
      setWakeUpMessage(null);

      wakeUpTimeout = setTimeout(() => {
        setWakeUpMessage(
          "Backend is asleep. Restarting, please wait a moment ...",
        );
      }, 1200);

      try {
        const response = await fetch(
          import.meta.env.VITE_BACKEND_URL + "/user/me",
          { credentials: "include" },
        );
        
        if (response.ok) {
          const dataResponse = await response.json();
          setUserData(dataResponse.data);
        } else {
          logger.info(
            `Auth failed: ${response.status} - ${response.statusText}`,
          );
          setUserData(null);
        }
      } catch (error) {
        logger.error(`Failed user fetch: ${error}`);
      } finally {
        if (wakeUpTimeout !== null) window.clearTimeout(wakeUpTimeout);
        setLoading(false);
        setWakeUpMessage(null);
      }
    }

    // set logout from outer scope
    // so we can export it from this module and reference the setUserData
    logout = () => setUserData(null);

    getUserData();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        userData,
        setUserData,
        loading,
        wakeUpMessage,
        setWakeUpMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProvider, AuthContext, logout };
