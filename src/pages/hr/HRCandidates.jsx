import { useState } from 'react';
import { Link } from 'react-router-dom';
import HRSidebar from '../../components/HRSidebar';
import { Avatar, StatusPill, ScoreBadge } from '../../components/UI';
import { CANDIDATES, STATUS_LABELS } from '../../data/mock';

export default function HRCandidates() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('score');

  const statuses = ['all', 'new', 'reviewing', 'shortlisted', 'interview', 'hired', 'rejected'];

  const filtered = CANDIDATES
    .filter(c => {
      const s = search.toLowerCase();
      const matchSearch = !s || c.name.toLowerCase().includes(s) || c.appliedRole.toLowerCase().includes(s) || c.location.toLowerCase().includes(s);
      const matchStatus = filter === 'all' || c.status === filter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'date') return new Date(b.appliedDate) - new Date(a.appliedDate);
      return 0;
    });

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      <HRSidebar />
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid var(--b1)', position: 'sticky', top: 0, background: 'rgba(6,7,9,0.9)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700 }}>Candidates</h1>
            <div style={{ fontSize: 12.5, color: 'var(--m2)', marginTop: 2 }}>{CANDIDATES.length} total · AI-ranked by score</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost btn-sm">Export CSV</button>
          </div>
        </div>

        <div style={{ padding: '20px 32px 0' }}>
          {/* Controls */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
              <input className="input" placeholder="Search candidates..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--m2)', fontSize: 14 }}>⌕</span>
            </div>
            <select className="select" style={{ width: 160, fontSize: 13 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="score">Sort: AI Score</option>
              <option value="name">Sort: Name</option>
              <option value="date">Sort: Date Applied</option>
            </select>
          </div>

          {/* Status tabs */}
          <div style={{ display: 'flex', gap: 2, overflowX: 'auto', paddingBottom: 0, borderBottom: '1px solid var(--b1)' }}>
            {statuses.map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{
                padding: '8px 16px', borderRadius: '7px 7px 0 0',
                background: filter === s ? 'var(--s1)' : 'transparent',
                border: filter === s ? '1px solid var(--b2)' : '1px solid transparent',
                borderBottom: filter === s ? '1px solid var(--s1)' : '1px solid transparent',
                color: filter === s ? 'var(--text)' : 'var(--m2)',
                fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
                fontFamily: "'DM Sans', sans-serif", marginBottom: -1,
              }}>
                {s === 'all' ? 'All Candidates' : STATUS_LABELS[s]}
                <span style={{ marginLeft: 7, fontSize: 11, color: 'var(--m3)' }}>
                  {s === 'all' ? CANDIDATES.length : CANDIDATES.filter(c => c.status === s).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, padding: '0 32px 40px' }}>
          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 120px 130px 100px 80px', padding: '12px 16px', background: 'var(--s1)', borderBottom: '1px solid var(--b1)', position: 'sticky', top: 69, zIndex: 5 }}>
            {['Candidate', 'Applied Role', 'AI Score', 'Status', 'Applied', 'Actions'].map(h => (
              <div key={h} style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--m2)', fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>{h}</div>
            ))}
          </div>

          {filtered.map(c => {
            const daysAgo = Math.floor((Date.now() - new Date(c.appliedDate)) / 86400000);
            return (
              <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 120px 130px 100px 80px', padding: '14px 16px', borderBottom: '1px solid var(--b1)', alignItems: 'center', transition: 'background 0.15s', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--s1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar initials={c.avatar} color={c.avatarColor} size={38} />
                  <div>
                    <div style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--text)' }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--m2)', marginTop: 1 }}>{c.location} · {c.experience}</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 13.5, color: 'var(--m1)' }}>{c.appliedRole}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 5 }}>
                    {c.skills.slice(0, 2).map(s => (
                      <span key={s} style={{ padding: '1px 7px', borderRadius: 4, background: 'var(--b1)', fontSize: 10.5, color: 'var(--m2)' }}>{s}</span>
                    ))}
                  </div>
                </div>
                <ScoreBadge score={c.score} showBar />
                <StatusPill status={c.status} />
                <div style={{ fontSize: 12.5, color: 'var(--m2)' }}>{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</div>
                <Link to={`/hr/candidates/${c.id}`} style={{ fontSize: 12.5, color: 'var(--blue)', textDecoration: 'none', fontWeight: 500 }}>View →</Link>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>👤</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>No candidates found</div>
              <div style={{ color: 'var(--m1)', fontSize: 14 }}>Try adjusting your filters</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
