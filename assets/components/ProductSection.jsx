// ProductSection.jsx — Sección de producto / embudo de conversión
// Depende de: React (global), product-section.css

const { useState, useEffect, useRef } = React;
const OS = "'Open Sans', sans-serif";

const FLAVORS = [
  { id: 'chocolate', label: 'Chocolate Criollo', desc: 'Cacao de Chiapas, textura aterciopelada',      img: 'assets/bottle-chocolate.png' },
  { id: 'mango',     label: 'Mango',             desc: 'Mango Ataulfo natural con un toque de canela', img: 'assets/bottle-mango.png'     },
  { id: 'combinado', label: 'Combinado',          desc: '2 Chocolate + 2 Mango + 2 sabores sorpresa',  img: 'assets/bottle-combinado.png' },
];

const FAQS = [
  { q: '¿Por qué clara de huevo y no whey?',
    a: 'La proteína de clara de huevo es más limpia, sin lactosa y fácil de digerir. Perfil de aminoácidos completo. Sin bloating, sin problemas digestivos. Es lo que siempre debió ser un shake de proteína.' },
  { q: '¿Qué ingredientes lleva?',
    a: 'Clara de huevo pasteurizada, fruta real (mango Ataulfo o cacao), extracto de vainilla natural. Sin conservadores, sin colorantes artificiales. Lo que dice la etiqueta — y nada más.' },
  { q: '¿Cuánta proteína tiene por botella?',
    a: 'Cada botella entrega 30G de proteína pura en solo 189 calorías. Mejor ratio proteína/caloría que la mayoría de proteínas en polvo del mercado — ya mezclado y listo para tomar.' },
  { q: '¿Cuándo llegará mi pedido?',
    a: 'Enviamos en 1–3 días hábiles a Lima Metropolitana. Los pedidos de Early Access reciben etiqueta de envío prioritario el mismo día.' },
];

const BENEFITS = [
  'Sin lactosa', 'Sin azúcar añadida',
  'Proteína de clara de huevo', 'Ingredientes 100% naturales',
  'Sin saborizantes artificiales', 'Solo 189 Calorías',
];

function initTimer() {
  try {
    const saved = JSON.parse(localStorage.getItem('pp_timer_end'));
    if (saved && saved > Date.now()) return msDiff(saved);
  } catch (_) {}
  const end = Date.now() + (23 * 3600 + 47 * 60 + 12) * 1000;
  localStorage.setItem('pp_timer_end', JSON.stringify(end));
  return msDiff(end);
}

