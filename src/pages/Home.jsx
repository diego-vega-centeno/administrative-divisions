import Header from '../components/Header.jsx'
import Main from '../components/Main.jsx'
import { useSearchParams } from "react-router";
import { useState, useEffect } from 'react';
import AlertDialog from '../components/AlertDialog.jsx';

export default function Home() {
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (error === 'oauth_failed') {
      setErrorMessage('Authentication failed');
    }
  }, [error]);

  return (
    <>
      <AlertDialog
        open={Boolean(errorMessage)}
        severity={"warning"}
        message={errorMessage}
        onClose={() => setErrorMessage(null)}
      />
      <Header />
      <Main />
    </>
  )
}