import Home from "../pages/Home.jsx"
import { BrowserRouter, Routes, Route } from "react-router"
import { AuthProvider } from "./AuthContext.jsx"
import { MapActionsProvider } from './MapActionsContext.jsx'

function App() {

  return (
    <MapActionsProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </MapActionsProvider>
  )
}

export default App
