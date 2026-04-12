import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import HRSidebar from '../../components/HRSidebar';
import { Avatar, StatusPill, Toast } from '../../components/UI';
import { CANDIDATES, STATUS_LABELS, getScoreColor } from '../../data/mock';

export default function CandidateDetail() {
  const { id } = useParams();
  const candidate = CANDIDATES.find(c => c.id === id);
  const [status, setStatus] = useState(candidate?.status || 'new');
  const [notes, setNotes] = useState(candidate?.notes || '');
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  if (!candidate) return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)' }}>
      <HRSidebar />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 36 }}>👤</div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700 }}>Candidate not found</div>
        <Link to="/hr/candidates" className="btn btn-primary">← Back to candidates</Link>
      </main>
    </div>
  );

  const scoreColor = { teal: 'var(--teal)', amber: 'var(--amber)', red: 'var(--red)' }[getScoreColor(candidate.score)];
  const emailTypeColors = { confirmation: 'blue', shortlist: 'teal', interview: 'violet', rejection: 'red' };

  const handleSave = () => {
    setToast({ message: 'Changes saved successfully', type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setToast({ message: `Status updated to ${STATUS_LABELS[newStatus]}`, type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  const tabs = ['overview', 'resume', 'emails', 'notes'];

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      <HRSidebar />
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 32px', borderBottom: '1px solid var(--b1)', position: 'sticky', top: 0, background: 'rgba(6,7,9,0.92)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
          <Link to="/hr/candidates" style={{ color: 'var(--m2)', textDecoration: 'none', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}
          onMouseEnter={e => e.target.style.color = 'var(--text)'}
          onMouseLeave={e => e.target.style.color = 'var(--m2)'}
          >← Candidates</Link>
          <span style={{ color: 'var(--b2)' }}>›</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar initials={candidate.avatar} color={candidate.avatarColor} size={30} />
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700 }}>{candidate.name}</span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost btn-sm">Download Resume</button>
            <Link to={`mailto:${candidate.email}`} className="btn btn-ghost btn-sm">Send Email</Link>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 0, flex: 1, overflow: 'hidden' }}>
          {/* Left Panel */}
          <div style={{ width: 320, borderRight: '1px solid var(--b1)', overflowY: 'auto', padding: '24px 24px 40px', flexShrink: 0 }}>
            {/* Profile */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar initials={candidate.avatar} color={candidate.avatarColor} size={72} />
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, marginTop: 12, marginBottom: 4 }}>{candidate.name}</h2>
              <div style={{ fontSize: 13.5, color: 'var(--m1)', marginBottom: 8 }}>{candidate.appliedRole}</div>
              <StatusPill status={status} />
            </div>

            {/* AI Score */}
            <div className="card" style={{ padding: '20px', textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--m2)', fontFamily: "'Syne', sans-serif", fontWeight: 600, marginBottom: 12 }}>AI Match Score</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 56, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{candidate.score}</div>
              <div style={{ fontSize: 12, color: 'var(--m2)', marginTop: 4 }}>out of 100</div>
              <div style={{ height: 6, background: 'var(--b1)', borderRadius: 3, marginTop: 14, overflow: 'hidden' }}>
                <div style={{ width: `${candidate.score}%`, height: '100%', background: scoreColor, borderRadius: 3, transition: 'width 0.8s ease' }} />
              </div>

              {/* Score breakdown */}
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(candidate.scoreBreakdown).map(([key, val]) => (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: 'var(--m1)', textTransform: 'capitalize' }}>{key}</span>
                      <span style={{ color: 'var(--text)', fontWeight: 600 }}>{val}%</span>
                    </div>
                    <div style={{ height: 3, background: 'var(--b1)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${val}%`, height: '100%', background: scoreColor, borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="card" style={{ padding: 16, marginBottom: 16 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 700, color: 'var(--m2)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>Contact</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[['📧', candidate.email], ['📱', candidate.phone], ['🔗', candidate.linkedin], ['📍', candidate.location]].map(([icon, val], i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--m1)' }}>
                    <span>{icon}</span><span style={{ wordBreak: 'break-all' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Change Status */}
            <div className="card" style={{ padding: 16, marginBottom: 16 }}>
              <label className="label">Update Status</label>
              <select className="select" value={status} onChange={e => handleStatusChange(e.target.value)} style={{ fontSize: 13 }}>
                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>

            {/* Quick Skills */}
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 700, color: 'var(--m2)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {candidate.skills.map(s => (
                  <span key={s} style={{ padding: '4px 10px', borderRadius: 6, background: 'var(--s3)', border: '1px solid var(--b2)', fontSize: 12, color: 'var(--m1)' }}>{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--b1)', padding: '0 28px', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 5 }}>
              {tabs.map(t => (
                <button key={t} onClick={() => setActiveTab(t)} style={{
                  padding: '14px 20px', border: 'none', background: 'transparent',
                  color: activeTab === t ? 'var(--text)' : 'var(--m2)',
                  fontSize: 14, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                  borderBottom: activeTab === t ? '2px solid var(--blue)' : '2px solid transparent',
                  textTransform: 'capitalize', fontWeight: activeTab === t ? 500 : 400,
                  transition: 'color 0.15s, border-color 0.15s',
                  marginBottom: -1,
                }}>{t}</button>
              ))}
            </div>

            <div style={{ padding: '28px', flex: 1 }}>
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <Section title="Summary">
                    <p style={{ fontSize: 15, color: 'var(--m1)', lineHeight: 1.75, fontWeight: 300 }}>{candidate.summary}</p>
                  </Section>
                  <Section title="Background">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <InfoCard label="Experience" value={candidate.experience} />
                      <InfoCard label="Education" value={candidate.education} />
                      <InfoCard label="Applied Date" value={new Date(candidate.appliedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
                      <InfoCard label="Applied Role" value={candidate.appliedRole} />
                    </div>
                  </Section>
                  <Section title="Action Center">
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => { handleStatusChange('shortlisted'); }}>
                        ✓ Shortlist Candidate
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => { handleStatusChange('interview'); }}>
                        📅 Schedule Interview
                      </button>
                      <button className="btn btn-danger" onClick={() => { handleStatusChange('rejected'); }}>
                        ✗ Reject
                      </button>
                    </div>
                  </Section>
                </div>
              )}

              {activeTab === 'resume' && (
                <div>
                  <Section title="Resume Preview">
                    <div style={{ background: 'var(--s1)', border: '1px solid var(--b1)', borderRadius: 12, padding: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--b1)' }}>
                        <div>
                          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800 }}>{candidate.name}</div>
                          <div style={{ color: 'var(--m1)', fontSize: 14, marginTop: 4 }}>{candidate.email} · {candidate.phone}</div>
                          <div style={{ color: 'var(--m2)', fontSize: 13, marginTop: 2 }}>{candidate.location}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className={`pill pill-${getScoreColor(candidate.score) === 'teal' ? 'teal' : getScoreColor(candidate.score) === 'amber' ? 'amber' : 'red'}`} style={{ fontSize: 13 }}>
                            AI Score: {candidate.score}/100
                          </span>
                        </div>
                      </div>
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--m2)', marginBottom: 10 }}>Summary</div>
                        <p style={{ fontSize: 14, color: 'var(--m1)', lineHeight: 1.7 }}>{candidate.summary}</p>
                      </div>
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--m2)', marginBottom: 10 }}>Skills</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {candidate.skills.map(s => <span key={s} style={{ padding: '4px 12px', borderRadius: 6, background: 'var(--s2)', border: '1px solid var(--b2)', fontSize: 13, color: 'var(--text)' }}>{s}</span>)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--m2)', marginBottom: 10 }}>Education</div>
                        <div style={{ fontSize: 14, color: 'var(--m1)' }}>{candidate.education}</div>
                      </div>
                    </div>
                  </Section>
                </div>
              )}

              {activeTab === 'emails' && (
                <div>
                  <Section title={`Email History (${candidate.emails.length} sent)`}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {candidate.emails.map((email, i) => (
                        <div key={i} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: `var(--${emailTypeColors[email.type]}-dim)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>
                            {email.type === 'confirmation' ? '📨' : email.type === 'shortlist' ? '⭐' : email.type === 'interview' ? '📅' : '✉️'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>{email.subject}</div>
                            <div style={{ fontSize: 12.5, color: 'var(--m2)' }}>Sent automatically by n8n · {email.sent}</div>
                          </div>
                          <span className={`pill pill-${emailTypeColors[email.type]}`} style={{ fontSize: 11 }}>Auto-sent</span>
                        </div>
                      ))}
                    </div>
                  </Section>
                </div>
              )}

              {activeTab === 'notes' && (
                <div>
                  <Section title="HR Notes">
                    <textarea
                      className="input"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Add your notes about this candidate..."
                      style={{ minHeight: 200, marginBottom: 14 }}
                    />
                    <button className="btn btn-primary btn-sm" onClick={handleSave}>Save Notes</button>
                  </Section>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.2px' }}>{title}</h3>
      {children}
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--m2)', fontFamily: "'Syne', sans-serif", fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{value}</div>
    </div>
  );
}
