import Home from "../pages/Home.jsx"
import { HashRouter, Routes, Route } from "react-router"
import OAuthCallback from "../pages/OAuthCallback.jsx"

function App() {
  return <HashRouter basename="/administrative-divisions">
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path={import.meta.env.VITE_AUTH_CALLBACK_URL} element={<OAuthCallback />} />
    </Routes>
  </HashRouter>
}

export default App