function msDiff(end) {
  const s = Math.max(0, Math.floor((end - Date.now()) / 1000));
  return { h: Math.floor(s / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
}

function ProductSection({ onAddToCart }) {
  const [flavor,   setFlavor]   = useState('combinado');
  const [protein,  setProtein]  = useState('30g');
  const [qty,      setQty]      = useState(1);
  const [added,    setAdded]    = useState(false);
  const [openFaq,  setOpenFaq]  = useState(null);
  const [sticky,   setSticky]   = useState(false);
  const [timeLeft, setTimeLeft] = useState(initTimer);
  const ctaRef = useRef(null);

  // Countdown timer — persiste entre reloads via localStorage
  useEffect(() => {
    const end = JSON.parse(localStorage.getItem('pp_timer_end'));
    const id = setInterval(() => setTimeLeft(msDiff(end)), 1000);
    return () => clearInterval(id);
  }, []);

  // Sticky bar trigger via IntersectionObserver
  useEffect(() => {
    if (!ctaRef.current) return;
    const obs = new IntersectionObserver(([e]) => setSticky(!e.isIntersecting), { threshold: 0 });
    obs.observe(ctaRef.current);
    return () => obs.disconnect();
  }, []);

  const cur      = FLAVORS.find(f => f.id === flavor);
  const pad      = n => String(n).padStart(2, '0');
  const fmtPrice = n => `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const price    = fmtPrice(2299 * qty);

  function handleAdd() {
    setAdded(true);
    onAddToCart();
    setTimeout(() => setAdded(false), 2400);
  }

  const divider = { borderBottom: '1px solid #e8e8ec', marginBottom: 22, paddingBottom: 22 };

  return (
    <>
      {/* ── Sticky purchase bar ──────────────────────────────────────── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
        height: 64, background: '#111',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px',
        transform: sticky ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.32s cubic-bezier(0.25,0.46,0.45,0.94)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
      }} className="pp-sticky-pad">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src={cur.img} style={{ height: 42, objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))' }} alt="" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontFamily: OS, fontWeight: 700, fontSize: 14, color: '#f4f4f6', letterSpacing: '-0.03em' }}>{cur.label} · 6 Pack</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: OS, fontWeight: 700, fontSize: 14, color: '#e3796c' }}>S/ 2,299.00</span>
              <span style={{ fontFamily: OS, fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through' }}>S/ 4,179.99</span>
            </div>
          </div>
        </div>
        <button onClick={handleAdd} style={{
          height: 42, padding: '0 28px', borderRadius: 21, border: 'none', cursor: 'pointer',
          background: added ? '#302f9b' : 'linear-gradient(135deg,#e3796c,#db5242 55%,#302f9b)',
          fontFamily: OS, fontWeight: 800, fontSize: 13, letterSpacing: '-0.01em',
          color: '#fff', textTransform: 'uppercase',
          transition: 'all 0.3s', boxShadow: '0 4px 16px rgba(219,82,66,0.3)',
        }}>{added ? '¡Agregado! ✓' : 'AGREGAR AL CARRITO'}</button>
      </div>

      {/* ── Sección principal ────────────────────────────────────────── */}
      <section id="product-section" style={{
        width: '100%',
        background: 'radial-gradient(ellipse 160% 80% at 50% -10%, #ffffff 0%, #f4f4f6 100%)',
        paddingBottom: 96,
      }}>

        {/* Announcement bar */}
        <div style={{
          width: '100%', padding: '9px 0',
          background: 'linear-gradient(90deg,#302f9b 0%,#6b3fa0 30%,#db5242 65%,#302f9b 100%)',
          backgroundSize: '200% 100%',
          animation: 'barScroll 8s linear infinite',
          textAlign: 'center',
          fontFamily: OS, fontWeight: 700, fontSize: 12,
          color: '#fff', letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          ⚡ Early Access — 50% de descuento en primera compra &nbsp;·&nbsp; Envío gratis a Lima Metropolitana &nbsp;·&nbsp; Solo 12 unidades
        </div>

        {/* Grid de dos columnas */}
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '48px 48px 0',
          display: 'flex', gap: 64, alignItems: 'flex-start',
        }} className="pp-grid">

          {/* ── Columna izquierda: galería (sticky) ──────────────────── */}
          <div style={{ width: 460, flexShrink: 0, position: 'sticky', top: 88 }} className="pp-gallery">

            {/* Imagen principal */}
            <div style={{
              width: '100%', height: 500, borderRadius: 20,
              background: 'linear-gradient(160deg, #f8f8fb 0%, #f0f0f4 100%)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 16px 48px rgba(0,0,0,0.10)',
              position: 'relative', overflow: 'hidden',
            }} className="pp-image-card">
              {/* Ribbon */}
              <div style={{
                position: 'absolute', top: 16, left: 16, right: 16, height: 28,
                borderRadius: 7,
                background: 'linear-gradient(90deg,#302f9b 0%,#db5242 55%,rgba(255,255,255,0.6) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
              }}>
                <span style={{ fontFamily: OS, fontStyle: 'italic', fontWeight: 600, fontSize: 11, color: '#fff', letterSpacing: '0.12em' }}>EARLY ACCESS · 50% OFF</span>
              </div>
              {/* Botella */}
              <img key={flavor} src={cur.img} alt={cur.label} className="pp-fade pp-bottle-img" style={{
                position: 'absolute', bottom: 72, left: '50%',
                transform: 'translateX(-50%)',
                height: 350, width: 'auto', objectFit: 'contain',
                filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.14))',
              }} />
              {/* Barra de stats */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 72, display: 'flex' }}>
                <div style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
                  borderTop: '2.5px solid #1a1a1a', borderRight: '1.5px solid #e0e0e0',
                }}>
                  <span style={{ fontFamily: OS, fontWeight: 800, fontSize: 26, color: '#111', lineHeight: 1, letterSpacing: '-0.05em' }}>30G</span>
                  <span style={{ fontFamily: OS, fontWeight: 600, fontSize: 10, color: '#777', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Proteína</span>
                </div>
                <div style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
                  background: '#111', borderRadius: '0 0 20px 0',
                }}>
                  <span style={{ fontFamily: OS, fontWeight: 800, fontSize: 26, color: '#f4f4f6', lineHeight: 1, letterSpacing: '-0.05em' }}>189</span>
                  <span style={{ fontFamily: OS, fontWeight: 600, fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Calorías</span>
                </div>
              </div>
            </div>

            {/* Thumbnails de sabores */}
            <div style={{ display: 'flex', gap: 10, marginTop: 14, justifyContent: 'center' }}>
              {FLAVORS.map(f => (
                <div key={f.id} className="pp-thumb" onClick={() => setFlavor(f.id)} style={{
                  width: 84, height: 84, borderRadius: 12,
                  background: '#fff', cursor: 'pointer',
                  border: `2px solid ${flavor === f.id ? '#db5242' : '#e4e4ea'}`,
                  boxShadow: flavor === f.id ? '0 0 0 3px rgba(219,82,66,0.15), 0 4px 10px rgba(0,0,0,0.08)' : '0 2px 6px rgba(0,0,0,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                  transition: 'all 0.2s cubic-bezier(0.25,0.46,0.45,0.94)',
                }}>
                  <img src={f.img} alt={f.label} style={{ height: 68, width: 'auto', objectFit: 'contain' }} />
                </div>
              ))}
            </div>

            {/* Proof strip */}
            <div style={{
              marginTop: 16, padding: '12px 20px', borderRadius: 12,
              background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-around',
              border: '1px solid #f0f0f4',
            }}>
              {[['Sin lactosa','🥛'],['Natural','🌿'],['Sin azúcar','✓']].map(([l, ic]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 14 }}>{ic}</span>
                  <span style={{ fontFamily: OS, fontWeight: 600, fontSize: 11, color: '#444' }}>{l}</span>
                </div>
              ))}
            </div>

            {/* Tarjeta del huevito */}
            <div style={{
              marginTop: 12, padding: '14px 16px', borderRadius: 12,
              background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #f0f0f4',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <img src="assets/huevito.png" alt="huevito" style={{ height: 52, width: 'auto', objectFit: 'contain' }} />
              <div>
                <div style={{ fontFamily: OS, fontWeight: 700, fontSize: 13, color: '#111', letterSpacing: '-0.02em', marginBottom: 3 }}>Proteína de clara de huevo</div>
                <div style={{ fontFamily: OS, fontSize: 12, color: '#777', lineHeight: 1.5 }}>Limpia, sin lactosa y con perfil completo de aminoácidos.</div>
              </div>
            </div>
          </div>

          {/* ── Columna derecha: panel de compra ─────────────────────── */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

            {/* Badges */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <span style={{
                padding: '5px 14px', borderRadius: 999,
                background: 'linear-gradient(135deg,#302f9b,#db5242)',
                fontFamily: OS, fontWeight: 700, fontSize: 11, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>Early Access</span>
              <span style={{
                padding: '5px 14px', borderRadius: 999,
                background: '#f0f0f4', border: '1px solid #e0e0e6',
                fontFamily: OS, fontWeight: 700, fontSize: 11, color: '#666', letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>6 Pack · {protein.toUpperCase()}</span>
            </div>

            {/* Título */}
            <h1 className="pp-h1" style={{
              fontFamily: OS, fontWeight: 800, fontSize: 42,
              color: '#111', letterSpacing: '-0.045em', lineHeight: 1.05, marginBottom: 12,
            }}>{cur.label}</h1>

            {/* Prueba social */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, ...divider }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {[0,1,2,3,4].map(i => (
                  <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill="#db5242">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <span style={{ fontFamily: OS, fontWeight: 700, fontSize: 14, color: '#111' }}>4.9</span>
              <span style={{ color: '#bbb' }}>·</span>
              <a href="#reviews" style={{ fontFamily: OS, fontSize: 13, color: '#555', textDecoration: 'underline', textUnderlineOffset: 2 }}>
                237 reseñas verificadas
              </a>
            </div>

            {/* Precio */}
            <div style={{ ...divider }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <span style={{ fontFamily: OS, fontSize: 16, color: '#bbb', textDecoration: 'line-through' }}>S/ 4,179.99</span>
                <span style={{ fontFamily: OS, fontWeight: 700, fontSize: 38, color: '#111', letterSpacing: '-0.03em', lineHeight: 1 }}>S/ 2,299.00</span>
                <div style={{ padding: '5px 14px', borderRadius: 999, background: '#db5242' }}>
                  <span style={{ fontFamily: OS, fontWeight: 700, fontSize: 13, color: '#fff' }}>Ahorras S/ 1,880 · 45%</span>
                </div>
              </div>
              <p style={{ fontFamily: OS, fontStyle: 'italic', fontSize: 16, lineHeight: 1.75, color: '#555' }}>
                Six pack de shakes con proteína de clara de huevo e ingredientes naturales. Sin saborizantes. Sin lactosa ni azúcar añadida.
              </p>
            </div>

            {/* Urgencia */}
            <div style={{
              ...divider,
              padding: '12px 16px', borderRadius: 10,
              background: 'rgba(219,82,66,0.05)', border: '1px solid rgba(219,82,66,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontFamily: OS, fontStyle: 'italic', fontWeight: 700, fontSize: 13, color: '#c0392b' }}>
                ⚡ Solo quedan <strong>12 unidades</strong>
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: OS, fontSize: 11, color: '#999' }}>Oferta termina en</span>
                <div style={{
                  background: '#111', borderRadius: 6, padding: '4px 10px',
                  fontFamily: OS, fontWeight: 700, fontSize: 14, color: '#f4f4f6', letterSpacing: '0.04em',
                }}>{pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}</div>
              </div>
            </div>

            {/* Selector de sabor */}
            <div style={{ ...divider }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                <span style={{ fontFamily: OS, fontWeight: 700, fontSize: 13, color: '#111', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Sabor</span>
                <span style={{ fontFamily: OS, fontStyle: 'italic', fontSize: 12, color: '#888' }}>{cur.desc}</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {FLAVORS.map(f => (
                  <div key={f.id} className="pp-flavor" onClick={() => setFlavor(f.id)} style={{
                    flex: 1, padding: '14px 10px 12px', borderRadius: 14, cursor: 'pointer',
                    background: flavor === f.id ? '#111' : '#fff',
                    border: `1.5px solid ${flavor === f.id ? '#111' : '#e0e0e6'}`,
                    boxShadow: flavor === f.id ? '0 6px 20px rgba(0,0,0,0.2)' : '0 1px 4px rgba(0,0,0,0.04)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    transition: 'all 0.22s cubic-bezier(0.25,0.46,0.45,0.94)',
                  }}>
                    <img src={f.img} alt={f.label} style={{ height: 52, width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' }} />
                    <span style={{ fontFamily: OS, fontWeight: 700, fontSize: 11, color: flavor === f.id ? '#f4f4f6' : '#444', textAlign: 'center', lineHeight: 1.3 }}>{f.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selector de proteína */}
            <div style={{ ...divider }}>
              <span style={{ fontFamily: OS, fontWeight: 700, fontSize: 13, color: '#111', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: 14 }}>
                Proteína por botella
              </span>
              <div style={{ display: 'flex', gap: 12 }}>
                {[{ id: '30g', label: '30G', badge: '★ Más popular' }, { id: '20g', label: '20G', badge: null }].map(opt => (
                  <div key={opt.id} onClick={() => setProtein(opt.id)} style={{
                    width: 128, height: 58, borderRadius: 20, cursor: 'pointer',
                    background: protein === opt.id ? '#111' : '#fff',
                    border: `1.5px solid ${protein === opt.id ? '#111' : '#e0e0e6'}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                    boxShadow: protein === opt.id ? '0 4px 14px rgba(0,0,0,0.2)' : '0 1px 4px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s cubic-bezier(0.25,0.46,0.45,0.94)',
                  }}>
                    <span style={{ fontFamily: OS, fontWeight: 800, fontSize: 18, color: protein === opt.id ? '#f4f4f6' : '#111', letterSpacing: '-0.03em' }}>{opt.label}</span>
                    {opt.badge && <span style={{ fontFamily: OS, fontSize: 9, color: protein === opt.id ? 'rgba(255,255,255,0.6)' : '#db5242', fontWeight: 600 }}>{opt.badge}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Cantidad + CTA */}
            <div ref={ctaRef} style={{ ...divider }}>
              <span style={{ fontFamily: OS, fontWeight: 700, fontSize: 13, color: '#111', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: 14 }}>
                Cantidad
              </span>
              <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  border: '1.5px solid #dcdce4', borderRadius: 20,
                  background: '#fff', overflow: 'hidden',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}>
                  {[['−', () => setQty(q => Math.max(1, q - 1))], [qty, null], ['+', () => setQty(q => q + 1)]].map(([label, fn], i) =>
                    fn ? (
                      <button key={i} onClick={fn} style={{
                        width: 50, height: 60, background: 'none', border: 'none', cursor: 'pointer',
                        fontFamily: OS, fontWeight: 700, fontSize: 22, color: '#111',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f4f4f6'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >{label}</button>
                    ) : (
                      <span key={i} style={{ width: 44, textAlign: 'center', fontFamily: OS, fontWeight: 700, fontSize: 20, color: '#111', userSelect: 'none' }}>{label}</span>
                    )
                  )}
                </div>
                <button onClick={handleAdd} style={{
                  flex: 1, height: 60, borderRadius: 20, border: 'none', cursor: 'pointer',
                  background: added ? '#302f9b' : 'linear-gradient(180deg, #e3796c 0%, #db5242 38%, #302f9b 100%)',
                  fontFamily: OS, fontWeight: 800, fontSize: 17,
                  letterSpacing: '-0.01em', color: '#fff', textTransform: 'uppercase',
                  boxShadow: added ? '0 6px 20px rgba(48,47,155,0.35)' : '0 8px 28px rgba(219,82,66,0.38)',
                  transition: 'all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!added) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 36px rgba(219,82,66,0.48)'; }}}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = added ? '0 6px 20px rgba(48,47,155,0.35)' : '0 8px 28px rgba(219,82,66,0.38)'; }}>
                  {added ? '¡Agregado al carrito! ✓' : `AGREGAR — ${price}`}
                </button>
              </div>
              <p style={{ fontFamily: OS, fontStyle: 'italic', fontSize: 12, color: '#db5242', marginTop: 10 }}>
                ⚡ Solo quedan 12 unidades — Early Access · Envío gratis a Lima
              </p>
            </div>

            {/* Trío de confianza */}
            <div style={{
              display: 'flex', marginBottom: 22,
              padding: '14px 0', background: '#fafafa', borderRadius: 12, border: '1px solid #f0f0f4',
            }}>
              {[
                { icon: <svg width="18" height="18" fill="none" stroke="#555" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label: 'Garantía 30 días' },
                { icon: <svg width="18" height="18" fill="none" stroke="#555" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, label: 'Envío gratis Lima' },
                { icon: <svg width="18" height="18" fill="none" stroke="#555" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>, label: 'Pago 100% seguro' },
              ].map(({ icon, label }, i) => (
                <div key={label} style={{
                  flex: 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
                  borderRight: i < 2 ? '1px solid #ebebf0' : 'none',
                }}>
                  {icon}
                  <span style={{ fontFamily: OS, fontWeight: 700, fontSize: 12, color: '#555' }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Checklist de beneficios */}
            <div style={{ ...divider, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px' }}>
              {BENEFITS.map(b => (
                <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', background: '#111',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span style={{ fontFamily: OS, fontSize: 13, color: '#444' }}>{b}</span>
                </div>
              ))}
            </div>

            {/* FAQ accordion */}
            <div>
              <span style={{ fontFamily: OS, fontWeight: 700, fontSize: 11, color: '#aaa', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Preguntas frecuentes
              </span>
              {FAQS.map((item, i) => (
                <div key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <button className="pp-faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 8px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                    borderRadius: 8, transition: 'background 0.15s',
                  }}>
                    <span style={{ fontFamily: OS, fontWeight: 700, fontSize: 14, color: '#111', paddingRight: 16 }}>{item.q}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.2" strokeLinecap="round" style={{
                      transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94)', flexShrink: 0,
                    }}><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div style={{
                    overflow: 'hidden', maxHeight: openFaq === i ? 200 : 0,
                    transition: 'max-height 0.3s cubic-bezier(0.25,0.46,0.45,0.94)',
                  }}>
                    <p style={{ fontFamily: OS, fontSize: 14, lineHeight: 1.75, color: '#666', padding: '0 8px 16px 8px' }}>{item.a}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

Object.assign(window, { ProductSection });
