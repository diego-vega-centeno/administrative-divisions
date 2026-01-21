import { createPortal } from "react-dom";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { progressDownloadIcon } from "../styles/Main";
import { addToolsButton } from "../styles/SelectAddDropdown";
import { useState } from "react";
import { backdrop, basicMenu, textField, tableCell, headerCell, tableContainer } from "../styles/Menu.jsx";

import Typography from "@mui/material/Typography";
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";

export default function SaveMenu({ open, onClose, selectedNodes }) {
  if (!open) return null;
  const [isProgressIconActive, setIsProgressIconActive] = useState(false);
  const [title, setTitle] = useState('');

  function handleSave() {
    console.log('selectedNodes: ', selectedNodes);
    // setIsProgressIconActive(true);
    // saveLayer(selectedNodes)
  }

  return createPortal(
    <>
      <Box
        onClick={() => onClose()}
        sx={backdrop}
      />
      <Box sx={basicMenu}>
        <Typography>Save layer</Typography>
        <Typography variant="body2">Title</Typography>
        <TextField
          sx={textField}
          fullWidth
          placeholder="add a title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <TableContainer sx={tableContainer}>
          <Table>
            <TableHead >
              <TableRow >
                <TableCell align="center" sx={headerCell}>id</TableCell>
                <TableCell align="center" sx={headerCell}>name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedNodes.map((node) => (
                <TableRow key={node.id}>
                  <TableCell align="center" sx={tableCell}>{node.id}</TableCell>
                  <TableCell align="center" sx={tableCell}>{node.text}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={progressDownloadIcon}>
          <Button sx={addToolsButton}
            size='small'
            variant="contained"
            onClick={handleSave}
          >Save</Button>
          {isProgressIconActive && (
            <CircularProgress thickness={9} size={30} />
          )}
        </Box>

      </Box>
    </>,
    document.body)
}