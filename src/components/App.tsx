import Home from "../pages/Home"
import About from "../pages/About"
import { BrowserRouter, Routes, Route } from "react-router"
import { AuthProvider } from "./AuthContext"
import { MapActionsProvider } from './MapActionsContext'

function App() {

  return (
    <MapActionsProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </MapActionsProvider>
  )
}

export default App
