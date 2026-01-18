import styles from '../styles/Header.module.css'
import NavSidebar from './navSidebar.jsx'

export default function Header() {
  return (
    <header className={styles.header}>
      <span>OSM administrative divisions</span>
      <div className={styles['header-menu']}>
        <span className={styles['header-menu-item']}>about</span>
        <div className={styles['header-menu-item']}>
          <NavSidebar />
        </div>
      </div>
    </header>
  )
}