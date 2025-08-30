import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { dropdown, dropdownIcon } from '../styles/SearchDropdown';
import { useState } from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';
import JsTreeWrapper from './jsTreeWrapper.jsx';
import treeData from '../allAddTree.json'

export default function SelectAddDropdown({ text = '' }) {

  const [isOpen, setIsOpen] = useState(false);

  function handleClick() {
    setIsOpen(prev => !prev);
  }

  const itemList = <ul>
    {Array(100).fill().map((_, i) => <li key={i} style={{ backgroundColor: 'red', margin: '1px' }}></li>)}
  </ul>;

  return (
    <Box>
      <ListItemButton disableRipple sx={dropdown} onClick={handleClick}>
        <FontAwesomeIcon style={dropdownIcon(isOpen)} icon={faChevronRight} />
        <ListItemText primary={text} />
      </ListItemButton>
      <Collapse in={isOpen}>
        <JsTreeWrapper
          data={treeData}
          onSelect={(node) => console.log("Selected:", node)}
        />
      </Collapse>
    </Box>
  )
}
