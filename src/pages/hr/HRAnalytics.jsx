import HRSidebar from '../../components/HRSidebar';
import { CANDIDATES, WEEKLY_DATA, JOBS } from '../../data/mock';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--s3)', border: '1px solid var(--b2)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
        <div style={{ color: 'var(--m1)', marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</div>
        ))}
      </div>
    );
  }
  return null;
};

const STATUS_DIST = [
  { name: 'New', value: CANDIDATES.filter(c => c.status === 'new').length, color: '#5B8EF8' },
  { name: 'Reviewing', value: CANDIDATES.filter(c => c.status === 'reviewing').length, color: '#F0A030' },
  { name: 'Shortlisted', value: CANDIDATES.filter(c => c.status === 'shortlisted').length, color: '#1ECFAA' },
  { name: 'Interview', value: CANDIDATES.filter(c => c.status === 'interview').length, color: '#8B70F5' },
  { name: 'Hired', value: CANDIDATES.filter(c => c.status === 'hired').length, color: '#22C55E' },
  { name: 'Rejected', value: CANDIDATES.filter(c => c.status === 'rejected').length, color: '#F05068' },
].filter(d => d.value > 0);

const SCORE_DIST = [
  { range: '90–100', count: CANDIDATES.filter(c => c.score >= 90).length },
  { range: '80–89', count: CANDIDATES.filter(c => c.score >= 80 && c.score < 90).length },
  { range: '70–79', count: CANDIDATES.filter(c => c.score >= 70 && c.score < 80).length },
  { range: '60–69', count: CANDIDATES.filter(c => c.score >= 60 && c.score < 70).length },
  { range: '<60', count: CANDIDATES.filter(c => c.score < 60).length },
];

const DEPT_DIST = JOBS.map(j => ({
  dept: j.department.replace(' Research', ''),
  applicants: j.applicants,
}));

