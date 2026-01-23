import { createPortal } from "react-dom";
import styles from '../styles/DownloadMenu.module.css'
import { addToolsButton } from "../styles/SelectAddDropdown";
import Button from "@mui/material/Button";
import { useState } from "react";
import Box from "@mui/material/Box";
import CircularProgress from '@mui/material/CircularProgress';
import { progressDownloadIcon } from "../styles/Main";
import { getRelationsDataWithCache, formatData } from '../utils/overpass';
import { donwloadJSONData } from "../utils/overpass";
import { debugLog, errorLog } from "../utils/logger";

function Backdrop({ onClick }) {
  return (
    <div
      onClick={onClick}
      className={styles['backdrop']}
    />
  )
}

export default function DownloadMenu({ open, onClose, onError, selectedNodes }) {

  if (!open) return null;

  const [params, setParams] = useState(
    {
      format: 'osm',
      structure: 'flatten',
      tags: true,
      geom: false,
      geojsonInOSM: false,
    }
  );
  const [isProgressIconActive, setIsProgressIconActive] = useState(false);

  async function handleDownload() {

    let out = '';
    if (params.tags) out = 'tags';
    if (params.geom && params.format === 'osm') out = 'geom';
    if (params.format === 'geojson') out = 'geom';

    setIsProgressIconActive(true);
    try {
      let osmRels = await getRelationsDataWithCache(selectedNodes, out);
      osmRels = formatData(osmRels, params, selectedNodes);
      setIsProgressIconActive(false);
      donwloadJSONData(osmRels, 'admin_divisions_selection.json');
    } catch (error) {
      setIsProgressIconActive(false);
      onError(error.message);
      errorLog('An error ocurred: ', error);
    }
  }

  function updateParams(key, value) {
    setParams(prev => {
      let updated = { ...prev, [key]: value };
      if (key === 'format' && value === 'geojson') {
        updated = {
          ...updated,
          structure: 'flatten',
          tags: true,
          geom: false,
          geojsonInOSM: false
        }
      }
      return updated;
    })
  }

  return createPortal(
    <>
      <Backdrop onClick={onClose} />
      <div className={styles['menu-container']}>
        <div className={styles['section']}>
          <div>format:</div>
          <label htmlFor="osm">osm json</label>
          <input
            type="radio"
            id="osm"
            value='osm'
            name="format"
            checked={params.format === 'osm'}
            onChange={() => updateParams('format', 'osm')}
          />
          <label htmlFor="geojson">geojson</label>
          <input
            type="radio"
            id="geojson"
            value='geojson'
            name="format"
            checked={params.format === 'geojson'}
            onChange={() => updateParams('format', 'geojson')}
          />
        </div>
        <hr />
        <fieldset disabled={params.format === 'geojson'}>
          <div className={styles['section']}>
            <div>structure:</div>
            <label htmlFor="flatten">flatten</label>
            <input
              type="radio"
              id="flatten"
              value='flatten'
              name="structure"
              checked={params.structure === 'flatten'}
              onChange={() => updateParams('structure', 'flatten')}
            />
            <label htmlFor="tree">tree</label>
            <input
              type="radio"
              id="tree"
              value='tree'
              name="structure"
              checked={params.structure === 'tree'}
              onChange={() => updateParams('structure', 'tree')}
            />
          </div>
          <hr />
          <div className={styles['section']}>
            <div>include OSM data:</div>
            <label htmlFor="tags">tags</label>
            <input
              type="checkbox"
              id="tags"
              value='tags'
              checked={params.tags}
              onChange={(e) => updateParams('tags', e.target.checked)}
            />
            <div className={styles['tags-geom']}>
              <div>
                <label htmlFor="geom">geometry</label>
                <input
                  type="checkbox"
                  id="geom"
                  value='geom'
                  checked={params.geom}
                  onChange={(e) => updateParams('geom', e.target.checked)}
                />
              </div>
              <div>
                <label htmlFor="geojsonInOSM">add geojson geometry</label>
                <input
                  type="checkbox"
                  id="geojsonInOSM"
                  disabled={!params.geom}
                  checked={params.geojsonInOSM}
                  onChange={(e) => updateParams('geojsonInOSM', e.target.checked)}
                />
              </div>
            </div>
          </div>
        </fieldset>
        <hr />
        <Box sx={progressDownloadIcon}>
          <Button sx={addToolsButton}
            size='small'
            variant="contained"
            onClick={handleDownload}
          >Download</Button>
          {isProgressIconActive && (
            <CircularProgress thickness={9} size={30} />
          )}
        </Box>
      </div>
    </>,
    document.body);
}