import styles from './TrustStrip.module.css';

const ITEMS = [
  {
    label: 'Garantía 30 días',
    icon: <svg width="18" height="18" fill="none" stroke="#555" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  },
  {
    label: 'Envío gratis Lima',
    icon: <svg width="18" height="18" fill="none" stroke="#555" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  },
  {
    label: 'Pago 100% seguro',
    icon: <svg width="18" height="18" fill="none" stroke="#555" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>,
  },
];

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
