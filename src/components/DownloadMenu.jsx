import { createPortal } from "react-dom";
import styles from '../styles/DownloadMenu.module.css'
import { addToolsButton } from "../styles/SelectAddDropdown";
import Button from "@mui/material/Button";
import { useState } from "react";
import Box from "@mui/material/Box";
import CircularProgress from '@mui/material/CircularProgress';
import { progressDownloadIcon } from "../styles/Main";
import { getRelationsOSMData, formatData } from '../utils/overpass';
import osmtogeojson from "osmtogeojson";

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

  const [include, setInclude] = useState(
    { tags: false, geom: false, geojson: false }
  );
  const [structure, setStructure] = useState('tree');
  const [isProgressIconActive, setIsProgressIconActive] = useState(false);

  async function handleDownload() {
    const params = {
      structure,
      addGeojsonGeom: include.geom && include.geojson
    }

    let out = '';
    if (include.tags) out = 'tags';
    if (include.geom) out = 'geom';

    setIsProgressIconActive(true);
    console.log(selectedNodes);
    try {
      const osmData = await getRelationsOSMData(selectedNodes.map(node => node.id), out);
      const outputData = formatData(osmData, structure, include, selectedNodes);
      // const geojsonData = osmtogeojson(osmData);
      setIsProgressIconActive(false);
      console.log(osmData);
      console.log(outputData);
    } catch (error) {
      setIsProgressIconActive(false);
      onError(error.message);
      console.log('An error ocurred: ', error);
    }
  }

  return createPortal(
    <>
      <Backdrop onClick={onClose} />
      <div className={styles['menu-container']}>
        <div className={styles['section']}>
          <div>structure:</div>
          <label htmlFor="tree">tree</label>
          <input
            type="radio"
            id="tree"
            value='tree'
            name="structure"
            checked={structure === 'tree'}
            onChange={() => setStructure('tree')}
          />
          <label htmlFor="flatten">flatten</label>
          <input
            type="radio"
            id="flatten"
            value='flatten'
            name="structure"
            checked={structure === 'flatten'}
            onChange={() => setStructure('flatten')}
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
            checked={include.tags}
            onChange={(e) => setInclude(prev => (
              { ...prev, tags: e.target.checked }
            ))}
          />
          <div className={styles['tags-geom']}>
            <div>
              <label htmlFor="geom">geometry</label>
              <input
                type="checkbox"
                id="geom"
                value='geom'
                checked={include.geom}
                onChange={(e) => setInclude(prev => (
                  { ...prev, geom: e.target.checked }
                ))}
              />
            </div>
            <div>
              <label htmlFor="geojson">add geojson geometry</label>
              <input
                type="checkbox"
                id="geojson"
                disabled={!include.geom}
                checked={include.geojson}
                onChange={(e) => setInclude(prev => (
                  { ...prev, geojson: e.target.checked }
                ))}
              />
            </div>
          </div>
        </div>
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