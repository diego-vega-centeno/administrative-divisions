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
import { calculatePropsFromGeo } from '../utils/calculateFromGeo.js';
import osmtogeojson from 'osmtogeojson';

export default function DataTable({ osmRels }) {
  const [dataRels, setDataRels] = useState([])

  useEffect(() => {
    const newDataRels = [];
    for (const rel of osmRels) {
      // rel props
      const id = rel.id.toString();
      const relProps = {};
      relProps['id'] = id;
      relProps['admin_level'] = dataIndex[id].admin_level;
      relProps['text'] = dataIndex[id].text;
      relProps['parents'] = getParentNames(id);
      relProps['population'] = rel.tags?.population ? rel.tags.population : '--'
          '--'

      // geo computed props
      const geoJSON = osmtogeojson({ elements: [rel] });
      const calcProps = calculatePropsFromGeo(geoJSON);


      // derived props
      const derivedProps = {
        popDensity: rel.tags?.population ?
          rel.tags?.population / calcProps.area :
          '--'
      }

      const stringProps = { ...relProps, ...calcProps, ...derivedProps };
      for (const [key, val] of Object.entries(stringProps)) {
        if(typeof val === 'number') {
          stringProps[key] = val.toFixed(2);
        }
        
      }
      newDataRels.push(stringProps);
    }

    console.log(newDataRels);
    setDataRels(newDataRels);
  }, [osmRels])


  return (
    <TableContainer sx={compareTableContainer}>
      <Table sx={table}>
        <TableHead >
          <TableRow >
            <TableCell align="center" sx={headerCell}>admin level</TableCell>
            <TableCell align="center" sx={headerCell}>name</TableCell>
            <TableCell align="center" sx={headerCell}>area (km²)</TableCell>
            <TableCell align="center" sx={headerCell}>perimeter (km)</TableCell>
            <TableCell align="center" sx={headerCell}>population</TableCell>
            <TableCell align="center" sx={headerCell}>pop density (person/km²)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dataRels.map((rel) => (
            <TableRow key={rel.id}>
              <TableCell align="center" sx={tableCell}>{rel.admin_level}</TableCell>
              <TableCell align="center" sx={tableCell}>{rel.text}</TableCell>
              <TableCell align="center" sx={tableCell}>{rel.area}</TableCell>
              <TableCell align="center" sx={tableCell}>{rel.length}</TableCell>
              <TableCell align="center" sx={tableCell}>{rel.population}</TableCell>
              <TableCell align="center" sx={tableCell}>{rel.popDensity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}