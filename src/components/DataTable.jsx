import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemText from '@mui/material/ListItemText';

import { visuallyHidden } from '@mui/utils';
import {
  table, tableCell,
  headerCell, compareTableContainer, compareTableSortLabel,
  tableContainerHeader
} from "../styles/Menu.jsx";
import { dataIndex, getParentNames } from "../utils/addData.js";
import { useEffect, useState } from 'react';
import { calculatePropsFromGeo } from '../utils/calculateFromGeo.js';
import osmtogeojson from 'osmtogeojson';

export default function DataTable({ osmRels }) {
  const [rows, setRows] = useState([]);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');

  useEffect(() => {
    const newDataRels = [];
    for (const rel of osmRels) {
      // rel props
      const id = rel.id.toString();
      const relProps = {};
      relProps['id'] = id;
      relProps['admin_level'] = dataIndex[id].admin_level;
      relProps['name'] = dataIndex[id].text;
      relProps['parents'] = getParentNames(id);
      relProps['population'] = rel.tags?.population ? parseInt(rel.tags.population) : null

      // geo computed props
      const geoJSON = osmtogeojson({ elements: [rel] });
      const calcProps = calculatePropsFromGeo(geoJSON);


      // derived props
      const derivedProps = {
        popDensity: rel.tags?.population ?
          rel.tags?.population / calcProps.area :
          null
      }

      const rawProps = { ...relProps, ...calcProps, ...derivedProps };

      newDataRels.push(rawProps);
    }

    setRows([...newDataRels].sort((a, b) => compare(a, b, order, orderBy)))
  }, [osmRels])


  const headerCells = [
    { id: 'admin_level', label: 'admin level', numeric: false, },
    { id: 'name', label: 'name', numeric: false, },
    { id: 'area', label: 'area (km²)', numeric: true, },
    { id: 'perimeter', label: 'perimeter (km)', numeric: true },
    { id: 'population', label: 'population', numeric: true },
    { id: 'popDensity', label: 'pop density (person/km²)', numeric: true }
  ];

  function compare(a, b, order, orderBy) {
    const av = a[orderBy];
    const bv = b[orderBy];

    if (av === null || bv === null) return 0;
    if (av === null) return 1;
    if (bv === null) return -1;

    if (av < bv) return order === 'asc' ? -1 : 1;
    if (av > bv) return order === 'asc' ? 1 : -1;
    return 0;
  }

  function handleRequestSort(name) {
    const isAsc = (orderBy === name) && (order === 'asc');
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(name);
  };

  useEffect(() => {
    setRows(prev => [...prev].sort((a, b) => compare(a, b, order, orderBy)));
  }, [order, orderBy]);


  function formatValue(val) {
    if (typeof val === 'number') return val.toFixed(2);
    if (val === null) return '--';
    return val;
  }

  return (
    <Box>
      <ListItem sx={tableContainerHeader}>
        <ListItemText primary={"Compare table"} />
      </ListItem>
      <TableContainer sx={compareTableContainer}>
        <Table sx={table}>
          <TableHead >
            <TableRow >
              {headerCells.map(header => (
                <TableCell
                  sx={headerCell}
                  key={header.id}
                  align='center'
                  sortDirection={orderBy === header.id ? order : false}
                >
                  <TableSortLabel
                    sx={compareTableSortLabel}
                    active={orderBy === header.id}
                    direction={orderBy === header.id ? order : 'asc'}
                    onClick={() => handleRequestSort(header.id)}
                  >
                    {header.label}
                    {orderBy === header.id ? (
                      // for screen readers
                      <Box component="span" sx={visuallyHidden}>
                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                      </Box>
                    ) : null}
                  </TableSortLabel>
                </TableCell>
              ))
              }
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((rel) => (
              <TableRow key={rel.id}>
                <TableCell align="center" sx={tableCell}>{formatValue(rel.admin_level)}</TableCell>
                <TableCell align="center" sx={tableCell}>{rel.name}</TableCell>
                <TableCell align="center" sx={tableCell}>{formatValue(rel.area)}</TableCell>
                <TableCell align="center" sx={tableCell}>{formatValue(rel.perimeter)}</TableCell>
                <TableCell align="center" sx={tableCell}>{formatValue(rel.population)}</TableCell>
                <TableCell align="center" sx={tableCell}>{formatValue(rel.popDensity)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}