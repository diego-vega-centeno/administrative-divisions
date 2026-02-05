import Box from "@mui/material/Box";
import {
  basicMenu, tableContainer, modalCenter, menuHeader
} from "../styles/Menu.jsx";
import { getUserLayersRelations, deleteLayer } from "../utils/database.js";
import Typography from "@mui/material/Typography";
import TableContainer from '@mui/material/TableContainer';
import { debugLog, errorLog } from "../utils/logger.js";
import { useState, useEffect, useContext } from "react";
import Modal from '@mui/material/Modal';
import { MapActionsContext } from "./MapActionsContext.jsx";
import FavoritesMenuTable from "./FavoritesMenuTable.jsx";


export default function FavoritesMenu({ open, onClose, onError }) {
  const [relsPerLayer, setRelsPerLayer] = useState({});
  const { setSelected } = useContext(MapActionsContext);
  const [loading, setLoading] = useState(false);
  const [activeLayer, setActiveLayer] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [selectedLayerRels, setSelectedLayerRels] = useState(new Set());

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
        errorLog(`Failed to fetch layer relations: ${error.message}`)
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
  }

  const deleteLayerRels = (selectedLayerRels) => {
    // TODO: Implement actual deletion logic
    console.log('Deleting layer relations:', selectedLayerRels);
    setSelectedLayerRels(new Set());
    setEditMode(false);
  }

  return (
    <Modal open={open} onClose={onClose} sx={modalCenter}>
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
                        selectedLayerRels={selectedLayerRels}
                        setSelectedLayerRels={setSelectedLayerRels}
                        deleteSelectedLayer={deleteSelectedLayer}
                        deleteLayerRels={deleteLayerRels}
                        layerRels={layerRels}
                        plotLayer={plotLayer}
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