import styles from './TrustStrip.module.css';
import { TRUST_BADGES } from '../../data/site';

const ICONS = [
  <svg key="shield" width="18" height="18" fill="none" stroke="#555" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  <svg key="truck" width="18" height="18" fill="none" stroke="#555" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  <svg key="card" width="18" height="18" fill="none" stroke="#555" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>,
];

const ITEMS = TRUST_BADGES.map((label, i) => ({ label, icon: ICONS[i] }));

export function TrustStrip() {
  return (
    <div className={styles.strip}>
      {ITEMS.map(({ label, icon }) => (
        <div key={label} className={styles.item}>
          {icon}
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
