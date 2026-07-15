import { Component } from 'react';
import { BRAND } from '../../data/site';

// Evita la pantalla blanca si un chunk lazy falla al cargar (red caída,
// deploy en medio de la sesión) o un error de render no controlado.
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center', padding: 24 }}>
        <strong style={{ fontFamily: 'var(--font-poppins)', fontSize: 24, letterSpacing: '-0.04em' }}>{BRAND}</strong>
        <p style={{ fontFamily: 'var(--font-opensans)', opacity: 0.8 }}>
          Algo salió mal al cargar esta parte del sitio.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, padding: '10px 24px', borderRadius: 'var(--radius-btn)', border: '1px solid var(--color-border-light)', background: 'none', color: 'inherit', cursor: 'pointer' }}
        >
          Reintentar
        </button>
      </div>
    );
  }
}
