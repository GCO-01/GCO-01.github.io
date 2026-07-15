import { useCountdown, padTime } from '../../../hooks/useCountdown';

// Componente hoja: aísla el re-render por segundo del timer para que
// no arrastre a toda la ProductSection.
export function CountdownClock({ className }) {
  const timeLeft = useCountdown();
  return (
    <div className={className}>
      {padTime(timeLeft.h)}:{padTime(timeLeft.m)}:{padTime(timeLeft.s)}
    </div>
  );
}
