// Scroll suave que respeta prefers-reduced-motion (el kill-switch CSS de
// global.css no cubre el smooth-scroll disparado por JS).
function smoothBehavior() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

export function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: smoothBehavior() });
}

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: smoothBehavior() });
}
