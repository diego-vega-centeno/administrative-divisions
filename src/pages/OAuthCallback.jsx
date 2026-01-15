import { useEffect } from "react";
import { useNavigate } from "react-router";
import { debugLog, errorLog } from "../utils/logger";

export default function OAuthCallback() {
  const navigate = useNavigate();
  useEffect(() => {

    let token = localStorage.getItem('authToken');

    if (token) {
      debugLog(`Token found, redirecting...`);
      navigate('/');
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    token = urlParams.get('token');
    if (token) {
      debugLog(`Token received, storing and redirecting...`);
      localStorage.setItem('authToken', token);
      navigate('/');
    } else {
      errorLog('No token received from OAuth');
      navigate('/login?error=oauth_failed');
    }
  }, []);

  return <div>Processing authentication...</div>
}