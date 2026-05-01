import useUIStore from '@/store/uiStore';

/**
 * Half sun (light) or half moon (dark) fixed to the
 * very bottom-centre of the viewport. No parent clipping.
 */
export default function SunMoonEffect() {
  const darkMode = useUIStore((s) => s.darkMode);
  return darkMode ? <MoonEffect /> : <SunEffect />;
}

// ─────────────────────────────────────────────────────────
// SUN
// ─────────────────────────────────────────────────────────
function SunEffect() {
  return (
    <div
      aria-hidden="true"
      style={{
        position:   'fixed',
        bottom:     0,
        left:       '50%',
        transform:  'translateX(-50%)',
        zIndex:     1,
        pointerEvents: 'none',
        display:    'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Wide horizon glow — spans full width */}
      <div style={{
        position: 'absolute',
        bottom:   0,
        left:     '50%',
        transform:'translateX(-50%)',
        width:    '900px',
        height:   '160px',
        background: 'radial-gradient(ellipse at center bottom, rgba(251,191,36,0.22) 0%, rgba(249,115,22,0.10) 45%, transparent 75%)',
        borderRadius: '50%',
      }} />

      {/* Outer soft glow ring */}
      <div style={{
        position: 'absolute',
        bottom:   '-40px',
        width:    '380px',
        height:   '380px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(253,230,138,0.18) 0%, rgba(251,191,36,0.08) 50%, transparent 70%)',
        filter:   'blur(18px)',
      }} />

      {/* The half-circle sun body */}
      <div style={{
        position:   'relative',
        width:      '260px',
        height:     '130px',
        borderRadius: '130px 130px 0 0',
        background: 'radial-gradient(circle at 50% 100%, #fde68a 0%, #fbbf24 40%, #f97316 85%)',
        boxShadow:  '0 0 80px 30px rgba(251,191,36,0.45), 0 0 160px 60px rgba(249,115,22,0.2)',
        overflow:   'hidden',
        flexShrink: 0,
      }}>
        {/* Inner highlight */}
        <div style={{
          position: 'absolute',
          inset:    0,
          borderRadius: '130px 130px 0 0',
          background: 'radial-gradient(ellipse at 50% 85%, rgba(255,255,255,0.45) 0%, transparent 55%)',
        }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MOON
// ─────────────────────────────────────────────────────────
function MoonEffect() {
  const stars = [
    { bottom: '160px', left: 'calc(50% - 120px)', size: 2, delay: '0s',    dur: '2.5s' },
    { bottom: '200px', left: 'calc(50% - 60px)',  size: 3, delay: '0.6s',  dur: '3s'   },
    { bottom: '180px', left: 'calc(50% + 80px)',  size: 2, delay: '1.2s',  dur: '2s'   },
    { bottom: '220px', left: 'calc(50% + 140px)', size: 2, delay: '0.3s',  dur: '3.5s' },
    { bottom: '170px', left: 'calc(50% - 180px)', size: 3, delay: '1.8s',  dur: '2.2s' },
    { bottom: '240px', left: 'calc(50% + 40px)',  size: 2, delay: '0.9s',  dur: '2.8s' },
  ];

  return (
    <div
      aria-hidden="true"
      style={{
        position:   'fixed',
        bottom:     0,
        left:       '50%',
        transform:  'translateX(-50%)',
        zIndex:     1,
        pointerEvents: 'none',
      }}
    >
      {/* Stars */}
      {stars.map((s, i) => (
        <div key={i} style={{
          position:          'fixed',
          bottom:            s.bottom,
          left:              s.left,
          width:             `${s.size}px`,
          height:            `${s.size}px`,
          borderRadius:      '50%',
          backgroundColor:   'rgba(255,255,255,0.85)',
          animationName:     'pulse',
          animationDuration:  s.dur,
          animationDelay:     s.delay,
          animationIterationCount: 'infinite',
          animationTimingFunction: 'ease-in-out',
        }} />
      ))}

      {/* Wide horizon glow */}
      <div style={{
        position: 'absolute',
        bottom:   0,
        left:     '50%',
        transform:'translateX(-50%)',
        width:    '900px',
        height:   '160px',
        background: 'radial-gradient(ellipse at center bottom, rgba(99,102,241,0.18) 0%, rgba(67,56,202,0.08) 45%, transparent 75%)',
        borderRadius: '50%',
      }} />

      {/* Outer glow ring */}
      <div style={{
        position: 'absolute',
        bottom:   '-40px',
        left:     '50%',
        transform:'translateX(-50%)',
        width:    '380px',
        height:   '380px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(148,163,184,0.12) 0%, rgba(99,102,241,0.06) 50%, transparent 70%)',
        filter:   'blur(18px)',
      }} />

      {/* The half-circle moon body */}
      <div style={{
        position:     'relative',
        width:        '260px',
        height:       '130px',
        borderRadius: '130px 130px 0 0',
        background:   'radial-gradient(circle at 38% 45%, #f8fafc 0%, #cbd5e1 30%, #94a3b8 65%, #475569 100%)',
        boxShadow:    '0 0 70px 25px rgba(148,163,184,0.25), 0 0 140px 50px rgba(99,102,241,0.12)',
        overflow:     'hidden',
        flexShrink:   0,
      }}>
        {/* Crescent shadow */}
        <div style={{
          position:     'absolute',
          top:          '-10px',
          right:        '20px',
          width:        '110px',
          height:       '110px',
          borderRadius: '50%',
          background:   'radial-gradient(circle, rgba(15,23,42,0.88) 0%, rgba(15,23,42,0.5) 50%, transparent 75%)',
        }} />
        {/* Surface shimmer */}
        <div style={{
          position:     'absolute',
          inset:        0,
          borderRadius: '130px 130px 0 0',
          background:   'radial-gradient(ellipse at 32% 35%, rgba(255,255,255,0.18) 0%, transparent 55%)',
        }} />
      </div>
    </div>
  );
}