import { useEffect, useState } from "react";
import { errorLog, debugLog } from './logger.js';

export default function useSession() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch(
          import.meta.env.VITE_BACKEND_URL + '/user/me',
          {
            credentials: 'include'
          }
        )

        if (response.ok) {
          const user = await response.json();
          setUser(user)
        } else {
          debugLog(`Auth failed: ${response.status} - ${response.statusText}`)
          setUser(null)
        }
      } catch (error) {
        errorLog(`Failed fetch: ${error}`)
        setUser(null)
      } finally {
        setLoading(false);
      }
    }

    checkUser();
  }, []);

  return { user, loading };
}