import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { tableContainerHeader } from "../styles/Menu.js";
import CircularProgress from "@mui/material/CircularProgress";
import { progressIcon } from "../styles/Main";
import { memo, useEffect, useState } from "react";
import Map from "./Map.js";
import { osmRel, ComputedDataRelsType } from "../types/index.js";

interface ChoroplethMapSectionProps {
  osmRels: osmRel[];
  computedDataRels: ComputedDataRelsType;
  onError: (msg: string) => void;
  isComputingIconActive: boolean;
}

const ChoroplethMapSection = memo(
  ({
    osmRels,
    computedDataRels,
    onError,
    isComputingIconActive,
  }: ChoroplethMapSectionProps) => {
    const [isProgressIconActive, setIsProgressIconActive] = useState(true);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
      if (!isComputingIconActive && computedDataRels.length) {
        // create a macro task to schedule after render
        // use 1s to give time to composer thread take the painting job
        setTimeout(() => setShouldRender(true), 1000);
      }
    }, [computedDataRels, isComputingIconActive]);

    // return needs to be after hooks
    if (!computedDataRels.length && !isComputingIconActive) return null;

    return !shouldRender || isComputingIconActive ? (
      <Box>
        <ListItem sx={tableContainerHeader}>
          <ListItemText primary={"Choropleth map"} />
        </ListItem>
        <Box sx={progressIcon}>
          <CircularProgress thickness={9} size={70} />
        </Box>
      </Box>
    ) : (
      <Box>
        <ListItem sx={tableContainerHeader}>
          <ListItemText primary={"Choropleth map"} />
        </ListItem>
        <Map
          osmRels={osmRels}
          computedDataRels={computedDataRels}
          onError={onError}
          isProgressIconActive={isProgressIconActive}
          setIsProgressIconActive={setIsProgressIconActive}
          type={"choropleth"}
        />
      </Box>
    );
  },
);

export default ChoroplethMapSection;
