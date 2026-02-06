import {
  table, tableCell, headerCell, subHeaderCell,
  headerCellContent, headerCellToolsContainer, headerCellToolsButton,
  headerCellConfirmContainer, favoritesMenuCheckbox,
  favoritesMenuCheckboxCell
} from "../styles/Menu.jsx";
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from "@mui/material/TableRow";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSquareUpRight, faTrash, faX,
  faPenToSquare
} from '@fortawesome/free-solid-svg-icons';
import { faSquare, faCheckSquare } from '@fortawesome/free-regular-svg-icons'
import { dataIndex, getParentNames } from "../utils/addData.js";
import { addToolsButton } from '../styles/SelectAddDropdown.jsx';
import TextField from "@mui/material/TextField";
import { useState } from "react";

export default function FavoritesMenuTable({
  activeLayer, layerRels, setActiveLayer, plotLayer, groupKey,
  deleteSelectedLayer, editMode, setEditMode, deleteLayerRels,
  confirm, setConfirm, selectedLayerRelsIds, setSelectedLayerRelsIds, changeLayerTitle
}) {

  const [layerTitle, layerId] = groupKey.split('|');
  const [newTitle, setNewTitle] = useState(layerTitle);

  const handleDeleteLayer = (layerId) => {
    // send delete request to parent
    deleteSelectedLayer(layerId)
    // disable comfirm buttons
    setConfirm(false);
  }

  const handlePlotLayer = (groupKey) => {
    plotLayer(groupKey)
  }

  const handleEditSave = () => {
    console.log('H');
    // deleteLayerRels(groupKey, layerId, selectedLayerRelsIds);
    changeLayerTitle(newTitle)
  }

  const toggle = (id) => {
    setSelectedLayerRelsIds(prev => {
      const newSelected = new Set(prev);
      newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
      return newSelected;
    });
  }

  const handleCancel = () => {
    setEditMode(false);
    setSelectedLayerRelsIds(new Set());
    setConfirm(false);
    setNewTitle(layerTitle)
  }

  return (
    <Table sx={table}>
      <TableHead >
        <TableRow >
          <TableCell
            align="center"
            sx={headerCell}
            colSpan={5}
          >
            <Box sx={headerCellContent}>
              {editMode && !confirm && activeLayer == layerId ? (
                <TextField
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  sx={{
                    width: '100%',
                    margin: '.8rem 0',
                    backgroundColor: 'white',
                    '& .MuiInputBase-input': {
                      fontSize: '1rem',
                      padding: '.2rem 0.5rem',
                    },
                    borderRadius: '5px',
                  }}
                />
              ) : <Typography>{layerTitle}</Typography>}
              {confirm && !editMode && activeLayer === layerId ?
                <Box
                  sx={headerCellConfirmContainer}
                  className="header-cell-tools"
                >
                  <Button
                    sx={{ ...headerCellToolsButton, color: 'rgb(218 9 9)' }}
                    onClick={() => handleDeleteLayer(layerId)}
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
                (editMode && !confirm && activeLayer == layerId ?
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Box component={'span'}>{selectedLayerRelsIds.size} relations will be deleted</Box>
                    </Box>
                    <Box>

                      <Button sx={addToolsButton}
                        size='small'
                        variant="contained"
                        onClick={() => handleEditSave()}
                      >
                        save
                      </Button>
                      <Button sx={addToolsButton}
                        size='small'
                        variant="contained"
                        onClick={() => handleCancel()}
                      >
                        cancel
                      </Button>
                    </Box>
                  </Box>
                  :
                  <Box
                    sx={headerCellToolsContainer}
                    className="header-cell-tools"
                  >
                    <Tooltip title="Edit" placement="top" arrow>
                      <Button
                        sx={headerCellToolsButton}
                        onClick={() => {
                          setEditMode(true);
                          setConfirm(false);
                          setActiveLayer(layerId);
                          setSelectedLayerRelsIds(new Set());
                        }}
                      >
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </Button>
                    </Tooltip>
                    <Tooltip title="Plot" placement="top" arrow>
                      <Button
                        sx={headerCellToolsButton}
                        onClick={() => handlePlotLayer(groupKey)}
                      >
                        <FontAwesomeIcon icon={faSquareUpRight} />
                      </Button>
                    </Tooltip>
                    <Tooltip title="Delete" placement="top" arrow>
                      <Button
                        sx={headerCellToolsButton}
                        onClick={() => {
                          setConfirm(true);
                          setEditMode(false);
                          setActiveLayer(layerId);
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </Tooltip>
                  </Box>
                )
              }
            </Box>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell align="center" sx={subHeaderCell}></TableCell>
          <TableCell align="center" sx={subHeaderCell}>admin level</TableCell>
          <TableCell align="center" sx={subHeaderCell}>id</TableCell>
          <TableCell align="center" sx={subHeaderCell}>name</TableCell>
          <TableCell align="center" sx={subHeaderCell}>parents</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {layerRels.map(rel => {
          return (
            <TableRow key={rel.id}>
              <TableCell align="center" sx={favoritesMenuCheckboxCell}>
                {editMode && activeLayer === layerId && (
                  <Button
                    size='small'
                    sx={favoritesMenuCheckbox}
                    onClick={() => toggle(rel.id)}
                  >
                    <FontAwesomeIcon
                      icon={selectedLayerRelsIds.has(rel.id) ? faTrash : faSquare}
                      style={{ color: selectedLayerRelsIds.has(rel.id) ? 'red' : null }}
                    />
                  </Button>
                )}
              </TableCell>
              <TableCell align="center" sx={tableCell}>{dataIndex[rel.osm_relation_id]['admin_level']}</TableCell>
              <TableCell align="center" sx={tableCell}>{rel.osm_relation_id}</TableCell>
              <TableCell align="center" sx={tableCell}>{rel.osm_relation_name}</TableCell>
              <TableCell align="center" sx={tableCell}>
                {getParentNames(rel.osm_relation_id)}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}