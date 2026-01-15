import Home from "../pages/Home.jsx"
import { BrowserRouter, Routes, Route } from "react-router"
import OAuthCallback from "../pages/OAuthCallback.jsx"
import {useEffect} from "react"

function App() {
  // Wake up backend
  useEffect(() => {
    if (import.meta.env.VITE_BACKEND_URL) {
      fetch(import.meta.env.VITE_BACKEND_URL, {
        method: "GET",
        cache: "no-cache",
      }).catch(() => { });
    }

  }, []);

  return <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path={import.meta.env.VITE_AUTH_CALLBACK_URL} element={<OAuthCallback />} />
    </Routes>
  </BrowserRouter>
}

export default App
