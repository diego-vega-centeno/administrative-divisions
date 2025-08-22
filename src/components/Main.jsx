import { useEffect, useRef, useState } from 'react';
import styles from '../styles/Main.module.css'
import Footer from './Footer.jsx'
import SearchDropdown from './SearchDropdown.jsx'
import SelectAddDropdown from './SelectAddDropdown.jsx'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getRelation } from '../utils/overpass';
import { addToLeafletMap } from '../utils/leafletMap.js';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { progressMapIcon } from '../styles/Main.jsx';

export default function Main() {

  const mapRef = useRef(null); // will hold map instance from leaflet
  const mapContainerRef = useRef(null); // will hold map container dom element
  const [isProgressIconActive, setIsProgressIconActive] = useState(true);

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

  async function handleItemSelect(osmId) {
    try {
      const osmData = await getRelation(osmId);
      addToLeafletMap(osmData, mapRef.current);
    } catch (error) {
      console.log('An error ocurred: ', error);
    }
  }

  return (
    <main className={styles.main}>
      <aside className={styles.aside}>
        <SearchDropdown text='Search' onSelect={handleItemSelect} />
        <SelectAddDropdown text='Select administrative division' />
      </aside>
      <section className={styles['main-body']}>
        <div className={styles['main-content']}>
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
        </div>
        <Footer />
      </section>
    </main>
  )
}