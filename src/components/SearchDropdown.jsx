import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { dropdown, dropdownIcon } from '../styles/SearchDropdown';
import { useState } from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { searchFieldBox, searchField, searchFieldIconBox, progressIcon } from '../styles/SearchDropdown';
import TextField from '@mui/material/TextField';
import { getNominatimSearch } from '../utils/nominatim.js';
import SearchResultList from './SearchResultList.jsx';
import CircularProgress from '@mui/material/CircularProgress';

export default function SearchDropdown({ text = '' }) {

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [entities, setEntities] = useState([]);
  const [isProgressIconActive, setIsProgressIconActive] = useState(false);

  function handleClick() {
    setIsOpen(prev => !prev);
  }

  async function handleSearch() {
    if (input == '') return;
    setEntities([])
    setIsProgressIconActive(true);
    const entities = await getNominatimSearch(input);
    setIsProgressIconActive(false);
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
            type="search"
            sx={searchField} placeholder="search" variant="outlined"
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { handleSearch(); }
            }}
          />
          <Box sx={searchFieldIconBox} onClick={handleSearch}>
            <FontAwesomeIcon icon={faSearch} />
          </Box>
        </Box>
        {isProgressIconActive && (
          <Box sx={progressIcon}>
            <CircularProgress thickness={8} size={40} />
          </Box>
        )}

        <SearchResultList entities={entities} />
      </Collapse>
    </Box>
  )
}
