import { STATUS_LABELS, STATUS_COLORS, getScoreColor } from '../data/mock';

// ─── Avatar ───
export function Avatar({ initials, color = 'blue', size = 36 }) {
  const colors = {
    blue:   { bg: 'rgba(91,142,248,0.15)',  text: '#8AB8FF' },
    violet: { bg: 'rgba(139,112,245,0.15)', text: '#B09DF9' },
    teal:   { bg: 'rgba(30,207,170,0.12)',  text: '#1ECFAA' },
    amber:  { bg: 'rgba(240,160,48,0.12)',  text: '#F0A030' },
    red:    { bg: 'rgba(240,80,104,0.12)',  text: '#F05068' },
    green:  { bg: 'rgba(34,197,94,0.12)',   text: '#22C55E' },
  };
  const c = colors[color] || colors.blue;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: c.bg, color: c.text,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 600, flexShrink: 0,
      fontFamily: "'Syne', sans-serif",
    }}>
      {initials}
    </div>
  );
}

// ─── StatusPill ───
export function StatusPill({ status }) {
  const label = STATUS_LABELS[status] || status;
  const color = STATUS_COLORS[status] || 'blue';
  return <span className={`pill pill-${color}`}>{label}</span>;
}

// ─── ScoreBadge ───
export function ScoreBadge({ score, showBar = false }) {
  const color = getScoreColor(score);
  const colors = { teal: '#1ECFAA', amber: '#F0A030', red: '#F05068' };
  const c = colors[color];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ color: c, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, minWidth: 28 }}>
        {score}
      </span>
      {showBar && (
        <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', minWidth: 60 }}>
          <div style={{ width: `${score}%`, height: '100%', background: c, borderRadius: 2, transition: 'width 0.6s ease' }} />
        </div>
      )}
    </div>
  );
}

// ─── DeptTag ───
export function DeptTag({ dept }) {
  const colorMap = { Engineering: 'blue', 'AI Research': 'violet', Design: 'amber', HR: 'green', default: 'blue' };
  const c = colorMap[dept] || colorMap.default;
  return <span className={`pill pill-${c}`}>{dept}</span>;
}

// ─── KPI Card ───
export function KPICard({ label, value, delta, deltaUp, accentColor = '#5B8EF8' }) {
  return (
    <div className="card" style={{ padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${accentColor}80, transparent)`,
      }} />
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--m2)', fontFamily: "'Syne', sans-serif", fontWeight: 600, marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: 'var(--text)', lineHeight: 1 }}>
        {value}
      </div>
      {delta && (
        <div style={{ fontSize: 11.5, marginTop: 6, color: deltaUp ? 'var(--teal)' : 'var(--red)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>{deltaUp ? '↑' : '↓'}</span> {delta}
        </div>
      )}
    </div>
  );
}

// ─── Spinner ───
export function Spinner() {
  return <div className="spinner" />;
}

// ─── Empty State ───
export function EmptyState({ icon = '🔍', title = 'Nothing here', desc = '' }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>{icon}</div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--text)', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 14, color: 'var(--m1)' }}>{desc}</div>
    </div>
  );
}

// ─── Divider ───
export function Divider({ label }) {
  if (!label) return <div className="divider" />;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--b1)' }} />
      <span style={{ fontSize: 12, color: 'var(--m2)' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--b1)' }} />
    </div>
  );
}

// ─── Toast ───
export function Toast({ message, type = 'success', onClose }) {
  const colors = { success: 'var(--teal)', error: 'var(--red)', info: 'var(--blue)' };
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      background: 'var(--s2)', border: `1px solid ${colors[type]}40`,
      borderLeft: `3px solid ${colors[type]}`,
      borderRadius: 10, padding: '14px 20px',
      display: 'flex', alignItems: 'center', gap: 12,
      animation: 'fadeUp 0.3s ease',
      boxShadow: `0 8px 32px rgba(0,0,0,0.5)`,
      maxWidth: 360,
    }}>
      <span style={{ fontSize: 14, color: 'var(--text)', flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--m2)', cursor: 'pointer', fontSize: 16 }}>×</button>
    </div>
  );
}
