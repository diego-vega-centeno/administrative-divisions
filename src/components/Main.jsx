import { useEffect, useRef } from 'react';
import styles from '../styles/Main.module.css'
import Footer from './Footer.jsx'
import SearchDropdown from './SearchDropdown.jsx'
import SelectAddDropdown from './SelectAddDropdown.jsx'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function Main() {

  const mapRef = useRef(null); // will hold map instance from leaflet
  const mapContainerRef = useRef(null); // will hold map container dom element

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current).setView([0, 0], 1);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapRef.current);

  }, []);


  return (
    <main className={styles.main}>
      <aside className={styles.aside}>
        <SearchDropdown text='Search' />
        <SelectAddDropdown text='Select administrative division' />
      </aside>
      <section className={styles['main-body']}>
        <div className={styles['main-content']}>
          <div className={styles['map-container']}>
            <div
              ref={mapContainerRef}
              className={styles['map']}
            />
          </div>
        </div>
        <Footer />
      </section>
    </main>
  )
}