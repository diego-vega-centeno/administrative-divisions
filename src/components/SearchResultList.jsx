import ListItem from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import { listItem, listBox } from '../styles/SearchResultList';
import Typography from "@mui/material/Typography";

export default function SearchResultList({ entities, onSelect }) {

  if (!entities || entities.length == 0) return null;

  return (
    <Box sx={listBox}>
      {entities.map(ent => (
        <ListItem
          sx={listItem} key={ent['osm_id']}
          onClick={() => onSelect(ent)}
        >
          <ListItemText>
            <Typography component={'span'}>{`${ent['display_name']} `}</Typography>
            <Typography component={'span'} color='black'>{`(${ent['addresstype']} - ${ent['osm_id']})`}</Typography>
          </ListItemText>
        </ListItem>
      ))}
    </Box>
  );
}