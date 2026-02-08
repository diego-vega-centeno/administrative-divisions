import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import OSMTagsDropDown from './OSMTagsDropDown.jsx';
import { tableContainerHeader } from '../styles/Menu.jsx';
import Box from '@mui/material/Box';

export default function TagsTable({ osmRels }) {
  return (
    <Box>
      <ListItem sx={tableContainerHeader}>
        <ListItemText primary={"Selected divisions tags"} />
      </ListItem>
      {osmRels.map(
        elementData => <OSMTagsDropDown key={elementData.id} elementData={elementData} />
      )}
    </Box>
  )
}