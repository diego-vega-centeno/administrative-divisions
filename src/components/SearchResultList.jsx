import ListItem from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import { listItem, listBox } from '../styles/SearchResultList';

export default function SearchResultList({ entities, onSelect }) {

  if (!entities || entities.length == 0) return null;
  
  return (
    <Box sx={listBox}>
      {entities.map(ent => (
        <ListItem
          sx={listItem} key={ent['osm_id']}
          onClick={() => onSelect(ent)}
        >
          <ListItemText>{`${ent['display_name']} (${ent['addresstype']} - ${ent['osm_id']})`}</ListItemText>
        </ListItem>
      ))}
    </Box>
  );
}