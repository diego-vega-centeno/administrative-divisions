import { createPortal } from "react-dom";
import styles from '../styles/DownloadMenu.module.css'
import { addToolsButton } from "../styles/SelectAddDropdown";
import Button from "@mui/material/Button";
import { useState } from "react";

function Backdrop({ onClick }) {
  return (
    <div
      onClick={onClick}
      className={styles['backdrop']}
    />
  )
}

export default function DownloadMenu({ open, onClose, onDownload }) {

  if (!open) return null;

  const [include, setInclude] = useState('name');
  const [structure, setStructure] = useState('tree');
  const [addGeojsonGeom, setAddGeojsonGeom] = useState(false);

  function handleDownload() {
    onDownload({
      structure,
      include,
      addGeojsonGeom: include === 'osmTagsAndGeometry' && addGeojsonGeom
    });
    // onClose();
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
        <Button sx={addToolsButton}
          size='small'
          variant="contained"
          onClick={handleDownload}
        >Download</Button>
      </div>
    </>,
    document.body);
}