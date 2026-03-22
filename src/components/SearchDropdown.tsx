import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faX } from "@fortawesome/free-solid-svg-icons";
import { dropdown, dropdownIcon } from "../styles/SearchDropdown.js";
import { useState } from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import {
  searchFieldBox,
  searchField,
  searchFieldIconBox,
  progressIcon,
} from "../styles/SearchDropdown.js";
import { cancelButton } from "../styles/SelectAddDropdown.js";
import TextField from "@mui/material/TextField";
import { getNominatimSearch } from "../utils/nominatim.js";
import SearchResultList from "./SearchResultList";
import CircularProgress from "@mui/material/CircularProgress";
import logger from "../utils/logger.js";
import IconButton from "@mui/material/IconButton";
import { CustomError } from "../types/index.js";

interface SearchDropdownProps {
  text: string;
  onSelect: (item: Record<string, any>) => void;
  onError: (message: string) => void;
}

export default function SearchDropdown({
  text = "",
  onSelect,
  onError,
}: SearchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [entities, setEntities] = useState([]);
  const [isProgressIconActive, setIsProgressIconActive] = useState(false);

  function handleClick() {
    setIsOpen((prev) => !prev);
  }

  async function handleSearch() {
    if (input == "") return;
    setEntities([]);
    setIsProgressIconActive(true);
    try {
      const entities = await getNominatimSearch(input);
      setIsProgressIconActive(false);
      setEntities(entities);
    } catch (error) {
      const err = error as CustomError;
      setIsProgressIconActive(false);
      onError(err.message);
      logger.error(error);
    }
  }

  return (
    <Box>
      <ListItemButton disableRipple sx={dropdown} onClick={handleClick}>
        <FontAwesomeIcon style={dropdownIcon(isOpen)} icon={faChevronRight} />
        <ListItemText primary={text} />
      </ListItemButton>
      <Collapse in={isOpen}>
        <Box sx={searchFieldBox}>
          <TextField
            sx={searchField}
            placeholder="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <IconButton
                    size="small"
                    sx={cancelButton}
                    onClick={() => {
                      setEntities([]);
                      setInput("");
                    }}
                  >
                    <FontAwesomeIcon icon={faX} />
                  </IconButton>
                ),
              },
            }}
          />
          <Box sx={searchFieldIconBox} onClick={handleSearch}>
            <FontAwesomeIcon icon={faSearch} />
          </Box>
        </Box>
        {isProgressIconActive && (
          <Box sx={progressIcon}>
            <CircularProgress thickness={8} size={40} />
          </Box>
        )}

        {entities.length > 0 && (
          <SearchResultList entities={entities} onSelect={onSelect} />
        )}
      </Collapse>
    </Box>
  );
}
