import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { dropdown, dropdownIcon } from '../styles/SearchDropdown';
import { useState } from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { searchFieldBox, searchField, searchFieldIconBox } from '../styles/SearchDropdown';
import TextField from '@mui/material/TextField';
import { getNominatimSearch } from '../utils/nominatim.js';
import SearchResultList from './SearchResultList.jsx';

export default function SearchDropdown({ text = '' }) {

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [entities, setEntities] = useState([]);

  function handleClick() {
    setIsOpen(prev => !prev);
  }

  async function handleSearch() {
    if (input == '') return;
    const entities = await getNominatimSearch(input);
    setEntities(entities)
  }

  return (
    <Box>
      <ListItemButton disableRipple sx={dropdown} onClick={handleClick}>
        <FontAwesomeIcon style={dropdownIcon(isOpen)} icon={faChevronRight} />
        <ListItemText primary={text} />
      </ListItemButton>
      <Collapse in={isOpen}>
        <Box sx={searchFieldBox}>
          <TextField
            sx={searchField} placeholder="search" variant="outlined"
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {handleSearch();}
            }}
          />
          <Box sx={searchFieldIconBox} onClick={handleSearch}>
            <FontAwesomeIcon icon={faSearch} />
          </Box>
        </Box>
        <SearchResultList entities={entities} />
      </Collapse>
    </Box>
  )
}
