import { useEffect, useRef, useState, useContext } from 'react';
import styles from '../styles/Main.module.css'
import L from 'leaflet';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { progressMapIcon } from '../styles/Main.jsx';
import logger from '../utils/logger.js';
import { getRelationsDataWithCache } from '../utils/overpass';
import { addToLeafletMap } from '../utils/leafletMap.js';
import { profileSize } from '../utils/overpass';
import { MapActionsContext } from './MapActionsContext.jsx';

export default function Map({ onError }) {
  const [isProgressIconActive, setIsProgressIconActive] = useState(false);
  const mapContainerRef = useRef(null); // will hold map container dom element
  const mapRef = useRef(null); // will hold map instance from leaflet
  const { selected } = useContext(MapActionsContext)

  useEffect(() => {
    // exist if container doesn't exist
    // exitst if map object already exist
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current).setView([0, 0], 1);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapRef.current);

    // check change in dimension just in case, lol
    mapRef.current.invalidateSize();

    // destroy map on unmount
    return () => {
      mapRef.current.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!selected.length) return;
    handleADDPlot(selected);
  }, [selected]);


  // for add selection from tree
  async function handleADDPlot(ids) {
    try {
      setIsProgressIconActive(true);
      const osmRels = await getRelationsDataWithCache(ids);

      // aproximate size in KB
      if (process.env.NODE_ENV === 'development') profileSize(osmRels);

      // add to map
      const fakeOSMRes = { 'elements': osmRels };
      await addToLeafletMap(fakeOSMRes, mapRef.current);
      setIsProgressIconActive(false);
    } catch (error) {
      setIsProgressIconActive(false);
      onError(error.message);
      logger.error('An error ocurred: ', error);
    }
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
}