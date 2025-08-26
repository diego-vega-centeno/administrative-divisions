import { useState } from 'react';
import { dropdownIcon } from '../styles/SearchDropdown';
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
    console.log(elementData);
    setIsOpen(prev => !prev);
  }

  return <Box>
    <ListItemButton disableRipple onClick={handleClick}>
      <FontAwesomeIcon style={dropdownIcon(isOpen)} icon={faChevronRight} />
      <ListItemText primary={elementData.display_name} />
    </ListItemButton>
    <Collapse in={isOpen}>
      <div>
        <div>OSM tags</div>
      </div>
    </Collapse>
  </Box>
}