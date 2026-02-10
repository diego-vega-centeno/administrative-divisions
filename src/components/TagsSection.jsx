import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import {
  tableContainerHeader, tableContainerBody, tagsItemList
} from '../styles/Menu.jsx';
import Box from '@mui/material/Box';
import { dataIndex } from '../utils/addData.js';
import { listItem } from '../styles/Menu.jsx';
import { useState, useEffect } from 'react';
import TagsTable from './TagsTable.jsx';

export default function TagsSection({ osmRels }) {

  const [selectedRel, setSelectedRel] = useState();

  useEffect(() => {
    if (osmRels.length > 0) setSelectedRel(osmRels[0]);
  }, [osmRels])

  return (
    <Box>
      <ListItem sx={tableContainerHeader}>
        <ListItemText primary={"Selected divisions tags"} />
      </ListItem>
      <Box sx={tableContainerBody}>
        <Box>
          <Box sx={tagsItemList}>
            {osmRels.map(rel => (
              <ListItemButton
                key={rel.id}
                disableRipple
                sx={listItem}
                onClick={() => setSelectedRel(rel)}
              >
                {dataIndex[rel.id].text}
              </ListItemButton>
            )
            )}
          </Box>
        </Box>
        <Box>
          <TagsTable osmRel={selectedRel} />
        </Box>
      </Box>
    </Box>
  )
}