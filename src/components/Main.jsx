import { useState } from 'react'
import styles from '../styles/Main.module.css'
import Footer from './Footer.jsx'
import SearchDropdown from './SearchDropdown.jsx'
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { searchFieldBox, searchField, searchFieldIconBox } from '../styles/SearchDropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

export default function Main() {
  const [show2, setShow2] = useState(true);
  const itemList = <ul>
    {Array(100).fill().map((_, i) => <li key={i} style={{ backgroundColor: 'red', margin: '1px' }}></li>)}
  </ul>;
  const search = <Box sx={searchFieldBox}>
    <TextField
      sx={searchField} placeholder="search" variant="outlined"
    />
    <Box sx={searchFieldIconBox}>
      <FontAwesomeIcon icon={faSearch} />
    </Box>
  </Box>;

  return (
    <main className={styles.main}>
      <aside className={styles.aside}>
        <SearchDropdown text='Search' content={search} />
        <SearchDropdown text='Select administrative division' content={itemList} />
      </aside>
      <section className={styles['main-body']}>
        <div className={styles['main-content']}>
          <button onClick={() => setShow2(!show2)}>expand</button>
          <div style={{ display: `${show2 ? 'block' : 'none'}`, height: '1000px', backgroundColor: 'red', margin: '10px' }}></div>

        </div>
        <Footer />
      </section>
    </main>
  )
}