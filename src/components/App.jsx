import Home from "../pages/Home.jsx"
import { BrowserRouter, Routes, Route } from "react-router"
import OAuthCallback from "../pages/OAuthCallback.jsx"

function App() {
  return <BrowserRouter basename="/administrative-divisions">
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path={import.meta.env.VITE_AUTH_CALLBACK_URL} element={<OAuthCallback />} />
    </Routes>
  </BrowserRouter>
}

export default App
