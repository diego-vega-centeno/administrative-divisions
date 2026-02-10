import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import {
  tableContainerHeader
} from "../styles/Menu.jsx";
import { chartsContainer, chartContainer } from '../styles/Menu.jsx';
import CircularProgress from '@mui/material/CircularProgress';
import { progressIcon } from '../styles/Main.jsx';
import BarChart from './charts/BarChart.jsx';

export default function ChartsSection({ computedDataRels, isComputingIconActive }) {

  if (!computedDataRels.length && !isComputingIconActive) return null;

  return (
    isComputingIconActive ? (
      <Box >
        <ListItem sx={tableContainerHeader}>
          <ListItemText primary={"Compare table"} />
        </ListItem>
        <Box sx={progressIcon}>
          <CircularProgress thickness={9} size={70} />
        </Box>
      </Box>
    ) : (
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
  )
}