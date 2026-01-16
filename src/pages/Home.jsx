import Header from '../components/Header.jsx'
import Main from '../components/Main.jsx'
import { useSearchParams } from "react-router";
import { useState, useEffect } from 'react';
import { Dialog, Alert } from '@mui/material';

export default function Home() {
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (error === 'oauth_failed') {
      setErrorMessage('Authentication failed');
    }
  }, [error]);

  const alertDialog = <>
    <Dialog
      open={Boolean(errorMessage)}
      disableScrollLock
    >
      <Alert
        severity="warning"
        onClose={() => setErrorMessage(null)}
      >
        {errorMessage}
      </Alert>
    </Dialog>
  </>

  return (
    <>
      {alertDialog}
      <Header />
      <Main />
    </>
  )
}