import ListItem from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import { listItem, listBox } from '../styles/SearchResultList';
import Typography from "@mui/material/Typography";

export default function SearchTreeResultList({ relations, onSelect }) {

  if (!relations || relations.length == 0) return null;

  return (
    <Box sx={listBox}>
      {relations.map(rel => (
        <ListItem
          sx={listItem} key={rel.id}
          onClick={() => onSelect(rel)}
        >
          <ListItemText>
            <Typography component={'span'}>{rel.text}</Typography>
          </ListItemText>
        </ListItem>
      ))}
    </Box>
  );
}