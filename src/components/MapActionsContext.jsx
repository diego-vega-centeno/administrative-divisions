import { createContext, useState } from "react"

const MapActionsContext = createContext(null)

function MapActionsProvider({ children }) {
  const [selected, setSelected] = useState([])

  return (
    <MapActionsContext.Provider value={{ selected, setSelected }}>
      {children}
    </MapActionsContext.Provider>
  )
}

export { MapActionsProvider, MapActionsContext }