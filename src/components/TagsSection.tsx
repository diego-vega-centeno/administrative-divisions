import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import {
  tableContainerHeader,
  tableContainerBody,
  tagsItemList,
} from "../styles/Menu.js";
import Box from "@mui/material/Box";
// import { dataIndex } from '../utils/addData.js';
import { listItem } from "../styles/Menu.js";
import { useState, useEffect, memo } from "react";
import TagsTable from "./TagsTable";
import { osmRel } from "../types/index.js";

const TagsSection = memo(({ osmRels }: { osmRels: osmRel[] }) => {
  const [selectedRel, setSelectedRel] = useState<osmRel>();

  useEffect(() => {
    if (osmRels.length > 0) setSelectedRel(osmRels[0]);
  }, [osmRels]);

  function getRelName(rel: osmRel) {
    return rel.tags["name:en"] ?? rel.tags["alt_name:en"] ?? rel.tags["name"];
  }

  return (
    <Box>
      <ListItem sx={tableContainerHeader}>
        <ListItemText primary={"OpenStreetMap tags"} />
      </ListItem>
      <Box sx={tableContainerBody}>
        <Box>
          <Box sx={tagsItemList}>
            {osmRels.map((rel) => (
              <ListItemButton
                key={rel.id}
                disableRipple
                sx={listItem}
                onClick={() => setSelectedRel(rel)}
              >
                {getRelName(rel)}
              </ListItemButton>
            ))}
          </Box>
        </Box>
        <Box>{selectedRel && <TagsTable osmRel={selectedRel} />}</Box>
      </Box>
    </Box>
  );
});

export default TagsSection;
