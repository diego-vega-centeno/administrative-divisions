import { useEffect, useRef, useState } from 'react';
import styles from '../styles/Main.module.css'
import Footer from './Footer.jsx'
import SearchDropdown from './SearchDropdown.jsx'
import SelectAddDropdown from './SelectAddDropdown.jsx'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getRelationsOSMData, getRelationsDataWithCache, profileSize } from '../utils/overpass';
import { addToLeafletMap } from '../utils/leafletMap.js';
import Box from '@mui/material/Box';
import { Dialog, Alert } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { progressMapIcon } from '../styles/Main.jsx';
import OSMTagsDropDown from './OSMTagsDropDown.jsx';
import ListItem from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { dropdown } from '../styles/OSMTagsDropDown.jsx';
import { errorLog } from '../utils/logger.js';
import AlertDialog from './AlertDialog.jsx';
import { useSearchParams } from "react-router";

export default function Main() {

  const mapRef = useRef(null); // will hold map instance from leaflet
  const mapContainerRef = useRef(null); // will hold map container dom element
  const [isProgressIconActive, setIsProgressIconActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [osmElements, setOsmElements] = useState(null);
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');

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
    if (error === 'oauth_failed') setErrorMessage('Authentication failed');
  }, [error]);


  // for relation search query
  async function handleItemSelect(entity) {
    try {
      setIsProgressIconActive(true);
      // get osm data and add to map
      const osmData = await getRelationsOSMData(entity.osm_id);
      await addToLeafletMap(osmData, mapRef.current);
      setIsProgressIconActive(false);

      // add display name before passing to tags table
      const osmElements = osmData.elements;
      osmElements[0].display_name = entity.display_name;
      setOsmElements(osmElements);
    } catch (error) {
      setIsProgressIconActive(false);
      setErrorMessage(error.message);
      errorLog('An error ocurred: ', error);
    }
  }

  // for add selection from tree
  async function handleADDPlot(selected) {
    try {
      setIsProgressIconActive(true);
      // getAllStoredRelations();
      // clearAllStoredRelations();
      const osmRels = await getRelationsDataWithCache(selected);

      // aproximate size in KB
      if (process.env.NODE_ENV === 'development') profileSize(osmRels);

      // add to map
      const fakeOSMRes = { 'elements': osmRels };
      await addToLeafletMap(fakeOSMRes, mapRef.current);
      setIsProgressIconActive(false);
      setOsmElements(osmRels);
    } catch (error) {
      setIsProgressIconActive(false);
      setErrorMessage(error.message);
      errorLog('An error ocurred: ', error);
    }
  }

  const handleError = (errorMessage) => {
    setErrorMessage(errorMessage);
  }

  return (
    <main className={styles.main}>
      <aside className={styles.aside}>
        <SearchDropdown
          text='Search OpenStreetMap'
          onSelect={handleItemSelect}
          onError={handleError}
        />
        <SelectAddDropdown
          text='Select administrative division'
          onPlotRequest={handleADDPlot}
          onError={handleError}
        />
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
          {Boolean(osmElements) && <ListItem disableRipple sx={dropdown}>
            <ListItemText primary={"Selected divisions tags"} />
          </ListItem>}
          {Boolean(osmElements) && osmElements.map(
            elementData => <OSMTagsDropDown key={elementData.id} elementData={elementData} />
          )}
        </div>
        <Footer />
      </section>
      <AlertDialog
        open={Boolean(errorMessage)}
        severity={"warning"}
        message={errorMessage}
        onClose={() => setErrorMessage(null)}
      />
    </main>
  )
}