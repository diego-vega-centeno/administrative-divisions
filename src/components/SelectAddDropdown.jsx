import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { dropdown } from '../styles/SearchDropdown';
import { useState, useRef } from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import JsTreeWrapper from './jsTreeWrapper.jsx';
import treeData from '../add_tree.json'
import { searchFieldBox, searchField, searchFieldIconBox } from '../styles/SearchDropdown';
import TextField from '@mui/material/TextField';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Button from '@mui/material/Button';
import { addToolsButton, addTools, treeContainer, infoAddBox } from '../styles/SelectAddDropdown.jsx';
import DownloadMenu from './DownloadMenu.jsx';
import SaveMenu from './SaveMenu.jsx';

export default function SelectAddDropdown({ text = '', onPlotRequest, onError }) {

  const treeRef = useRef(null);
  const [filterInput, setFilterInput] = useState('');
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const [isSaveMenuOpen, setIsSaveMenuOpen] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState(0);

  function handlePlot() {
    if (!selectedNodes.length) {
      onError('Please select a division');
      return;
    };
    onPlotRequest(selectedNodes);
  }

  function handleFilter(filterInput) {
    treeRef.current?.filter(filterInput)
  }

  function handleReset() {
    treeRef.current?.deselectAll();
    treeRef.current?.filter('');
    setFilterInput('');
  }

  function handleSelect() {
    setSelectedNodes(treeRef.current?.getSelected())
  }

  function handleDownload() {
    if (!selectedNodes.length) {
      onError('Please select a division');
      return;
    };
    setIsDownloadMenuOpen(true);
  }

  function handleSave() {
    if (!selectedNodes.length) {
      onError('Please select a division');
      return;
    };
    setIsSaveMenuOpen(true);
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
            if (e.key === 'Enter') handleFilter(filterInput);
          }}
        />
        <Box sx={searchFieldIconBox} onClick={() => handleFilter(filterInput)}>
          <FontAwesomeIcon icon={faSearch} />
        </Box>
      </Box>
      <Box sx={addTools}>
        <Button sx={addToolsButton}
          size='small'
          variant="contained"
          onClick={handleReset}
        >Reset</Button>
        <Button sx={addToolsButton}
          size='small'
          variant="contained"
          onClick={handlePlot}
        >Plot</Button>
        <Button sx={addToolsButton}
          size='small'
          variant="contained"
          onClick={handleDownload}
        >Download</Button>
        <Button sx={addToolsButton}
          size='small'
          variant="contained"
          onClick={handleSave}
        >Save</Button>
      </Box>
      <Box sx={infoAddBox}>
        {selectedNodes.length || 0} nodes selected
      </Box>
      <Box sx={treeContainer}>
        <JsTreeWrapper
          data={treeData}
          ref={treeRef}
          onSelect={handleSelect}
        />
      </Box>
      <SaveMenu
        open={isSaveMenuOpen}
        onClose={() => setIsSaveMenuOpen(false)}
        selectedNodes={treeRef.current?.getSelected()}
      />
      <DownloadMenu
        open={isDownloadMenuOpen}
        onClose={() => setIsDownloadMenuOpen(false)}
        onError={onError}
        selectedNodes={selectedNodes}
      />
    </Box>
  )
}
