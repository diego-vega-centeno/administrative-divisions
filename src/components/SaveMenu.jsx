import { createPortal } from "react-dom";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { saveActionSection } from "../styles/Main";
import { addToolsButton } from "../styles/SelectAddDropdown";
import { useState, useRef } from "react";
import { backdrop, basicMenu, textField, tableCell, headerCell, tableContainer } from "../styles/Menu.jsx";
import addFlatData from '../add_flat.json'

import Typography from "@mui/material/Typography";
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import { saveLayerToDB } from '../utils/database.js'
import { debugLog, errorLog } from "../utils/logger.js";

let addTextIndex = {}
for (const ele of addFlatData) {
  addTextIndex[ele.id] = ele.text
}


export default function SaveMenu({ open, onClose, onError, selectedNodes }) {
  if (!open) return null;
  const [isProgressIconActive, setIsProgressIconActive] = useState(false);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const titleInputRef = useRef(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      titleInputRef.current?.focus();
      return;
    }

    setError('');
    setIsProgressIconActive(true);
    try {
      const saveResponse = await saveLayerToDB(title, selectedNodes);
      debugLog(saveResponse);
    } catch (error) {
      errorLog(error);
      if (error?.code === 'duplicate_entry') {
        setError('This title already exists. Choose another one.');
        titleInputRef.current?.focus();
        setIsProgressIconActive(false);
        return;
      }

      onError(error?.message || 'Unexpected error');
    }

    setIsProgressIconActive(false);
    setIsSaved(true);
  };

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
    if (error) setError('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  function getParentNames(parentsIds) {
    let parentNames = [];
    parentsIds.forEach(id => {
      if (id !== '#') parentNames.push(addTextIndex[id])
    });
    if (!parentNames.length) parentNames = ['World'];
    return parentNames;
  }


  return createPortal(
    <>
      <Box
        onClick={() => onClose()}
        sx={backdrop}
      />
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={basicMenu}
      >
        <Typography>Save layer</Typography>
        <Typography variant="body2">Title</Typography>
        <TextField
          inputRef={titleInputRef}
          sx={textField}
          fullWidth
          placeholder="add a title"
          value={title}
          onChange={handleTitleChange}
          onKeyDown={handleKeyDown}
          error={Boolean(error)}
          helperText={error}
          disabled={isProgressIconActive}
          autoFocus
        />
        <TableContainer sx={tableContainer}>
          <Table>
            <TableHead >
              <TableRow >
                <TableCell align="center" sx={headerCell}>id</TableCell>
                <TableCell align="center" sx={headerCell}>name</TableCell>
                <TableCell align="center" sx={headerCell}>parents</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedNodes.map((node) => (
                <TableRow key={node.id}>
                  <TableCell align="center" sx={tableCell}>{node.id}</TableCell>
                  <TableCell align="center" sx={tableCell}>{node.text}</TableCell>
                  <TableCell align="center" sx={tableCell}>{getParentNames(node.parents).join('/')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={saveActionSection}>
          <Button
            sx={addToolsButton}
            size='small'
            variant="contained"
            type="submit"
            disabled={isProgressIconActive || isSaved}
          >Save</Button>
          {isProgressIconActive && (
            <CircularProgress thickness={9} size={30} />
          )}
          {isSaved && <Typography>saved!</Typography>}
        </Box>
      </Box>
    </>,
    document.body)
}