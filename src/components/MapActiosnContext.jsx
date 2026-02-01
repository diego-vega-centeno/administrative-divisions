import { createContext, useState } from "react"

const MapActionsContext = createContext(null)

function MapActionsProvider({ children }) {
  const [selected, setSelected] = useState([])

  return (
    <MapActionsContext value={{ selected, setSelected }}>
      {children}
    </MapActionsContext>
  )
}

export { MapActionsProvider, MapActionsContext }