import { createPortal } from "react-dom";
import styles from '../styles/DownloadMenu.module.css'
import { addToolsButton } from "../styles/SelectAddDropdown";
import Button from "@mui/material/Button";

function Backdrop({ onClick }) {
  return (
    <div
      onClick={onClick}
      className={styles['backdrop']}
    />
  )
}

export default function DownloadMenu({ open, onClose }) {

  if (!open) return null;

  return createPortal(
    <>
      <Backdrop onClick={onClose} />
      <div className={styles['menu-container']}>
        <div className={styles['section']}>
          <div>structure:</div>
          <label htmlFor="tree">tree</label>
          <input type="radio" id="tree" />
          <label htmlFor="nodes">nodes</label>
          <input type="radio" id="nodes" />
        </div>
        <hr />
        <div className={styles['section']}>
          <div>include OSM data:</div>
          <label htmlFor="name">name</label>
          <input type="radio" id="name" />
          <label htmlFor="osmTags">osm tags</label>
          <input type="radio" id="osmTags" />
          <div className={styles['tags-geom']}>
            <div>
              <label htmlFor="osmTagsAndGeometry">osm tags and geometry</label>
              <input type="radio" id="osmTagsAndGeometry" />
            </div>
            <div>
              <label htmlFor="addGeoJson">osm tags and geometry</label>
              <input type="checkbox" id="osmTagsAndGeometry" />
            </div>
          </div>
        </div>
        <hr />
        <Button sx={addToolsButton}
          size='small'
          variant="contained"
        >Download</Button>
      </div>
    </>,
    document.body);
}