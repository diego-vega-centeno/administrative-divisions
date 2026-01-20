import { Backdrop } from "@mui/material"
import { createPortal } from "react-dom";
import styles from '../styles/DownloadMenu.module.css'
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { progressDownloadIcon } from "../styles/Main";
import { addToolsButton } from "../styles/SelectAddDropdown";
import { useState } from "react";
import { event } from "jquery";

export default function SaveMenu({ open, onClose, selectedNodes }) {
  if (!open) return null;
  const [isProgressIconActive, setIsProgressIconActive] = useState(false);
  const [title, setTitle] = useState('');
  console.log('selectedNodes: ', selectedNodes);

  return createPortal(
    <>
      <div
        onClick={() => onClose()}
        className={styles['backdrop']}
      />
      <div className={styles['menu-container']}>
        <div className={styles['section']}>
          <div>Save layer:</div>
          <label htmlFor="osm">Title </label>
          <input
            style={{ padding: '.3rem', border: '.5px solid grey' }}
            type="text"
            placeholder="add a title"
            name={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        <Box sx={progressDownloadIcon}>
          <Button sx={addToolsButton}
            size='small'
            variant="contained"
          >Save</Button>
          {isProgressIconActive && (
            <CircularProgress thickness={9} size={30} />
          )}
        </Box>
      </div>
    </>,
    document.body)
}