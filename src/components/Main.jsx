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
import TagsTable from './TagsTable.jsx';
import logger from '../utils/logger.js';
import { getRelationsDataWithCache } from '../utils/overpass';
import { profileSize } from '../utils/overpass';
import DataTable from './DataTable.jsx';
import ChartsSection from './ChartsSection.jsx';
import { dataIndex, getParentNames } from "../utils/addData.js";
import { calculatePropsFromGeo } from '../utils/calculateFromGeo.js';
import osmtogeojson from 'osmtogeojson';

export default function Main() {
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');
  const message = searchParams.get('message');
  const { selected, setSelected } = useContext(MapActionsContext);
  const [osmRels, setOsmRels] = useState([]);
  const [isProgressIconActive, setIsProgressIconActive] = useState(false);
  const [computedDataRels, setComputedDataRels] = useState([])

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
      setIsProgressIconActive(false)
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

  useEffect(() => {
    const newDataRels = [];
    for (const rel of osmRels) {
      // rel props
      const id = rel.id.toString();
      const relProps = {};
      relProps['id'] = id;
      relProps['admin_level'] = dataIndex[id].admin_level;
      relProps['name'] = dataIndex[id].text;
      relProps['parents'] = getParentNames(id);
      relProps['population'] = rel.tags?.population ? parseInt(rel.tags.population) : null

      // geo computed props
      const geoJSON = osmtogeojson({ elements: [rel] });
      const calcProps = calculatePropsFromGeo(geoJSON);


      // derived props
      const derivedProps = {
        popDensity: rel.tags?.population ?
          rel.tags?.population / calcProps.area :
          null
      }

      const rawProps = { ...relProps, ...calcProps, ...derivedProps };

      newDataRels.push(rawProps);
    }

    setComputedDataRels(newDataRels)
  }, [osmRels])

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
          />
          {Boolean(osmRels.length != 0) && (
            <TagsTable
              osmRels={osmRels}
            />
          )}
          {Boolean(computedDataRels.length != 0) && (
            <DataTable
              computedDataRels={computedDataRels}
            />
          )}
          {Boolean(computedDataRels.length != 0) && (
            <ChartsSection
              computedDataRels={computedDataRels}
            />
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