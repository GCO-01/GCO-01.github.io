// ReviewsSection.jsx — Prueba social / sección de reseñas
// Depende de: React (global), product-section.css

const _OS_R = "'Open Sans', sans-serif";

const REVIEWS = [
  {
    name:     'Mariana R.',
    location: 'Lima, Perú',
    rating:   5,
    date:     'hace 3 días',
    text:     'Llevaba meses buscando algo así. El de mango sabe increíble y no me cae pesado para nada. Ya pedí mi segundo 6-pack.',
  },
  {
    name:     'Carlos V.',
    location: 'Miraflores, Lima',
    rating:   5,
    date:     'hace 5 días',
    text:     'Finalmente una proteína sin lactosa que sabe bien. El chocolate criollo es mi favorito — se siente real, no artificial. 30G en 189 calorías es brutal.',
  },
  {
    name:     'Sofía M.',
    location: 'San Isidro, Lima',
    rating:   5,
    date:     'hace 1 semana',
    text:     'Pedí el combinado para probar todos los sabores. Llegó en 2 días. El packaging está muy bien cuidado y el producto es exactamente lo que promete.',
  },
];

function ReviewsSection() {
  return (
    <section id="reviews" style={{ width: '100%', background: '#111', padding: '64px 48px 72px' }} className="pp-reviews-pad">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Encabezado */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}>
          <div>
            <span style={{ fontFamily: _OS_R, fontWeight: 700, fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
              Reseñas verificadas
            </span>
            <h2 style={{ fontFamily: _OS_R, fontWeight: 800, fontSize: 36, color: '#f4f4f6', letterSpacing: '-0.04em', lineHeight: 1, margin: 0 }}>
              Lo que dicen los clientes
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: _OS_R, fontWeight: 700, fontSize: 48, color: '#f4f4f6', lineHeight: 1, letterSpacing: '-0.03em' }}>4.9</div>
              <div style={{ fontFamily: _OS_R, fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>de 237 reseñas</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {[0,1,2,3,4].map(i => (
                <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="#db5242">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>
          </div>
        </div>

        {/* Cards de reseñas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="pp-reviews-grid">
          {REVIEWS.map((r, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)', borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '24px 24px 22px',
              display: 'flex', flexDirection: 'column', gap: 14,
            }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {[0,1,2,3,4].map(j => (
                  <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill={j < r.rating ? '#db5242' : 'rgba(255,255,255,0.15)'}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <p style={{ fontFamily: _OS_R, fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.75)', margin: 0, flex: 1 }}>
                "{r.text}"
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: _OS_R, fontWeight: 700, fontSize: 13, color: '#f4f4f6', letterSpacing: '-0.02em' }}>{r.name}</div>
                  <div style={{ fontFamily: _OS_R, fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{r.location}</div>
                </div>
                <span style={{ fontFamily: _OS_R, fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{r.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA final */}
        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <p style={{ fontFamily: _OS_R, fontStyle: 'italic', fontSize: 18, color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>
            La proteína NO se negocia. El sabor y los ingredientes tampoco.
          </p>
          <button onClick={() => document.getElementById('product-section').scrollIntoView({ behavior: 'smooth' })} style={{
            height: 56, padding: '0 48px', borderRadius: 28, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(180deg, #e3796c 0%, #db5242 38%, #302f9b 100%)',
            fontFamily: _OS_R, fontWeight: 800, fontSize: 15, letterSpacing: '-0.01em',
            color: '#fff', textTransform: 'uppercase',
            boxShadow: '0 8px 28px rgba(219,82,66,0.35)',
            transition: 'all 0.25s cubic-bezier(0.25,0.46,0.45,0.94)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 36px rgba(219,82,66,0.48)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(219,82,66,0.35)'; }}>
            QUIERO MI 6-PACK AHORA
          </button>
        </div>

      </div>
    </section>
  );
}

Object.assign(window, { ReviewsSection });
