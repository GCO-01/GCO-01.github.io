import { useState, useEffect } from 'react';
import { TIMER_DURATION_S } from '../data/config';

function msDiff(end) {
  const s = Math.max(0, Math.floor((end - Date.now()) / 1000));
  return { h: Math.floor(s / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
}

function getOrCreateEnd() {
  try {
    const saved = JSON.parse(localStorage.getItem('pp_timer_end'));
    if (saved && saved > Date.now()) return saved;
  } catch (_) {}
  const end = Date.now() + TIMER_DURATION_S * 1000;
  try { localStorage.setItem('pp_timer_end', JSON.stringify(end)); } catch (_) {}
  return end;
}

export function useCountdown() {
  const [end] = useState(getOrCreateEnd);
  const [timeLeft, setTimeLeft] = useState(() => msDiff(end));
  useEffect(() => {
    const id = setInterval(() => setTimeLeft(msDiff(end)), 1000);
    return () => clearInterval(id);
  }, [end]);
  return timeLeft;
}

export function padTime(n) {
  return String(n).padStart(2, '0');
}
