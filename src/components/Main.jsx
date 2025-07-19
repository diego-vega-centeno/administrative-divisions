import { useState } from 'react'
import styles from '../styles/Main.module.css'
import Footer from './Footer.jsx'

export default function Main() {
  const [show, setShow] = useState(true)
  const [show2, setShow2] = useState(true)
  return (
    <main className={styles.main}>
      <aside className={styles.aside}>
        <button onClick={() => setShow(!show)}>expand</button>
        <ul style={{ display: `${show ? 'block' : 'none'}` }}>
          {Array(100).fill().map((_, i) => <li key={i} style={{ backgroundColor: 'red', margin: '1px' }}></li>)}
        </ul>
      </aside>
      <section  className={styles['main-body']}>
        <div className={styles['main-content']}>
          <button onClick={() => setShow2(!show2)}>expand</button>
          <div style={{ display: `${show2 ? 'block' : 'none'}`, height: '1000px', backgroundColor: 'red', margin: '10px' }}></div>

        </div>
        <Footer />
      </section>
    </main>
  )
}