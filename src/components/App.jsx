import Home from "../pages/Home.jsx"
import { BrowserRouter, Routes, Route } from "react-router"
import OAuthCallback from "../pages/OAuthCallback.jsx"
import { useEffect } from "react"
import { errorLog } from "../utils/logger.js"

function App() {
  // Wake up backend
  useEffect(() => {
    // test favorites get
    // fetch('http://localhost:3000/api/favorites', {
    //   method: "GET",
    //   credentials: "include"
    // }).then(response => response.json())
    //   .then(data => console.log('favorites: ', data))
    //   .catch(error => {
    //     console.log('error: ', error)
    //   });

    if (import.meta.env.VITE_BACKEND_URL) {
      fetch(import.meta.env.VITE_BACKEND_URL + '/health', {
        method: "GET",
        cache: "no-cache",
      }).catch((error) => { errorLog(`Could not wake up server: ${error}`) });
    }

  }, []);
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
