import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { dropdown, dropdownIcon } from '../styles/SearchDropdown';
import { useState } from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';

export default function SearchDropdown({ text = '', content }) {

  const [isOpen, setIsOpen] = useState(false);

  function handleClick() {
    setIsOpen(prev => !prev);
  }

  const expandLess = <FontAwesomeIcon style={dropdownIcon(isOpen)} icon={faChevronRight} />;

  return (
    <Box>
      <ListItemButton disableRipple sx={dropdown} onClick={handleClick}>
        {expandLess}
        <ListItemText primary={text} />
      </ListItemButton>
      <Collapse in={isOpen}>
        {content}
      </Collapse>
    </Box>
  )
}
