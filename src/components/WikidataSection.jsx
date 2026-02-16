import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import {
  tableContainerHeader, tableContainerBody, tagsItemList
} from '../styles/Menu.jsx';
import Box from '@mui/material/Box';
import { listItem } from '../styles/Menu.jsx';
import { useState, useEffect, memo } from 'react';
import Table from './Table.jsx';
import { progressIcon } from '../styles/Main.jsx';
import CircularProgress from '@mui/material/CircularProgress';
import BarChart from './charts/BarChart.jsx';

const WikidataSection = memo(({ wikidataIndex, isFetchingIconActive }) => {

  const [selectedIdMap, setSelectedIdMap] = useState({});

  useEffect(() => {
    if (Object.keys(wikidataIndex).length > 0) {
      setSelectedIdMap(wikidataIndex[Object.keys(wikidataIndex)[0]])
    };
  }, [wikidataIndex]);

  if (!Object.keys(wikidataIndex).length && !isFetchingIconActive) return null;

  return (
    isFetchingIconActive ? (
      <Box >
        <ListItem sx={tableContainerHeader}>
          <ListItemText primary={"Wikidata information"} />
        </ListItem>
        <Box sx={progressIcon}>
          <CircularProgress thickness={9} size={70} />
        </Box>
      </Box>
    ) : (
      <Box>
        <ListItem sx={tableContainerHeader}>
          <ListItemText primary={"Wikidata information"} />
        </ListItem>
        <Box sx={tableContainerBody}>
          <Box>
            <Box sx={tagsItemList}>
              {Object.keys(wikidataIndex).map(id => (
                <ListItemButton
                  key={id}
                  disableRipple
                  sx={listItem}
                  onClick={() => setSelectedIdMap(wikidataIndex[id])}
                >
                  {id}
                </ListItemButton>
              )
              )}
            </Box>
          </Box>
          <Box>
            <Table selectedIdMap={selectedIdMap} />
            <Box sx={{width: '80%', padding:'3rem 2rem'}}>
              <BarChart
                chartData={selectedIdMap['populationTS'] ?
                  selectedIdMap['populationTS'].map(point => ({ x: point.date, y: point.pop }))
                  :
                  []
                }
                labels={Object.keys(wikidataIndex)}
                config={{
                  title: 'population',
                  color: 'rgba(30, 136, 229, 0.8)'
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    )
  )
});

export default WikidataSection;