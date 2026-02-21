import { useEffect, useRef, memo } from 'react';
import styles from '../styles/Main.module.css'
import L from 'leaflet';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { progressMapIcon } from '../styles/Main.jsx';
import { addToLeafletMap } from '../utils/leafletMap.js';
import { makeTagsPanel, createCenterButton } from '../utils/leafletUtilities.js';
import logger from '../utils/logger.js';

const Map = memo(({ osmRels, onError, isProgressIconActive, setIsProgressIconActive, type }) => {
  const mapContainerRef = useRef(null); // will hold map container dom element

  const leafletStateRef = useRef({
    type: type,
    tileLayer: null,
    baseLayer: null,
    choroplethLayer: null,
    layerControl: null,
    legendControl: null,
    highlightedLayer: null,
    mapControl: null,
    mapControlIsCollapsed: false,
    map: null,
    centerBtn: null,
    handleMapClick: (e) => {
      if (leafletStateRef.current.highlightedLayer) {
        // unhighlight on click outside a feature
        leafletStateRef.current.baseLayer.resetStyle(leafletStateRef.current.highlightedLayer);
        leafletStateRef.current.highlightedLayer = null;
      }
    }
  });

  // this effect should be before others so leafletState.current.map gets populated
  useEffect(() => {
    // exist if container doesn't exist
    // exitst if map object already exist
    if (!mapContainerRef.current || leafletStateRef.current.map) return;

    leafletStateRef.current.map = L.map(mapContainerRef.current).setView([0, 0], 1);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(leafletStateRef.current.map);

    // check change in dimension just in case, lol
    leafletStateRef.current.map.invalidateSize();

    // set tag control panel
    makeTagsPanel(leafletStateRef.current);
    // set center button
    createCenterButton(leafletStateRef.current)

    // destroy map on unmount
    return () => {
      leafletStateRef.current.map.remove();
      leafletStateRef.current.map = null;
      // react re-render weirdness make the layer control persist, so clean it
      leafletStateRef.current.layerControl = null;
    };
  }, []);


  useEffect(() => {
    if (!osmRels.length) return;
    try {
      addToMap(osmRels);
    } catch (error) {
      onError(error.message);
      logger.error('An error ocurred: ', error);
    }
  }, [osmRels])


  const addToMap = (osmRels) => {
    // add to map
    addToLeafletMap({ 'elements': osmRels }, leafletStateRef.current);
    setIsProgressIconActive(false)
  }

  return (
    <div className={styles['map-container']}>
      {isProgressIconActive && (
        <Box sx={progressMapIcon}>
          <CircularProgress thickness={9} size={70} />
        </Box>
      )}
      <div
        ref={mapContainerRef}
        className={styles['map']}
      />
    </div>
  )
});

export default Map;