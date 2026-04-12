import { useState } from 'react';
import { Link } from 'react-router-dom';
import HRSidebar from '../../components/HRSidebar';
import { KPICard, Avatar, StatusPill, ScoreBadge } from '../../components/UI';
import { CANDIDATES, JOBS, WEEKLY_DATA, STATUS_LABELS } from '../../data/mock';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--s3)', border: '1px solid var(--b2)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
        <div style={{ color: 'var(--m1)', marginBottom: 4 }}>{label}</div>
        <div style={{ color: '#8AB8FF', fontWeight: 600 }}>{payload[0].value} applications</div>
        {payload[1] && <div style={{ color: 'var(--teal)', fontWeight: 600 }}>{payload[1].value} shortlisted</div>}
      </div>
    );
  }
  return null;
};

export default function HRDashboard() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? CANDIDATES : CANDIDATES.filter(c => c.status === filter);
  const statuses = ['all', 'new', 'reviewing', 'shortlisted', 'interview', 'hired', 'rejected'];

  const kpis = [
    { label: 'Total Applicants', value: CANDIDATES.length, delta: '18 this week', deltaUp: true, color: '#5B8EF8' },
    { label: 'Shortlisted', value: CANDIDATES.filter(c => c.status === 'shortlisted').length, delta: '5 today', deltaUp: true, color: '#1ECFAA' },
    { label: 'Avg AI Score', value: Math.round(CANDIDATES.reduce((a, c) => a + c.score, 0) / CANDIDATES.length * 10) / 10, delta: 'stable this week', deltaUp: true, color: '#F0A030' },
    { label: 'Emails Sent', value: CANDIDATES.reduce((a, c) => a + c.emails.length, 0), delta: 'all automated', deltaUp: true, color: '#8B70F5' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      <HRSidebar />

      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid var(--b1)', background: 'rgba(12,14,20,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700 }}>Recruitment Overview</h1>
            <div style={{ fontSize: 12.5, color: 'var(--m2)', marginTop: 2 }}>April 2026 · {JOBS.filter(j => j.status === 'active').length} active roles</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost btn-sm">Export PDF</button>
            <Link to="/hr/jobs" className="btn btn-primary btn-sm">+ Post New Job</Link>
          </div>
        </div>

        <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            {kpis.map((k, i) => <KPICard key={i} {...k} />)}
          </div>

          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Bar Chart */}
            <div className="card" style={{ padding: '20px 20px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700 }}>Applications over time</div>
                <span className="pill pill-blue" style={{ fontSize: 10.5 }}>8 weeks</span>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={WEEKLY_DATA} barGap={4} barCategoryGap="30%">
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="week" tick={{ fill: '#545D80', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#545D80', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="applications" fill="url(#blueGrad)" radius={[3,3,0,0]} />
                  <Bar dataKey="shortlisted" fill="rgba(30,207,170,0.6)" radius={[3,3,0,0]} />
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#5B8EF8" />
                      <stop offset="100%" stopColor="#8B70F5" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Job Posts Summary */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Active Job Posts</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {JOBS.map(job => {
                  const jobCands = CANDIDATES.filter(c => c.jobId === job.id);
                  const avgScore = jobCands.length ? Math.round(jobCands.reduce((a, c) => a + c.score, 0) / jobCands.length) : 0;
                  const colorMap = { Engineering: '#5B8EF8', 'AI Research': '#8B70F5', Design: '#F0A030', HR: '#22C55E' };
                  const color = colorMap[job.department] || '#5B8EF8';
                  return (
                    <div key={job.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, transition: 'background 0.15s', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--b1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text)' }}>{job.title}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--m2)' }}>{job.applicants} applicants</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: avgScore >= 80 ? 'var(--teal)' : avgScore >= 60 ? 'var(--amber)' : 'var(--m2)', fontFamily: "'Syne', sans-serif" }}>{avgScore || '—'}</div>
                        <div style={{ fontSize: 10, color: 'var(--m3)' }}>avg score</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Candidates Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--b1)' }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700 }}>All Candidates</div>
              <Link to="/hr/candidates" style={{ fontSize: 12.5, color: 'var(--blue)', textDecoration: 'none' }}>View all →</Link>
            </div>

            {/* Status tabs */}
            <div style={{ display: 'flex', gap: 2, padding: '12px 20px', borderBottom: '1px solid var(--b1)', overflowX: 'auto' }}>
              {statuses.map(s => (
                <button key={s} onClick={() => setFilter(s)} style={{
                  padding: '5px 14px', borderRadius: 7,
                  background: filter === s ? 'var(--blue-dim)' : 'transparent',
                  border: filter === s ? '1px solid rgba(91,142,248,0.2)' : '1px solid transparent',
                  color: filter === s ? '#8AB8FF' : 'var(--m2)',
                  fontSize: 12.5, cursor: 'pointer', whiteSpace: 'nowrap',
                  fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
                }}>
                  {s === 'all' ? 'All' : STATUS_LABELS[s]}
                  <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>
                    {s === 'all' ? CANDIDATES.length : CANDIDATES.filter(c => c.status === s).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Table */}
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 100px 120px 80px', padding: '10px 20px', borderBottom: '1px solid var(--b1)' }}>
                {['Candidate', 'Role', 'AI Score', 'Status', 'Actions'].map(h => (
                  <div key={h} style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--m2)', fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>{h}</div>
                ))}
              </div>
              {filtered.map(c => (
                <Link key={c.id} to={`/hr/candidates/${c.id}`} style={{ textDecoration: 'none', display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 100px 120px 80px', padding: '13px 20px', borderBottom: '1px solid var(--b1)', alignItems: 'center', transition: 'background 0.15s', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--b1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar initials={c.avatar} color={c.avatarColor} size={34} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--m2)' }}>{c.location}</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--m1)' }}>{c.appliedRole}</div>
                    <div style={{ fontSize: 11, color: 'var(--m3)' }}>{c.experience} exp</div>
                  </div>
                  <ScoreBadge score={c.score} showBar />
                  <StatusPill status={c.status} />
                  <span style={{ fontSize: 12.5, color: 'var(--blue)' }}>View →</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
