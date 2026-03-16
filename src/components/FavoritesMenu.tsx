import Box from "@mui/material/Box";
import {
  basicMenu,
  tableContainer,
  modalCenter,
  menuHeader,
} from "../styles/Menu";
import {
  getUserLayersRelations,
  deleteLayer,
  dbDeleteLayerRels,
  dbUpdateLayerTitle,
} from "../utils/database";
import Typography from "@mui/material/Typography";
import TableContainer from "@mui/material/TableContainer";
import { useState, useEffect, useContext } from "react";
import Modal from "@mui/material/Modal";
import { MapActionsContext } from "./MapActionsContext";
import FavoritesMenuTable from "./FavoritesMenuTable";
import logger from "../utils/logger.js";
import { RelationsType, CustomError } from "../types/index.ts";

interface FavoritesMenuProps {
  open: boolean;
  onClose: () => void;
  onError?: () => void;
}

import { MapActionsContextType } from "./MapActionsContext";

export default function FavoritesMenu({
  open,
  onClose,
  onError,
}: FavoritesMenuProps) {

  const [relsPerLayer, setRelsPerLayer] = useState<
    Record<string, RelationsType[]>
  >({});
  const { setSelected } = useContext(
    MapActionsContext,
  ) as MapActionsContextType;
  const [loading, setLoading] = useState(false);
  const [activeLayer, setActiveLayer] = useState<string>("");
  const [editMode, setEditMode] = useState<boolean>(false);
  const [confirm, setConfirm] = useState<boolean>(false);
  const [selectedLayerRelsIds, setSelectedLayerRelsIds] = useState<Set<string>>(
    new Set(),
  );
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!open) return;

    // lets use a controller to stop the fetch in case of unmount
    const controller = new AbortController();

    async function getUserRels() {
      try {
        if (!open) return;
        setRelsPerLayer({});
        setLoading(true);

        const relations = await getUserLayersRelations({
          signal: controller.signal,
        });

        const computedRelsPerLayer = relations.data.reduce(
          (
            acc: Record<string, typeof relations.data>,
            curr: typeof relations.data,
          ) => {
            const key = `${curr.layer_title}|${curr.layer_id}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(curr);
            return acc;
          },
          {} as Record<string, typeof relations.data>,
        );

        setRelsPerLayer(computedRelsPerLayer);
      } catch (error) {
        const err = error as Error;
        // ignore errors due to unmount in strict mode
        if (err.name === "AbortError") return;
        logger.error(`Failed to fetch layer relations: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    getUserRels();

    return () => controller.abort();
  }, [open]);

  const plotLayer: (_: string) => void = (groupKey: string) => {
    onClose();
    setSelected(relsPerLayer[groupKey].map((rel) => rel["osm_relation_id"]));
  };

  const deleteSelectedLayer = async (layerId: string) => {
    try {
      // send delete request to backend
      await deleteLayer(layerId);
      // update react status
      setRelsPerLayer((prev) => {
        const newLayers = { ...prev };
        for (const key in newLayers) {
          const [_, id] = key.split("|");
          if (id === layerId) delete newLayers[key];
        }
        return newLayers;
      });
    } catch (error) {
      logger.error(`Failed to delete layer: ${error}`);
    }
  };

  const handleClose = () => {
    setLoading(false);
    setActiveLayer("");
    setConfirm(false);
    setEditMode(false);
    onClose();
    setError("");
    setSelectedLayerRelsIds(new Set());
  };

  const handleEditSave = async (
    groupKey: string,
    layerId: string,
    layerTitle: string,
    newTitle: string,
  ) => {
    try {
      //* update title
      if (newTitle !== layerTitle) {
        if (!newTitle.trim()) {
          setError("Title is required");
          return;
        }
        // update in database
        // this throws an error if there's duplicate title
        await dbUpdateLayerTitle(layerId, newTitle);

        // update react state
        setRelsPerLayer((prev) => {
          const newRelsPerLayer: Record<string, RelationsType[]> = {};

          const oldKey = `${layerTitle}|${layerId}`;
          const newKey = `${newTitle}|${layerId}`;

          for (const key in prev) {
            if (key === oldKey) {
              newRelsPerLayer[newKey] = prev[oldKey].map((rel) => ({
                ...rel,
                layer_title: newTitle,
              }));
            } else {
              newRelsPerLayer[key] = prev[key];
            }
          }
          return newRelsPerLayer;
        });
      }

      //* delete rels

      if (selectedLayerRelsIds.size != 0) {
        // delete rel in database
        await dbDeleteLayerRels(layerId, selectedLayerRelsIds);

        // update react state
        setRelsPerLayer((prev) => {
          const newRelsPerLayer = { ...prev };
          const newLayerRels = relsPerLayer[groupKey].filter(
            (rel) => !selectedLayerRelsIds.has(rel.id),
          );
          newRelsPerLayer[groupKey] = newLayerRels;

          // if layer is empty remove layer in react.
          // database will handle the delete
          if (!newLayerRels.length) {
            setRelsPerLayer((prev) => {
              const newLayers = { ...prev };
              for (const key in newLayers) {
                const [_, id] = key.split("|");
                if (id === layerId) delete newLayers[key];
              }
              return newLayers;
            });
          }
          return newRelsPerLayer;
        });
      }

      // reset editmode
      setEditMode(false);
      // clean selected layers
      setSelectedLayerRelsIds(new Set());
    } catch (error) {
      const err = error as CustomError;
      if (err.code === "duplicate_entry") {
        setError("This title already exists. Choose another one.");
        return;
      }
      logger.error(`Failed to update update layer title: ${error}`);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} sx={modalCenter}>
      <Box sx={basicMenu}>
        <Box sx={menuHeader}>
          <Typography>Favorite layers</Typography>
        </Box>
        <TableContainer sx={tableContainer}>
          {loading ? (
            <Typography>Loading ...</Typography>
          ) : Object.entries(relsPerLayer).length === 0 ? (
            <Typography>No favorites found</Typography>
          ) : (
            Object.entries(relsPerLayer).map(([groupKey, layerRels]) => {
              const [layerTitle, layerId] = groupKey.split("|");
              return (
                <FavoritesMenuTable
                  key={groupKey}
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
                  layerRels={layerRels}
                  plotLayer={plotLayer}
                  error={error}
                  setError={setError}
                  handleEditSave={handleEditSave}
                />
              );
            })
          )}
        </TableContainer>
      </Box>
    </Modal>
  );
}
