import ListItem from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import { listItem, listBox } from "../styles/SearchResultList";

interface SearchResultListProps {
  entities: { [key: string]: any }[];
  onSelect: (_: any) => void;
}

export default function SearchResultList({
  entities,
  onSelect,
}: SearchResultListProps) {
  if (!entities || entities.length == 0) return null;

  return (
    <Box sx={listBox}>
      {entities.map((ent: any) => (
        <ListItem
          sx={listItem}
          key={ent["osm_id"]}
          onClick={() => onSelect(ent)}
        >
          <ListItemText
            primary={ent.display_name}
            secondary={`${ent.addresstype} - ${ent.osm_id}`}
            slotProps={{
              secondary: {
                fontSize: "0.9rem",
                color: "black",
              },
            }}
          />
        </ListItem>
      ))}
    </Box>
  );
}
