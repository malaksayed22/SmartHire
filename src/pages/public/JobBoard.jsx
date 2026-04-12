import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PublicNav from '../../components/PublicNav';
import { DeptTag } from '../../components/UI';
import { JOBS } from '../../data/mock';

const DEPTS = ['All', 'Engineering', 'AI Research', 'Design', 'HR'];
const TYPES = ['Full-time', 'Part-time', 'Remote', 'Contract'];

export default function JobBoard() {
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');
  const [selectedTypes, setSelectedTypes] = useState([]);

  const toggleType = (t) => setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const filtered = useMemo(() => JOBS.filter(j => {
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) || j.department.toLowerCase().includes(search.toLowerCase());
    const matchDept = dept === 'All' || j.department === dept;
    const matchType = selectedTypes.length === 0 || selectedTypes.some(t => j.type.includes(t));
    return matchSearch && matchDept && matchType;
  }), [search, dept, selectedTypes]);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PublicNav />
      <div style={{ paddingTop: 100 }}>

        {/* Header */}
        <div style={{ padding: '48px 52px 36px', borderBottom: '1px solid var(--b1)', background: 'linear-gradient(180deg, rgba(91,142,248,0.04) 0%, transparent 100%)' }}>
          <div className="section-eyebrow"><div className="eyebrow-dot" />Open Positions</div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(36px,5vw,56px)', fontWeight: 400, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 16 }}>
            Find your next<br /><span style={{ fontStyle: 'italic', background: 'var(--grad-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>great role.</span>
          </h1>
          <p style={{ color: 'var(--m1)', fontSize: 16, fontWeight: 300 }}>
            {JOBS.length} open positions · AI-assisted matching · Instant application
          </p>
        </div>

        <div style={{ display: 'flex', padding: '0 52px' }}>
          {/* Sidebar Filters */}
          <aside style={{ width: 260, flexShrink: 0, paddingTop: 32, paddingRight: 32, borderRight: '1px solid var(--b1)', position: 'sticky', top: 100, height: 'calc(100vh - 100px)' }}>
            {/* Search */}
            <div style={{ marginBottom: 28 }}>
              <label className="label">Search</label>
              <div style={{ position: 'relative' }}>
                <input className="input" placeholder="Role, department..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 38 }} />
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--m2)', fontSize: 14 }}>⌕</span>
              </div>
            </div>

            {/* Department */}
            <div style={{ marginBottom: 28 }}>
              <label className="label">Department</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {DEPTS.map(d => (
                  <button key={d} onClick={() => setDept(d)} style={{
                    padding: '8px 12px', borderRadius: 8, textAlign: 'left',
                    background: dept === d ? 'var(--blue-dim)' : 'transparent',
                    border: dept === d ? '1px solid rgba(91,142,248,0.2)' : '1px solid transparent',
                    color: dept === d ? '#8AB8FF' : 'var(--m1)',
                    fontSize: 13.5, cursor: 'pointer', transition: 'all 0.15s',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  onMouseEnter={e => { if (dept !== d) e.currentTarget.style.background = 'var(--b1)'; }}
                  onMouseLeave={e => { if (dept !== d) e.currentTarget.style.background = 'transparent'; }}
                  >{d}</button>
                ))}
              </div>
            </div>

            {/* Job Type */}
            <div style={{ marginBottom: 28 }}>
              <label className="label">Job Type</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {TYPES.map(t => (
                  <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <div onClick={() => toggleType(t)} style={{
                      width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                      border: `1.5px solid ${selectedTypes.includes(t) ? 'var(--blue)' : 'var(--b3)'}`,
                      background: selectedTypes.includes(t) ? 'var(--blue)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s', cursor: 'pointer',
                    }}>
                      {selectedTypes.includes(t) && <span style={{ color: '#fff', fontSize: 10, lineHeight: 1 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 13.5, color: 'var(--m1)' }}>{t}</span>
                  </label>
                ))}
              </div>
            </div>

            {(search || dept !== 'All' || selectedTypes.length > 0) && (
              <button onClick={() => { setSearch(''); setDept('All'); setSelectedTypes([]); }} style={{ fontSize: 12.5, color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'DM Sans', sans-serif" }}>
                Clear all filters
              </button>
            )}
          </aside>

          {/* Job List */}
          <main style={{ flex: 1, paddingLeft: 40, paddingTop: 32, paddingBottom: 60 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <span style={{ fontSize: 14, color: 'var(--m1)' }}>
                <span style={{ color: 'var(--text)', fontWeight: 500 }}>{filtered.length}</span> position{filtered.length !== 1 ? 's' : ''} found
              </span>
              <select className="select" style={{ width: 'auto', fontSize: 13 }}>
                <option>Most relevant</option>
                <option>Most recent</option>
                <option>Most applicants</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(job => <JobCard key={job.id} job={job} />)}
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                  <div style={{ fontSize: 36, marginBottom: 16 }}>🔍</div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>No positions found</div>
                  <div style={{ color: 'var(--m1)', fontSize: 14 }}>Try adjusting your filters or search terms</div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function JobCard({ job }) {
  const daysAgo = Math.floor((Date.now() - new Date(job.posted)) / 86400000);
  return (
    <div className="card" style={{ padding: '24px 28px', cursor: 'default' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <DeptTag dept={job.department} />
            <span className="pill" style={{ background: 'var(--b1)', color: 'var(--m1)', fontSize: 11 }}>{job.type}</span>
            {daysAgo <= 7 && <span className="pill pill-blue" style={{ fontSize: 10 }}>New</span>}
          </div>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 19, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: 8 }}>{job.title}</h3>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--m1)', marginBottom: 14 }}>
            <span>📍 {job.location}</span>
            <span>💰 {job.salary}</span>
            <span>👥 {job.applicants} applicants</span>
            <span>🕐 {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`}</span>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--m1)', lineHeight: 1.65, marginBottom: 16, maxWidth: 600 }}>{job.description.slice(0, 160)}...</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {job.skills.map(s => (
              <span key={s} style={{ padding: '3px 10px', borderRadius: 6, background: 'var(--b1)', border: '1px solid var(--b1)', fontSize: 12, color: 'var(--m1)' }}>{s}</span>
            ))}
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <Link to={`/jobs/${job.id}`} className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>Apply Now →</Link>
        </div>
      </div>
    </div>
  );
}
