import { createPortal } from "react-dom";
import styles from '../styles/DownloadMenu.module.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { Icon } from "@mui/material";
import {
  selection, selectionIcon, menu, menuContainer, menuHeader,
  menuDescription
} from "../styles/LoginMenu.jsx";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { errorLog } from "../utils/logger.js";

function Backdrop({ onClick }) {
  return <div onClick={onClick} className={styles['backdrop']} />
}

export default function LoginMenu({ open, onClose }) {

  if (!open) return null;

  const handleClick = () => {
    const authUrl = import.meta.env.VITE_AUTH_URL;
    if(!authUrl) errorLog('Missing VITE_AUTH_URL');
    location.href = authUrl;
  }

  return createPortal(
    <>
      <Backdrop onClick={onClose} />
      <Box sx={menuContainer}>
        <Typography sx={menuHeader} >Login</Typography>
        <Typography sx={menuDescription} >Choose your login method:</Typography>
        <Box sx={menu}>
          <Box sx={selection} onClick={handleClick}>
            <Icon sx={selectionIcon}>
              <FontAwesomeIcon icon={faGoogle} />
            </Icon>
            <span>Continue with Google</span>
          </Box>
        </Box>
      </Box>
    </>,
    document.body);
}