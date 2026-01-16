import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { debugLog, errorLog } from "../utils/logger";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let token = localStorage.getItem('token');

    if (token) {
      debugLog(`Token found: redirecting...`);
      navigate('/');
      return;
    }

    token = searchParams.get('token');
    if (token) {
      debugLog(`Token received: storing and redirecting...`);
      localStorage.setItem('token', token);
      navigate('/');
    } else {
      errorLog('No token received from OAuth');
      navigate('/?error=oauth_failed');
    }
  }, []);

  return <div>Processing authentication...</div>
}