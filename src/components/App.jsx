import Home from "../pages/Home.jsx"
import { BrowserRouter, Routes, Route } from "react-router"
import { AuthProvider } from "./AuthContext.jsx"

function App() {

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
