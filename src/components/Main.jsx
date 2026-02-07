import { useEffect, useState, useContext } from 'react';
import styles from '../styles/Main.module.css'
import Footer from './Footer.jsx'
import SearchDropdown from './SearchDropdown.jsx'
import SelectAddDropdown from './SelectAddDropdown.jsx'
import 'leaflet/dist/leaflet.css';
import OSMTagsDropDown from './OSMTagsDropDown.jsx';
import ListItem from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { dropdown } from '../styles/OSMTagsDropDown.jsx';
import AlertDialog from './AlertDialog.jsx';
import { useSearchParams } from "react-router";
import Map from './Map.jsx';
import { MapActionsContext } from './MapActionsContext.jsx';

export default function Main() {
  const [errorMessage, setErrorMessage] = useState(null);
  const [osmElements, setOsmElements] = useState(null);
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');
  const message = searchParams.get('message');
  const { setSelected } = useContext(MapActionsContext)

  useEffect(() => {
    if (error) setErrorMessage(`An error ocurred: ${error} \nmessage: ${message || 'Something went wrong!'}`);
  }, [error]);

  const handleError = (errorMessage) => {
    setErrorMessage(errorMessage);
  }

  const handleSearchSelect = (item) => {
    setSelected([item.osm_id.toString()])
  }

  const handleTreeSelect = (ids) => {
    setSelected(ids)
  }

  return (
    <main className={styles.main}>
      <aside className={styles.aside}>
        <SearchDropdown
          text='Search OpenStreetMap'
          onSelect={handleSearchSelect}
          onError={handleError}
        />
        <SelectAddDropdown
          text='Select administrative division'
          onPlotRequest={handleTreeSelect}
          onError={handleError}
        />
      </aside>
      <section className={styles['main-body']}>
        <div className={styles['main-content']}>
          <Map
            onError={handleError}
          />
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