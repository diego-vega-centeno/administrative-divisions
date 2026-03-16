import { createContext, useState } from "react";

interface MapActionsProviderProps {
  children: React.ReactNode;
}

interface MapActionsContextType {
  selected: any[];
  setSelected: (selected: any[]) => void;
}

const MapActionsContext = createContext<MapActionsContextType | null>(null);

function MapActionsProvider({ children }: MapActionsProviderProps) {
  const [selected, setSelected] = useState<any[]>([]);

  return (
    <MapActionsContext.Provider value={{ selected, setSelected }}>
      {children}
    </MapActionsContext.Provider>
  );
}

export { MapActionsProvider, MapActionsContext };
