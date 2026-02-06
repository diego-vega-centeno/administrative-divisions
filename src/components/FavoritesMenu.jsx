import Box from "@mui/material/Box";
import {
  basicMenu, tableContainer, modalCenter, menuHeader
} from "../styles/Menu.jsx";
import {
  getUserLayersRelations, deleteLayer, dbDeleteLayerRels,
  dbUpdateLayerTitle
} from "../utils/database.js";
import Typography from "@mui/material/Typography";
import TableContainer from '@mui/material/TableContainer';
import { useState, useEffect, useContext } from "react";
import Modal from '@mui/material/Modal';
import { MapActionsContext } from "./MapActionsContext.jsx";
import FavoritesMenuTable from "./FavoritesMenuTable.jsx";
import logger from "../utils/logger.js";

export default function FavoritesMenu({ open, onClose, onError }) {
  const [relsPerLayer, setRelsPerLayer] = useState({});
  const { setSelected } = useContext(MapActionsContext);
  const [loading, setLoading] = useState(false);
  const [activeLayer, setActiveLayer] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [selectedLayerRelsIds, setSelectedLayerRelsIds] = useState(new Set());

  useEffect(() => {
    if (!open) return;

    // lets use a controller to stop the fetch in case of unmount
    const controller = new AbortController();

    async function getUserRels() {
      try {
        if (!open) return;
        setRelsPerLayer({});
        setLoading(true);

        const relations = await getUserLayersRelations({ signal: controller.signal });
        const relsPerLayer = Object.groupBy(relations.data, ({ layer_title, layer_id }) => `${layer_title}|${layer_id}`)

        setRelsPerLayer(relsPerLayer);

      } catch (error) {
        // ignore errors due to unmount in strict mode
        if (error.name === 'AbortError') return;
        logger.error(`Failed to fetch layer relations: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    getUserRels();

    return () => controller.abort();

  }, [open]);

  const plotLayer = (groupKey) => {
    const rels = relsPerLayer[groupKey].map(rel => ({ id: rel['osm_relation_id'] }));
    onClose();
    setSelected(rels);
  }

  const deleteSelectedLayer = (layerId) => {
    try {
      // send delete request to backend
      deleteLayer(layerId);
      // update react status
      setRelsPerLayer(prev => {
        const newLayers = { ...prev }
        for (const key in newLayers) {
          const [_, id] = key.split('|');
          if (id === layerId) delete newLayers[key]
        }
        return newLayers
      });
    } catch (error) {
      logger.error(`Failed to delete layer: ${error}`)
    }
  }

  const deleteLayerRels = (groupKey, layerId, selectedLayerRelsIds) => {
    try {
      // delete rel in database
      if (selectedLayerRelsIds.size != 0) {
        dbDeleteLayerRels(layerId, selectedLayerRelsIds)
      }
      // clean selected layers
      setSelectedLayerRelsIds(new Set());
      // reset editmode
      setEditMode(false);
      // update react status
      setRelsPerLayer(prev => {
        const newRelsPerLayer = { ...prev }
        const newLayerRels = relsPerLayer[groupKey].filter(rel => !selectedLayerRelsIds.has(rel.id));
        newRelsPerLayer[groupKey] = newLayerRels;

        // if layer is empty remove layer in react.
        // database will handle the delete
        if (!newLayerRels.length) {
          setRelsPerLayer(prev => {
            const newLayers = { ...prev }
            for (const key in newLayers) {
              const [_, id] = key.split('|');
              if (id === layerId) delete newLayers[key]
            }
            return newLayers
          })
        }
        return newRelsPerLayer;
      });
    } catch (error) {
      logger.error(`Failed to delete relations: ${error}`)
    }
  }

  const changeLayerTitle = (layerId, layerTitle, newTitle) => {
    try {
      // update in database
      dbUpdateLayerTitle(layerId, newTitle);
      // clean selected layers
      setSelectedLayerRelsIds(new Set());
      // disable edit mode
      setEditMode(false);
      // update react state
      setRelsPerLayer(prev => {
        const newRelsPerLayer = {};

        const oldKey = `${layerTitle}|${layerId}`;
        const newKey = `${newTitle}|${layerId}`;

        for (const key in prev) {
          if (key === oldKey) {
            newRelsPerLayer[newKey] = prev[oldKey].map(rel => ({
              ...rel,
              layer_title: newTitle
            }));
          } else {
            newRelsPerLayer[key] = prev[key];
          }
        }
        return newRelsPerLayer;
      });
    } catch (error) {
      logger.error(`Failed to update update layer title: ${error}`)
    }
  }

  const handleClose = () => {
    setLoading(false);
    setActiveLayer('');
    setConfirm(false);
    setEditMode(false);
    onClose();
    setSelectedLayerRelsIds(new Set());
  }

  return (
    <Modal open={open} onClose={handleClose} sx={modalCenter}>
      <Box sx={basicMenu}>
        <Box sx={menuHeader}>
          <Typography>Favorite layers</Typography>
        </Box>
        <TableContainer sx={tableContainer}>
          {
            loading ?
              <Typography>Loading ...</Typography>
              :
              (
                Object.entries(relsPerLayer).length === 0 ?
                  <Typography>No favorites found</Typography>
                  :
                  Object.entries(relsPerLayer).map(([groupKey, layerRels]) => {
                    const [layerTitle, layerId] = groupKey.split('|');
                    return (
                      <FavoritesMenuTable
                        key={layerId}
                        groupKey={groupKey}
                        activeLayer={activeLayer}
                        setActiveLayer={setActiveLayer}
                        editMode={editMode}
                        setEditMode={setEditMode}
                        confirm={confirm}
                        setConfirm={setConfirm}
                        selectedLayerRelsIds={selectedLayerRelsIds}
                        setSelectedLayerRelsIds={setSelectedLayerRelsIds}
                        deleteSelectedLayer={deleteSelectedLayer}
                        deleteLayerRels={deleteLayerRels}
                        layerRels={layerRels}
                        plotLayer={plotLayer}
                        changeLayerTitle={changeLayerTitle}
                      />
                    )
                  })
              )
          }
        </TableContainer>
      </Box>
    </Modal>
  )
}