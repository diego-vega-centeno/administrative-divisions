import { createPortal } from "react-dom";
import styles from '../styles/DownloadMenu.module.css'
import { addToolsButton } from "../styles/SelectAddDropdown";
import Button from "@mui/material/Button";
import { useState } from "react";
import Box from "@mui/material/Box";
import CircularProgress from '@mui/material/CircularProgress';
import { progressDownloadIcon } from "../styles/Main";
import { getRelationsOSMData } from '../utils/overpass';

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

  const [include, setInclude] = useState('name');
  const [structure, setStructure] = useState('tree');
  const [addGeojsonGeom, setAddGeojsonGeom] = useState(false);
  const [isProgressIconActive, setIsProgressIconActive] = useState(false);

  async function handleDownload() {
    const params = {
      structure,
      include,
      addGeojsonGeom: include === 'osmTagsAndGeometry' && addGeojsonGeom
    }
    setIsProgressIconActive(true);
    try {
      const osmData = await getRelationsOSMData(selectedNodes.map(node => node.id));
      setIsProgressIconActive(false);
      console.log(osmData);
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
          <label htmlFor="nodes">nodes</label>
          <input
            type="radio"
            id="nodes"
            value='nodes'
            name="structure"
            checked={structure === 'nodes'}
            onChange={() => setStructure('nodes')}
          />
        </div>
        <hr />
        <div className={styles['section']}>
          <div>include OSM data:</div>
          <label htmlFor="name">name</label>
          <input
            type="radio"
            id="name"
            name="include"
            value='name'
            checked={include === 'name'}
            onChange={() => setInclude('name')}
          />
          <label htmlFor="osmTags">osm tags</label>
          <input
            type="radio"
            id="osmTags"
            name="include"
            value='osmTags'
            checked={include === 'osmTags'}
            onChange={() => setInclude('osmTags')}
          />
          <div className={styles['tags-geom']}>
            <div>
              <label htmlFor="osmTagsAndGeometry">osm tags and geometry</label>
              <input
                type="radio"
                id="osmTagsAndGeometry"
                name="include"
                value='osmTagsAndGeometry'
                checked={include === 'osmTagsAndGeometry'}
                onChange={() => setInclude('osmTagsAndGeometry')}
              />
            </div>
            <div>
              <label htmlFor="addGeojsonGeom">add geojson geometry</label>
              <input
                type="checkbox"
                id="addGeojsonGeom"
                disabled={include !== 'osmTagsAndGeometry'}
                checked={addGeojsonGeom}
                onChange={(e) => setAddGeojsonGeom(e.target.checked)}
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