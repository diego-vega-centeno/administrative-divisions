import { useEffect, useRef, memo, Dispatch, SetStateAction } from "react";
import styles from "../styles/Main.module.css";
import L from "leaflet";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { progressMapIcon } from "../styles/Main.jsx";
import { addToLeafletMap } from "../utils/leafletMap.js";
import {
  makeTagsPanel,
  createCenterButton,
} from "../utils/leafletUtilities.js";
import logger from "../utils/logger.js";
import { CustomError } from "../types/index.js";

interface MapProps {
  osmRels: any[];
  onError: (msg: string) => void;
  isProgressIconActive: boolean;
  setIsProgressIconActive: Dispatch<SetStateAction<boolean>>;
  type: string;
  computedDataRels: any[];
}

interface LeafletStateRefProps {
  type: string;
  tileLayer: L.TileLayer | null;
  baseLayer: L.GeoJSON | null;
  layerControl: L.Control.Layers | null;
  legendControl: L.Control | null;
  choroplethInfoPanel: L.Control | null;
  highlightedLayer: L.Layer | null;
  hoverHighlightedLayer: L.Layer | null;
  openedTooltip: L.Tooltip | null;
  mapControl: L.Control | null;
  mapControlIsCollapsed: boolean;
  map: L.Map | null;
  centerBtn: L.Control | null;
  handleMapClick: (e: L.LeafletMouseEvent) => void;
}

const Map = memo(
  ({
    osmRels,
    onError,
    isProgressIconActive,
    setIsProgressIconActive,
    type,
    computedDataRels,
  }: MapProps) => {
    const mapContainerRef = useRef(null); // will hold map container dom element

    const leafletStateRef = useRef<LeafletStateRefProps>({
      type: type,
      tileLayer: null,
      baseLayer: null,
      layerControl: null,
      legendControl: null,
      choroplethInfoPanel: null,
      highlightedLayer: null,
      hoverHighlightedLayer: null,
      openedTooltip: null,
      mapControl: null,
      mapControlIsCollapsed: false,
      map: null,
      centerBtn: null,
      handleMapClick: (e) => {
        if (leafletStateRef.current.highlightedLayer) {
          // unhighlight on click outside a feature
          if (leafletStateRef.current.baseLayer) {
            leafletStateRef.current.baseLayer.resetStyle(
              leafletStateRef.current.highlightedLayer,
            );
          }

          leafletStateRef.current.highlightedLayer = null;
        }
      },
    });

    // this effect should be before others so leafletState.current.map gets populated
    useEffect(() => {
      // exist if container doesn't exist
      // exitst if map object already exist
      if (!mapContainerRef.current || leafletStateRef.current.map) return;

      leafletStateRef.current.map = L.map(mapContainerRef.current).setView(
        [0, 0],
        1,
      );
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(leafletStateRef.current.map);

      // check change in dimension just in case, lol
      leafletStateRef.current.map.invalidateSize();

      // set tag control panel
      makeTagsPanel(leafletStateRef.current);
      // set center button
      createCenterButton(leafletStateRef.current);

      // destroy map on unmount
      return () => {
        if (leafletStateRef.current.map) {
          leafletStateRef.current.map.remove();
          leafletStateRef.current.map = null;
        }
        // react re-render weirdness make the layer control persist, so clean it
        leafletStateRef.current.layerControl = null;
      };
    }, []);

    useEffect(() => {
      if (!osmRels.length) return;
      try {
        addToMap(osmRels);
      } catch (error) {
        const err = error as CustomError;
        onError(err.message);
        logger.error("An error ocurred: ", error);
      }
    }, [osmRels]);

    const addToMap = (osmRels: any[]) => {
      // add to map
      addToLeafletMap(osmRels, computedDataRels, leafletStateRef.current);
      setIsProgressIconActive(false);
    };

    return (
      <div className={styles["map-container"]}>
        {isProgressIconActive && (
          <Box sx={progressMapIcon}>
            <CircularProgress thickness={9} size={70} />
          </Box>
        )}
        <div ref={mapContainerRef} className={styles["map"]} />
      </div>
    );
  },
);

export default Map;
