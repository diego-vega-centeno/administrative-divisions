import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { saveActionSection } from "../styles/Main";
import { addToolsButton } from "../styles/SelectAddDropdown.js";
import { useState, useRef, Dispatch, SetStateAction } from "react";
import {
  basicMenu,
  textField,
  table,
  tableCell,
  headerCell,
  tableContainer,
  modalCenter,
  menuHeader,
} from "../styles/Menu.js";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import { saveLayerToDB } from "../utils/database.js";
import logger from "../utils/logger.js";
import Modal from "@mui/material/Modal";
import {
  SelectedNodesType,
  CustomError,
  FormattedRelsType,
} from "../types/index.js";

interface SaveMenuProsp {
  open: boolean;
  onClose: () => void;
  onError: (msg: string) => void;
  selectedNodes: SelectedNodesType;
  getNodePath: (id: string) => string;
}

interface FormattedRel {
  relId: string;
  relName: string;
  adminLevel: string;
  parentsNames: string | undefined;
}

export default function SaveMenu({
  open,
  onClose,
  onError,
  selectedNodes,
  getNodePath,
}: SaveMenuProsp) {
  const [isProgressIconActive, setIsProgressIconActive] = useState(false);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = async (event?: React.SubmitEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      titleInputRef.current?.focus();
      return;
    }

    setError("");
    setIsProgressIconActive(true);
    try {
      const formattedRels: FormattedRelsType = selectedNodes.map((ele) => ({
        relId: ele.id,
        relName: ele.text,
        adminLevel: ele.original.admin_level,
        parentsNames: getNodePath(ele.id),
      }));
      const saveResponse = await saveLayerToDB(title, formattedRels);
    } catch (error) {
      logger.error(error);
      const err = error as CustomError;
      if (err?.code === "duplicate_entry") {
        setError("This title already exists. Choose another one.");
        titleInputRef.current?.focus();
        setIsProgressIconActive(false);
        return;
      }

      onError(err?.message || "Unexpected error");
    }

    setIsProgressIconActive(false);
    setIsSaved(true);
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
    if (error) setError("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Modal open={open} onClose={onClose} sx={modalCenter}>
      <Box component="form" onSubmit={handleSubmit} sx={basicMenu}>
        <Box sx={menuHeader}>
          <Typography>Save layer</Typography>
        </Box>
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
          <Table sx={table}>
            <TableHead>
              <TableRow>
                <TableCell align="center" sx={headerCell}>
                  admin level
                </TableCell>
                <TableCell align="center" sx={headerCell}>
                  id
                </TableCell>
                <TableCell align="center" sx={headerCell}>
                  name
                </TableCell>
                <TableCell align="center" sx={headerCell}>
                  parents names
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedNodes.map((rel) => (
                <TableRow key={rel.id}>
                  <TableCell align="center" sx={tableCell}>
                    {rel.original.admin_level}
                  </TableCell>
                  <TableCell align="center" sx={tableCell}>
                    {rel.id}
                  </TableCell>
                  <TableCell align="center" sx={tableCell}>
                    {rel.text}
                  </TableCell>
                  <TableCell align="center" sx={tableCell}>
                    {getNodePath(rel.id)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={saveActionSection}>
          <Button
            sx={addToolsButton}
            size="small"
            variant="contained"
            type="submit"
            disabled={isProgressIconActive || isSaved}
          >
            Save
          </Button>
          {isProgressIconActive && <CircularProgress thickness={9} size={30} />}
          {isSaved && <Typography>saved!</Typography>}
        </Box>
      </Box>
    </Modal>
  );
}
