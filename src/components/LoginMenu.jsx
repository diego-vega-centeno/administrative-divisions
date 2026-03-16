import Modal from "@mui/material/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faOpenstreetmap } from "@fortawesome/free-brands-svg-icons";
import { Icon } from "@mui/material";
import {
  selection,
  selectionIcon,
  menu,
  menuContainer,
  menuHeader,
  menuDescription,
} from "../styles/LoginMenu.jsx";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import logger from "../utils/logger.js";

export default function LoginMenu({ open, onClose }) {
  const handleClick = (method) => {
    let authUrl;

    switch (method) {
      case "google":
        authUrl = import.meta.env.VITE_GOOGLE_AUTH_URL;
        if (!authUrl) logger.error("Missing VITE_GOOGLE_AUTH_URL");
        break;

      case "osm":
        authUrl = import.meta.env.VITE_OSM_AUTH_URL;
        if (!authUrl) logger.error("Missing VITE_OSM_AUTH_URL");
        break;

      default:
        break;
    }

    location.href = authUrl;
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={menuContainer}>
        <Typography sx={menuHeader}>Login</Typography>
        <Typography sx={menuDescription}>Choose your login method:</Typography>
        <Box sx={menu}>
          <Box sx={selection} onClick={() => handleClick("google")}>
            <Icon sx={selectionIcon}>
              <FontAwesomeIcon icon={faGoogle} />
            </Icon>
            <span>Continue with Google</span>
          </Box>
          <Box sx={selection} onClick={() => handleClick("osm")}>
            <Icon sx={selectionIcon}>
              <FontAwesomeIcon icon={faOpenstreetmap} />
            </Icon>
            <span>Continue with OpenStreeMap</span>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}
