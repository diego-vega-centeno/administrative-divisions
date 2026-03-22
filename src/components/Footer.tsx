import styles from "../styles/Footer.module.css";
import { FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <span>&copy; Cocobongo</span>
      <a href="https://www.linkedin.com/" className={styles["footer-linkedin"]}>
        <FontAwesomeIcon icon={faLinkedin as IconProp} />
      </a>
    </footer>
  );
}
