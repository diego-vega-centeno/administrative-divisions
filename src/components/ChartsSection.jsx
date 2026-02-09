import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import {
  tableContainerHeader
} from "../styles/Menu.jsx";
import { chartsContainer, chartContainer } from '../styles/Menu.jsx';

import BarChart from './charts/BarChart.jsx';

export default function ChartsSection({ computedDataRels }) {

  return (
    <Box>
      <ListItem sx={tableContainerHeader}>
        <ListItemText primary={"Charts"} />
      </ListItem>
      <Box sx={chartsContainer}>
        <Box sx={chartContainer}>
          <BarChart
            computedDataRels={computedDataRels}
            config={{
              prop: 'population',
              title: 'population',
              color: 'rgba(30, 136, 229, 0.8)'
            }}
          />
        </Box>
        <Box sx={chartContainer}>
          <BarChart
            computedDataRels={computedDataRels}
            config={{
              prop: 'area',
              title: 'area',
              color: 'rgba(233, 237, 22, 0.8)'
            }}
          />
        </Box>
        <Box sx={chartContainer}>
          <BarChart
            computedDataRels={computedDataRels}
            config={{
              prop: 'popDensity',
              title: 'population density',
              color: 'rgba(233, 237, 22, 0.8)'
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}