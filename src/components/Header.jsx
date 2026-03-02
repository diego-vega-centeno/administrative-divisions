import styles from '../styles/Header.module.css'
import NavSidebar from './navSidebar.jsx'
import { useNavigate } from 'react-router'

export default function Header() {
  const navigate = useNavigate();
  return (
    <header className={styles.header}>
      <span>OSM administrative divisions</span>
      <div className={styles['header-menu']}>
        <span className={styles['header-menu-item-about']}
          onClick={()=>navigate('/about')}
        >about</span>
        <div className={styles['header-menu-item']}>
          <NavSidebar />
        </div>
      </div>
    </header>
  )
}