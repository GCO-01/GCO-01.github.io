import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function NotFound() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center', padding: 24 }}>
      <strong style={{ fontFamily: 'var(--font-poppins)', fontSize: 56, letterSpacing: '-0.06em', lineHeight: 1 }}>404</strong>
      <p style={{ fontFamily: 'var(--font-opensans)', opacity: 0.8 }}>
        Esta página no existe (o el huevo se la comió).
      </p>
      <Link to="/">
        <Button size="md">Volver al inicio</Button>
      </Link>
    </div>
  );
}
