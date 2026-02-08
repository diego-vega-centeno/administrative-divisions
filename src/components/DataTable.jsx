import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from "@mui/material/TableRow";
import {
  table, tableCell,
  headerCell, compareTableContainer
} from "../styles/Menu.jsx";
import { dataIndex, getParentNames } from "../utils/addData.js";
import { useEffect, useState } from 'react';

export default function DataTable({ osmRels }) {
  const [dataRels, setDataRels] = useState([])

  useEffect(() => {
    const newDataRels = [];
    for (const rel of osmRels) {
      const id = rel.id.toString();
      const newRel = {};
      newRel['id'] = id;
      newRel['admin_level'] = dataIndex[id].admin_level;
      newRel['text'] = dataIndex[id].text;
      newRel['parents'] = getParentNames(id);
      newDataRels.push(newRel);
    }
    setDataRels(newDataRels);
  }, [osmRels])


  return (
    <TableContainer sx={compareTableContainer}>
      <Table sx={table}>
        <TableHead >
          <TableRow >
            <TableCell align="center" sx={headerCell}>admin level</TableCell>
            <TableCell align="center" sx={headerCell}>id</TableCell>
            <TableCell align="center" sx={headerCell}>name</TableCell>
            <TableCell align="center" sx={headerCell}>parents</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dataRels.map((rel) => (
            <TableRow key={rel.id}>
              <TableCell align="center" sx={tableCell}>{rel.admin_level}</TableCell>
              <TableCell align="center" sx={tableCell}>{rel.id}</TableCell>
              <TableCell align="center" sx={tableCell}>{rel.text}</TableCell>
              <TableCell align="center" sx={tableCell}>{rel.parents}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}