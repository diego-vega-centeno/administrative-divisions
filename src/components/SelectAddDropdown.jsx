import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { dropdown } from '../styles/SearchDropdown';
import { useState } from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import JsTreeWrapper from './jsTreeWrapper.jsx';
import treeData from '../allAddTree.json'
import { searchFieldBox, searchField, searchFieldIconBox } from '../styles/SearchDropdown';
import TextField from '@mui/material/TextField';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Button from '@mui/material/Button';
import { addToolsButton, addTools, treeContainer } from '../styles/SelectAddDropdown.jsx';

export default function SelectAddDropdown({ text = '', onPlotRequest }) {

  const [selectedNodes, setSelectedNodes] = useState([]);
  const [filter, setFilter] = useState('');
  const [filterInput, setFilterInput] = useState('');

  function handlePlotClick() {
    onPlotRequest(selectedNodes);
  }


  return (
    <Box>
      <ListItemButton disableRipple sx={dropdown}>
        <ListItemText primary={text} />
      </ListItemButton>
      <Box sx={searchFieldBox}>
        <TextField
          type="search"
          sx={searchField}
          placeholder="filter..."
          value={filterInput}
          onChange={(e) => setFilterInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setFilter(filterInput);
          }}
        />
        <Box sx={searchFieldIconBox} onClick={() => setFilter(filterInput)}>
          <FontAwesomeIcon icon={faSearch} />
        </Box>
      </Box>
      <Box sx={addTools}>
        <Button sx={addToolsButton}
          size='small'
          variant="contained"
          onClick={handlePlotClick}
        >Plot</Button>
        <Button sx={addToolsButton}
          size='small'
          variant="contained"
        >Download</Button>
      </Box>
      <Box sx={treeContainer}>
        <JsTreeWrapper
          data={treeData}
          onSelect={(nodes) => setSelectedNodes(nodes)}
          filter={filter}
        />
      </Box>
    </Box>
  )
}
