import { render, screen } from '@testing-library/react';
import { beforeEach } from 'vitest';
import { App } from './App';

// jsdom no implementa IntersectionObserver, matchMedia ni scrollTo
beforeEach(() => {
  localStorage.clear();
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  window.matchMedia = query => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  });
  window.scrollTo = () => {};
  Element.prototype.scrollIntoView = () => {};
});

test('la home renderiza sin crashear', () => {
  window.history.pushState({}, '', '/');
  render(<App />);
  expect(screen.getByRole('heading', { level: 1, name: /el huevo fue/i })).toBeInTheDocument();
});

test('una ruta desconocida muestra el 404 con link al inicio', () => {
  window.history.pushState({}, '', '/no-existe');
  render(<App />);
  expect(screen.getByText('404')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /volver al inicio/i })).toBeInTheDocument();
});
