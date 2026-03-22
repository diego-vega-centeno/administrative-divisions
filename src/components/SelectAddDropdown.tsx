import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { dropdown } from "../styles/SearchDropdown.js";
import { useState, useRef, useContext } from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import JsTreeWrapper from "./jsTreeWrapper.js";
import {
  searchFieldBox,
  searchField,
  searchFieldIconBox,
} from "../styles/SearchDropdown.js";
import TextField from "@mui/material/TextField";
import { faSearch, faX } from "@fortawesome/free-solid-svg-icons";
import Button from "@mui/material/Button";
import {
  addToolsButton,
  addTools,
  treeContainer,
  infoAddBox,
  addPanel,
  cancelButton,
} from "../styles/SelectAddDropdown.js";
import DownloadMenu from "./DownloadMenu.jsx";
import SaveMenu from "./SaveMenu.js";
import { AuthContext, AuthContextType } from "./AuthContext.js";
import logger from "../utils/logger.js";
import SearchTreeResultList from "./SearchTreeResultList.js";
import CircularProgress from "@mui/material/CircularProgress";
import { progressIcon } from "../styles/SearchDropdown.js";
import IconButton from "@mui/material/IconButton";
import add_flat_countries from "../add_flat_countries.json";
import {
  CustomError,
  SelectedNodesType,
  JsTreeWrapperRefType,
  JstreeNode,
} from "../types/index.js";

export default function SelectAddDropdown({
  text = "",
  onPlotRequest,
  onError,
}: {
  text: string;
  onPlotRequest: (ids: string[]) => void;
  onError: (msg: string) => void;
}) {
  const treeRef = useRef<JsTreeWrapperRefType>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const [isSaveMenuOpen, setIsSaveMenuOpen] = useState<boolean>(false);
  const [selectedNodes, setSelectedNodes] = useState<SelectedNodesType>([]);
  const { userData, setUserData, loading } = useContext(AuthContext)!;
  const [isProgressIconActive, setIsProgressIconActive] = useState(false);

  function handlePlot() {
    if (!selectedNodes.length) {
      onError("Select a division");
      return;
    }
    // plot request only pass ids
    onPlotRequest(selectedNodes.map((rel) => rel.id));
  }

  // function handleFilter(filterInput) {
  //   treeRef.current?.filter(filterInput)
  // }

  function handleReset() {
    treeRef.current?.tree(true).deselect_all();
    treeRef.current?.tree(true).close_all();
  }

  function handleSelect(selected: SelectedNodesType) {
    // nodes select uses all data from jstree and original
    // so just use and pass that
    setSelectedNodes(selected);
  }

  function handleDownload() {
    if (!selectedNodes.length) {
      onError("Select a division");
      return;
    }
    setIsDownloadMenuOpen(true);
  }

  function handleSave() {
    if (loading || !userData) {
      onError("Log in to save layers");
      return;
    }
    if (!selectedNodes.length) {
      onError("Select a division");
      return;
    }
    setIsSaveMenuOpen(true);
  }

  async function handleSearch(searchInput: string) {
    setIsProgressIconActive(true);
    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + `/search?q=${searchInput}`,
      );
      const data = await response.json();
      logger.info(`Search result length: ${data.data.length}`);

      setSearchResult(data.data);
      setIsProgressIconActive(false);
    } catch (error) {
      const err = error as CustomError;
      logger.error(`Failed to search relations: ${err.message}`);
    }
  }

  function handleSearchSelection(rel: any) {
    const tree = treeRef.current?.tree(true);

    // find country dom node
    if (rel.path.length === 0) {
      const countryDomNode = tree.get_node(rel.id, true)[0];
      tree.select_node(countryDomNode);
      scrollToNode(countryDomNode);
    } else {
      const countryNode = add_flat_countries.find(
        (node) => node.text === rel.path.at(-1),
      );

      tree.open_node(countryNode, function () {
        const node = tree.get_node(rel.id);

        if (tree.is_selected(node)) {
          const domNode = tree.get_node(rel.id, true)[0];
          scrollToNode(domNode);
          return;
        }
        // this select before matters because the select_node trigger implicit after_open
        tree.select_node(node);
        tree.element.one("after_open.jstree", function () {
          const domNode = tree.get_node(rel.id, true)[0];
          scrollToNode(domNode);
        });

        tree.element.one("select_node.jstree", function () {
          const domNode = tree.get_node(rel.id, true)[0];
          scrollToNode(domNode);
        });
      });
    }

    function scrollToNode(node: HTMLElement) {
      const container = document.getElementsByTagName("aside")[0];
      const offset = 500; // pixels
      const top = node.offsetTop - offset;
      container.scrollTo({ top: top, behavior: "smooth" });
    }
  }

  return (
    <Box>
      <ListItemButton disableRipple sx={dropdown}>
        <ListItemText primary={text} />
      </ListItemButton>
      <Box sx={addPanel}>
        <Box sx={searchFieldBox}>
          <TextField
            sx={searchField}
            placeholder="search"
            value={searchInput}
            onChange={(e) => {
              const val = e.target.value;
              if (val == "") setSearchResult([]);

              setSearchInput(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch(searchInput);
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <IconButton
                    size="small"
                    sx={cancelButton}
                    onClick={() => {
                      setSearchResult([]);
                      setSearchInput("");
                    }}
                  >
                    <FontAwesomeIcon icon={faX} />
                  </IconButton>
                ),
              },
            }}
          />
          <Box
            sx={searchFieldIconBox}
            onClick={() => handleSearch(searchInput)}
          >
            <FontAwesomeIcon icon={faSearch} />
          </Box>
        </Box>
        {isProgressIconActive && (
          <Box sx={progressIcon}>
            <CircularProgress thickness={8} size={30} />
          </Box>
        )}
        <SearchTreeResultList
          relations={searchResult}
          onSelect={handleSearchSelection}
        />
        <Box sx={addTools}>
          <Button
            sx={addToolsButton}
            size="small"
            variant="contained"
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            sx={addToolsButton}
            size="small"
            variant="contained"
            onClick={handlePlot}
          >
            Plot
          </Button>
          <Button
            sx={addToolsButton}
            size="small"
            variant="contained"
            onClick={handleDownload}
          >
            Download
          </Button>
          <Button
            sx={addToolsButton}
            size="small"
            variant="contained"
            onClick={handleSave}
          >
            Save
          </Button>
        </Box>
        <Box sx={infoAddBox}>{selectedNodes.length || 0} nodes selected</Box>
      </Box>
      <Box sx={treeContainer}>
        <JsTreeWrapper ref={treeRef} onSelect={handleSelect} />
      </Box>
      {isSaveMenuOpen && (
        <SaveMenu
          open={isSaveMenuOpen}
          onClose={() => setIsSaveMenuOpen(false)}
          onError={onError}
          selectedNodes={selectedNodes}
          getNodePath={treeRef.current?.getNodePath || (() => "")}
        />
      )}
      {isDownloadMenuOpen && (
        <DownloadMenu
          open={isDownloadMenuOpen}
          onClose={() => setIsDownloadMenuOpen(false)}
          onError={onError}
          selectedNodes={selectedNodes}
        />
      )}
    </Box>
  );
}
