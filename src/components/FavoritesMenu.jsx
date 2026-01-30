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
  const [relations, setRelations] = useState([]);

  useEffect(() => {
    async function getUserRels() {
      try {
        const relations = await getUserLayersRelations();
        debugLog(relations);
        setRelations(relations.data);
      } catch (error) {
        errorLog(`Failed to fetch layer relations: ${error.message}`)
      }
    }

    getUserRels();
  }, [])

  // early returns should be after hooks
  if (!open) return null;

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
          <Table>
            <TableHead >
              <TableRow >
                <TableCell align="center" sx={headerCell}>layer title</TableCell>
                <TableCell align="center" sx={headerCell}>id</TableCell>
                <TableCell align="center" sx={headerCell}>name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {relations.map(rel => {
                return (
                  <TableRow key={rel.id}>
                    <TableCell align="center" sx={tableCell}>{rel.layer_title}</TableCell>
                    <TableCell align="center" sx={tableCell}>{rel.osm_relation_id}</TableCell>
                    <TableCell align="center" sx={tableCell}>{rel.osm_relation_name}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>,
    document.body)
}