export default function HRAnalytics() {
  const avgScore = Math.round(CANDIDATES.reduce((a, c) => a + c.score, 0) / CANDIDATES.length * 10) / 10;
  const shortlistRate = Math.round(CANDIDATES.filter(c => ['shortlisted','interview','hired'].includes(c.status)).length / CANDIDATES.length * 100);
  const totalEmails = CANDIDATES.reduce((a, c) => a + c.emails.length, 0);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      <HRSidebar />
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid var(--b1)', position: 'sticky', top: 0, background: 'rgba(6,7,9,0.9)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700 }}>Analytics</h1>
            <div style={{ fontSize: 12.5, color: 'var(--m2)', marginTop: 2 }}>Recruitment performance · April 2026</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost btn-sm">Export PDF</button>
            <button className="btn btn-ghost btn-sm">Export Excel</button>
          </div>
        </div>

        <div style={{ padding: '28px 32px 60px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            {[
              { label: 'Total Applicants', value: CANDIDATES.length, delta: '↑ 18 this month', color: '#5B8EF8' },
              { label: 'Avg AI Score', value: avgScore, delta: '↑ from 66.2 last month', color: '#F0A030' },
              { label: 'Shortlist Rate', value: `${shortlistRate}%`, delta: 'of all applicants', color: '#1ECFAA' },
              { label: 'Emails Automated', value: totalEmails, delta: '100% automated by n8n', color: '#8B70F5' },
            ].map((k, i) => (
              <div key={i} className="card" style={{ padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${k.color}70, transparent)` }} />
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--m2)', fontFamily: "'Syne', sans-serif", fontWeight: 600, marginBottom: 8 }}>{k.label}</div>
                <div style={{ fontSize: 30, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: 'var(--text)', lineHeight: 1 }}>{k.value}</div>
                <div style={{ fontSize: 11.5, color: 'var(--teal)', marginTop: 6 }}>{k.delta}</div>
              </div>
            ))}
          </div>

          {/* Applications + Shortlisted over time */}
          <div className="card" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700 }}>Applications & Shortlisting Over Time</div>
                <div style={{ fontSize: 12.5, color: 'var(--m2)', marginTop: 3 }}>8-week rolling view</div>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: '#5B8EF8' }} />
                  <span style={{ color: 'var(--m1)' }}>Applications</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: '#1ECFAA' }} />
                  <span style={{ color: 'var(--m1)' }}>Shortlisted</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={WEEKLY_DATA} barGap={4} barCategoryGap="30%">
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="week" tick={{ fill: '#545D80', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#545D80', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="applications" name="Applications" fill="url(#blueGrad2)" radius={[4,4,0,0]} />
                <Bar dataKey="shortlisted" name="Shortlisted" fill="rgba(30,207,170,0.65)" radius={[4,4,0,0]} />
                <defs>
                  <linearGradient id="blueGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5B8EF8" />
                    <stop offset="100%" stopColor="#8B70F5" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Row: Pie + Score dist */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Pipeline Status */}
            <div className="card" style={{ padding: '22px 24px' }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Pipeline Status</div>
              <div style={{ fontSize: 12.5, color: 'var(--m2)', marginBottom: 20 }}>Candidate distribution by stage</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={STATUS_DIST} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {STATUS_DIST.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: 'var(--s3)', border: '1px solid var(--b2)', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {STATUS_DIST.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12.5, color: 'var(--m1)', flex: 1 }}>{d.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'Syne', sans-serif" }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Score Distribution */}
            <div className="card" style={{ padding: '22px 24px' }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 4 }}>AI Score Distribution</div>
              <div style={{ fontSize: 12.5, color: 'var(--m2)', marginBottom: 20 }}>How candidates scored vs the roles</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {SCORE_DIST.map((s, i) => {
                  const max = Math.max(...SCORE_DIST.map(d => d.count));
                  const barColor = i === 0 ? 'var(--teal)' : i === 1 ? 'var(--teal)' : i === 2 ? 'var(--amber)' : i === 3 ? 'var(--amber)' : 'var(--red)';
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: 'var(--m1)' }}>{s.range}</span>
                        <span style={{ color: 'var(--text)', fontWeight: 600 }}>{s.count} candidates</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--b1)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${(s.count / Math.max(max, 1)) * 100}%`, height: '100%', background: barColor, borderRadius: 3, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Applications by department */}
          <div className="card" style={{ padding: '22px 24px' }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Applicants by Department</div>
            <div style={{ fontSize: 12.5, color: 'var(--m2)', marginBottom: 20 }}>Which roles are attracting the most talent</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={DEPT_DIST} layout="vertical" barCategoryGap="30%">
                <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis type="number" tick={{ fill: '#545D80', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="dept" tick={{ fill: '#9198B5', fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="applicants" name="Applicants" fill="url(#blueGrad3)" radius={[0,4,4,0]} />
                <defs>
                  <linearGradient id="blueGrad3" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#5B8EF8" />
                    <stop offset="100%" stopColor="#8B70F5" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Candidates Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--b1)', fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700 }}>
              Top Performing Candidates
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 100px 120px', padding: '10px 22px', borderBottom: '1px solid var(--b1)', background: 'var(--s1)' }}>
              {['Candidate', 'Role', 'AI Score', 'Status'].map(h => (
                <div key={h} style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--m2)', fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>{h}</div>
              ))}
            </div>
            {[...CANDIDATES].sort((a, b) => b.score - a.score).slice(0, 5).map(c => {
              const sc = c.score >= 80 ? 'var(--teal)' : c.score >= 60 ? 'var(--amber)' : 'var(--red)';
              return (
                <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 100px 120px', padding: '12px 22px', borderBottom: '1px solid var(--b1)', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(91,142,248,0.12)', color: '#8AB8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{c.avatar}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{c.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--m2)' }}>{c.location}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--m1)' }}>{c.appliedRole}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: sc, fontFamily: "'Syne', sans-serif" }}>{c.score}</span>
                    <div style={{ width: 30, height: 3, background: 'var(--b1)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${c.score}%`, height: '100%', background: sc, borderRadius: 2 }} />
                    </div>
                  </div>
                  <span className={`pill pill-${c.status === 'shortlisted' || c.status === 'interview' ? 'teal' : c.status === 'new' ? 'blue' : c.status === 'reviewing' ? 'amber' : c.status === 'hired' ? 'green' : 'red'}`}>
                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
