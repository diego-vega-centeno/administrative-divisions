import ListItem from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import { listItem, listBox } from '../styles/SearchResultList';
import Typography from "@mui/material/Typography";

export default function SearchTreeResultList({ relations, onSelect }) {

  if (!relations || relations.length == 0) return null;

  const getPathString = (path) => {
    if (!path || path.length === 0) return '';
    return path.join(' / ');
  };

  return (
    <Box sx={listBox}>
      {relations.map(rel => (
        <ListItem
          sx={listItem} key={rel.id}
          onClick={() => onSelect(rel)}
        >
          <ListItemText
            primary={rel.text}
            secondary={getPathString(rel.path)}
            slotProps={{
              secondary: {
                fontSize: '0.9rem',
                color: 'black'
              }
            }}
          />
        </ListItem>
      ))}
    </Box>
  );
}