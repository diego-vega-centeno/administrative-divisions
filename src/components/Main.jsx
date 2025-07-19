import styles from '../styles/Main.module.css'

export default function Main() {
  return (
    <main className={styles.main}>
      <aside className={styles.aside}></aside>
      <section id='main-content' className={styles['main-content']}></section>
    </main>
  )
}