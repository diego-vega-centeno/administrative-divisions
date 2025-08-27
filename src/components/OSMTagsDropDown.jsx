import { useState } from 'react';
import { dropdownIcon } from '../styles/SearchDropdown.jsx';
import { dropdown } from '../styles/OSMTagsDropDown.jsx';
import styles from '../styles/OSMTagsDropDown.module.css'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function OSMTagsDropDown({ elementData }) {

  if (!elementData) return null;

  const [isOpen, setIsOpen] = useState(false);

  function handleClick() {
    setIsOpen(prev => !prev);
  }

  return <Box>
    <ListItemButton sx={dropdown} disableRipple onClick={handleClick}>
      <FontAwesomeIcon style={dropdownIcon(isOpen)} icon={faChevronRight} />
      <ListItemText primary={elementData.display_name} />
    </ListItemButton>
    <Collapse in={isOpen}>
      <div>
        <div className={styles["table-container"]}>
          <h3 className={styles["header"]}>OSM tags</h3>
          <table className={styles["table"]}>
            <tbody>
              {Object.entries(elementData.tags).map(([key, value]) => (
                <tr key={key} className={styles["row"]}>
                  <th className={styles["cell-key"]}>{key}</th>
                  <td className={styles["cell-value"]}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Collapse>
  </Box>
}