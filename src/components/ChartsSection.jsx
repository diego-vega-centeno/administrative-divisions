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
  const labels = computedDataRels.map(rel => rel.name);

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
              chartData={computedDataRels.map(rel => parseInt(rel['population']))}
              labels={labels}
              config={{
                title: 'population',
                color: 'rgba(30, 136, 229, 0.8)'
              }}
            />
          </Box>
          <Box sx={chartContainer}>
            <BarChart
              chartData={computedDataRels.map(rel => parseInt(rel['area']))}
              labels={labels}
              config={{
                title: 'area',
                color: 'rgba(233, 237, 22, 0.8)'
              }}
            />
          </Box>
          <Box sx={chartContainer}>
            <BarChart
              chartData={computedDataRels.map(rel => parseInt(rel['popDensity']))}
              labels={labels}
              config={{
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