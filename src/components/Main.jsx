import { useEffect, useState, useContext } from 'react';
import styles from '../styles/Main.module.css'
import Footer from './Footer.jsx'
import SearchDropdown from './SearchDropdown.jsx'
import SelectAddDropdown from './SelectAddDropdown.jsx'
import 'leaflet/dist/leaflet.css';
import AlertDialog from './AlertDialog.jsx';
import { useSearchParams } from "react-router";
import Map from './Map.jsx';
import { MapActionsContext } from './MapActionsContext.jsx';
import TagsSection from './TagsSection.jsx';
import logger from '../utils/logger.js';
import { getRelationsDataWithCache } from '../utils/overpass';
import { profileSize } from '../utils/overpass';
import DataTable from './DataTable.jsx';
import ChartsSection from './ChartsSection.jsx';

export default function Main() {
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');
  const message = searchParams.get('message');
  const { selected, setSelected } = useContext(MapActionsContext);
  const [osmRels, setOsmRels] = useState([]);
  const [isProgressIconActive, setIsProgressIconActive] = useState(false);
  const [computedDataRels, setComputedDataRels] = useState([]);
  const [isComputingIconActive, setIsComputingIconActive] = useState(false);
  const [wikiDataIndex, setWikiDataIndex] = useState({})

  useEffect(() => {
    if (error) setErrorMessage(`An error ocurred: ${error} \nmessage: ${message || 'Something went wrong!'}`);
  }, [error]);


  useEffect(() => {
    if (!selected.length) return;
    handleADDPlot(selected);
  }, [selected]);


  // for add selection from tree
  async function handleADDPlot(ids) {
    try {
      setIsProgressIconActive(true)
      const queryOSMRels = await getRelationsDataWithCache(ids);
      // aproximate size in KB
      // if (process.env.NODE_ENV === 'development') profileSize(queryOSMRels);
      setOsmRels(queryOSMRels)
      // setIsProgressIconActive(false)
    } catch (error) {
      handleError(error.message);
      logger.error('An error ocurred: ', error);
    }
  }

  const handleError = (errorMessage) => {
    setErrorMessage(errorMessage);
  }

  const handleSearchSelect = (item) => {
    setSelected([item.osm_id.toString()])
  }

  const handleTreeSelect = (ids) => {
    setSelected(ids)
  }

  //* effect for computed props
  useEffect(() => {
    if (!osmRels.length) return;

    setIsComputingIconActive(true);
    const worker = new Worker(
      new URL('../utils/computePropsWorker.js', import.meta.url),
      { type: 'module' }
    );
    // send data
    worker.postMessage(osmRels);
    // receive
    worker.onmessage = (e) => {
      setComputedDataRels(e.data);
      setIsComputingIconActive(false);
      // clean up
      worker.terminate();
    };

    // unmount
    return () => worker.terminate();

  }, [osmRels]);

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
            osmRels={osmRels}
            onError={handleError}
            isProgressIconActive={isProgressIconActive}
            setIsProgressIconActive={setIsProgressIconActive}
          />
          {Boolean(osmRels.length != 0) && (
            <TagsSection
              osmRels={osmRels}
            />
          )}
          <DataTable
            computedDataRels={computedDataRels}
            isComputingIconActive={isComputingIconActive}
          />
          <ChartsSection
            computedDataRels={computedDataRels}
            isComputingIconActive={isComputingIconActive}
          />
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