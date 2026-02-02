import Box from "@mui/material/Box";
import {
  basicMenu, table, tableCell, headerCell,
  subHeaderCell, tableContainer, modalCenter,
  headerCellContent, headerCellToolsContainer, headerCellToolsButton,
  headerCellConfirmContainer
} from "../styles/Menu.jsx";
import { getUserLayersRelations, deleteLayer } from "../utils/database.js";
import Typography from "@mui/material/Typography";
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from "@mui/material/TableRow";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { debugLog, errorLog } from "../utils/logger.js";
import { useState, useEffect, useContext } from "react";
import Modal from '@mui/material/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareUpRight, faTrash, faX } from '@fortawesome/free-solid-svg-icons';
import { MapActionsContext } from "./MapActionsContext.jsx";


export default function FavoritesMenu({ open, onClose, onError }) {
  const [relsLayers, setRelsLayers] = useState({});
  const { setSelected } = useContext(MapActionsContext);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    // lets use a controller to stop the fetch in case of unmount
    const controller = new AbortController();

    async function getUserRels() {
      try {
        const relations = await getUserLayersRelations({ signal: controller.signal });
        const relsLayers = Object.groupBy(relations.data, ({ layer_title, layer_id }) => `${layer_title}|${layer_id}`)
        setRelsLayers(relsLayers);
      } catch (error) {
        // ignore errors due to unmount in strict mode
        if (error.name === 'AbortError') return;
        errorLog(`Failed to fetch layer relations: ${error.message}`)
      }
    }

    getUserRels();

    return () => {
      controller.abort();
    };
  }, []);


  const plotLayer = (title) => {
    const rels = relsLayers[title].map(rel => ({ id: rel['osm_relation_id'] }));
    onClose();
    setSelected(rels);
  }

  const deleteSelectedLayer = (layerId) => {
    deleteLayer(layerId);
    setRelsLayers(prev => {
      const newLayers = { ...prev }
      for (const key in newLayers) {
        const [_, id] = key.split('|');
        if (id === layerId) delete newLayers[key]
      }
      return newLayers
    });
    setConfirm(false);
  }

  return (
    <Modal open={open} onClose={onClose} sx={modalCenter}>
      <Box sx={basicMenu}>
        <Typography>Favorite layers</Typography>
        <TableContainer sx={tableContainer}>
          {Object.entries(relsLayers).map(([groupKey, rels]) => {
            const [layerTitle, layerId] = groupKey.split('|');
            return (
              <Table key={layerId} sx={table}>
                <TableHead >
                  <TableRow >
                    <TableCell
                      align="center"
                      sx={headerCell}
                      colSpan={2}
                    >
                      <Box sx={headerCellContent}>
                        <Typography>{layerTitle}</Typography>
                        {confirm === layerId ?
                          <Box
                            sx={headerCellConfirmContainer}
                            className="header-cell-tools"
                          >
                            <Button
                              sx={{ ...headerCellToolsButton, color: 'rgb(218 9 9)' }}
                              onClick={() => deleteSelectedLayer(layerId)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                            <Button
                              sx={{ ...headerCellToolsButton }}
                              onClick={() => setConfirm(false)}
                            >
                              <FontAwesomeIcon icon={faX} />
                            </Button>
                          </Box> :
                          <Box
                            sx={headerCellToolsContainer}
                            className="header-cell-tools"
                          >
                            <Tooltip title="Plot" placement="top" arrow>
                              <Button
                                sx={headerCellToolsButton}
                                onClick={() => plotLayer(layerTitle)}
                              >
                                <FontAwesomeIcon icon={faSquareUpRight} />
                              </Button>
                            </Tooltip>
                            <Tooltip title="Delete" placement="top" arrow>
                              <Button
                                sx={headerCellToolsButton}
                                onClick={() => setConfirm(layerId)}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </Button>
                            </Tooltip>
                          </Box>
                        }

                      </Box>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="center" sx={subHeaderCell}>id</TableCell>
                    <TableCell align="center" sx={subHeaderCell}>name</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rels.map(rel => {
                    return (
                      <TableRow key={rel.osm_relation_id}>
                        <TableCell align="center" sx={tableCell}>{rel.osm_relation_id}</TableCell>
                        <TableCell align="center" sx={tableCell}>{rel.osm_relation_name}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )
          })}
        </TableContainer>
      </Box>
    </Modal>
  )
}