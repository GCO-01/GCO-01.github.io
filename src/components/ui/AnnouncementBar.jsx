import styles from './AnnouncementBar.module.css';

export function AnnouncementBar({ text }) {
  return <div className={styles.bar}>{text}</div>;
}
