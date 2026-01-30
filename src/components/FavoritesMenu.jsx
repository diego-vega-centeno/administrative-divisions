import { createPortal } from "react-dom";
import Box from "@mui/material/Box";
import { backdrop, basicMenu, tableCell, headerCell, tableContainer } from "../styles/Menu.jsx";
import { getUserLayersRelations } from "../utils/database.js";
import Typography from "@mui/material/Typography";
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from "@mui/material/TableRow";
import { debugLog, errorLog } from "../utils/logger.js";
import { useState, useEffect } from "react";

export default function FavoritesMenu({ open, onClose, onError }) {
  const [relsLayers, setRelsLayers] = useState([]);

  useEffect(() => {
    // lets use a controller to stop the fetch in case of unmount
    const controller = new AbortController();

    async function getUserRels() {
      try {
        const relations = await getUserLayersRelations({ signal: controller.signal });
        const relsLayers = Object.groupBy(relations.data, ({ layer_title }) => layer_title)
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
  }, [])

  return createPortal(
    <>
      <Box
        onClick={() => onClose()}
        sx={backdrop}
      />
      <Box
        component="form"
        sx={basicMenu}
      >
        <Typography>Favorite layers</Typography>
        <TableContainer sx={tableContainer}>
          {Object.entries(relsLayers).map(([title, rels]) => {
            return (
              <Table key={title}>
                <TableHead >
                  <TableRow >
                    <TableCell
                      align="center"
                      sx={headerCell}
                      colSpan={3}
                    >{title}</TableCell>
                  </TableRow>
                </TableHead>
                {rels.map(rel => {
                  return (
                    <TableBody>
                      <TableRow key={rel.id}>
                        <TableCell align="center" sx={tableCell}>{rel.layer_title}</TableCell>
                        <TableCell align="center" sx={tableCell}>{rel.osm_relation_id}</TableCell>
                        <TableCell align="center" sx={tableCell}>{rel.osm_relation_name}</TableCell>
                      </TableRow>
                    </TableBody>
                  )
                })}
              </Table>
            )
          })}
        </TableContainer>
      </Box>
    </>,
    document.body)
}