import ListItem from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import OSMTagsDropDown from './OSMTagsDropDown.jsx';
import { dropdown } from '../styles/OSMTagsDropDown.jsx';

export default function TagsTable({ osmRels }) {
  return (
    <div>
      <ListItem disableRipple sx={dropdown}>
        <ListItemText primary={"Selected divisions tags"} />
      </ListItem>
      {osmRels.map(
        elementData => <OSMTagsDropDown key={elementData.id} elementData={elementData} />
      )}
    </div>
  )
}