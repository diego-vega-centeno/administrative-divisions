import ListItem from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import { listItem, listBox } from '../styles/SearchResultList';

export default function SearchResultList({ entities }) {

  if (!entities || entities.length == 0) {
    return null;
  }

  return (
    <Box sx={listBox}>
      {entities.map(ent => (
        <ListItem sx={listItem} key={ent['osm_id']}>
          <ListItemText primary={
            <>
              {ent['display_name']}{" "}
              <span style={{ color: "black" }}>({ent['addresstype']} - rel:{ent['osm_id']})</span>
              <span style={{ color: "black" }}></span>
            </>
          } />
        </ListItem>
      ))}
    </Box>
  );
}