import { useState } from 'react';
import styles from './ProductSection.module.css';
import { FAQS } from '../../../data/faqs';

const ChevronIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#999"
    strokeWidth="2.2"
    strokeLinecap="round"
    style={{ flexShrink: 0 }}
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export function FAQ() {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <div className={styles.faq}>
      <span className={styles.faqTitle}>Preguntas frecuentes</span>
      {FAQS.map((item, i) => (
        <div key={i} className={styles.faqItem}>
          <button
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            className={styles.faqBtn}
            aria-expanded={openIdx === i}
          >
            <span>{item.q}</span>
            <span style={{ transform: openIdx === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s', display: 'flex' }}>
              <ChevronIcon />
            </span>
          </button>
          <div className={`${styles.faqBody} ${openIdx === i ? styles.faqBodyOpen : ''}`}>
            <div>
              <p>{item.a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
