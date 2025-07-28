import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { dropdown, dropdownIcon, searchFieldBox, searchField, searchFieldIconBox } from '../styles/SearchDropdown';
import { useState } from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

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
        <ListItemText primary="Search" />
      </ListItemButton>
      <Collapse in={isOpen}>
        <Box sx={searchFieldBox}>
          <TextField
            sx={searchField} placeholder="search" variant="outlined"
          />
          <Box sx={searchFieldIconBox}>
            <FontAwesomeIcon icon={faSearch} />
          </Box>
        </Box>
      </Collapse>
    </Box>
  )
}
