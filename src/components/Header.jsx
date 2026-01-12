import styles from '../styles/Header.module.css'
import NavSidebar from './navSidebar.jsx'
import Box from '@mui/material/Box';

export default function Header() {
  return (
    <header className={styles.header}>
      <span>Administrative divisions</span>
      <div className={styles['header-menu']}>
        <span className={styles['header-menu-item']}>about</span>
        <div className={styles['header-menu-item']}>
          <NavSidebar />
        </div>
      </div>
    </header>
  )
}