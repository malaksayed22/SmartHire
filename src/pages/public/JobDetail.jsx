import { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PublicNav from '../../components/PublicNav';
import { DeptTag } from '../../components/UI';
import { JOBS } from '../../data/mock';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const job = JOBS.find(j => j.id === id);
  const [form, setForm] = useState({ name: '', email: '', phone: '', linkedin: '', cover: '' });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  if (!job) return <div style={{ padding: 100, textAlign: 'center', color: 'var(--m1)' }}>Job not found. <Link to="/jobs" style={{ color: 'var(--blue)' }}>Back to jobs →</Link></div>;

  const handleFile = (f) => {
    if (f && (f.type === 'application/pdf' || f.name.endsWith('.docx'))) setFile(f);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !file) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1800));
    setSubmitting(false);
    setSubmitted(true);
  };

  const daysAgo = Math.floor((Date.now() - new Date(job.posted)) / 86400000);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PublicNav />
      <div style={{ paddingTop: 100 }}>

        {/* Breadcrumb */}
        <div style={{ padding: '20px 52px', borderBottom: '1px solid var(--b1)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--m2)' }}>
          <Link to="/jobs" style={{ color: 'var(--m2)', textDecoration: 'none' }}
          onMouseEnter={e => e.target.style.color = 'var(--text)'}
          onMouseLeave={e => e.target.style.color = 'var(--m2)'}
          >Jobs</Link>
          <span>›</span>
          <span>{job.department}</span>
          <span>›</span>
          <span style={{ color: 'var(--text)' }}>{job.title}</span>
        </div>

        <div style={{ display: 'flex', gap: 0, maxWidth: '100%' }}>
          {/* Left - Job Content */}
          <div style={{ flex: 1, padding: '48px 52px 80px', borderRight: '1px solid var(--b1)', maxWidth: '62%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <DeptTag dept={job.department} />
              <span className="pill" style={{ background: 'var(--b1)', color: 'var(--m1)', fontSize: 11 }}>{job.type}</span>
            </div>

            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 400, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 20 }}>{job.title}</h1>

            <div style={{ display: 'flex', gap: 20, fontSize: 13.5, color: 'var(--m1)', marginBottom: 32, flexWrap: 'wrap' }}>
              <span>📍 {job.location}</span>
              <span>💰 {job.salary}</span>
              <span>👥 {job.applicants} applicants</span>
              <span>🕐 Posted {daysAgo === 0 ? 'today' : `${daysAgo} days ago`}</span>
            </div>

            <div className="divider" />

            <Section title="About the role">
              <p style={{ fontSize: 15, color: 'var(--m1)', lineHeight: 1.8, fontWeight: 300 }}>{job.description}</p>
            </Section>

            <Section title="Responsibilities">
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {job.responsibilities.map((r, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, fontSize: 14.5, color: 'var(--m1)', lineHeight: 1.6 }}>
                    <span style={{ width: 20, height: 20, flexShrink: 0, borderRadius: '50%', background: 'var(--blue-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'var(--blue)', marginTop: 2 }}>✓</span>
                    {r}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Requirements">
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {job.requirements.map((r, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, fontSize: 14.5, color: 'var(--m1)', lineHeight: 1.6 }}>
                    <span style={{ width: 20, height: 20, flexShrink: 0, borderRadius: '50%', background: 'var(--violet-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'var(--violet)', marginTop: 2 }}>→</span>
                    {r}
                  </li>
                ))}
              </ul>
            </Section>

            {job.nice && (
              <Section title="Nice to have">
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {job.nice.map((r, i) => (
                    <li key={i} style={{ fontSize: 14, color: 'var(--m2)', paddingLeft: 16, position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 0, color: 'var(--teal)' }}>◦</span>{r}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Skills */}
            <Section title="Skills">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {job.skills.map(s => (
                  <span key={s} style={{ padding: '6px 14px', borderRadius: 8, background: 'var(--s2)', border: '1px solid var(--b2)', fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{s}</span>
                ))}
              </div>
            </Section>
          </div>

          {/* Right - Application Form */}
          <div style={{ width: 420, flexShrink: 0, position: 'sticky', top: 100, height: 'calc(100vh - 100px)', overflowY: 'auto', padding: '40px 40px 60px' }}>
            {submitted ? (
              <SuccessState job={job} navigate={navigate} />
            ) : (
              <div>
                <div style={{ marginBottom: 28 }}>
                  <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Apply for this role</h2>
                  <p style={{ fontSize: 13.5, color: 'var(--m1)' }}>AI will score your resume instantly. You'll hear back fast.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label className="label">Full Name *</label>
                    <input className="input" placeholder="Sara Ahmed" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Email *</label>
                    <input className="input" type="email" placeholder="sara@email.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input className="input" placeholder="+20 100 000 0000" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">LinkedIn</label>
                    <input className="input" placeholder="linkedin.com/in/your-profile" value={form.linkedin} onChange={e => setForm(p => ({ ...p, linkedin: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Cover Letter</label>
                    <textarea className="input" placeholder="Tell us why you're a great fit..." value={form.cover} onChange={e => setForm(p => ({ ...p, cover: e.target.value }))} style={{ minHeight: 100 }} />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="label">Resume * (PDF or DOCX)</label>
                    <div
                      onClick={() => fileRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
                      style={{
                        border: `2px dashed ${dragging ? 'var(--blue)' : file ? 'var(--teal)' : 'var(--b3)'}`,
                        borderRadius: 10, padding: '24px 16px', textAlign: 'center', cursor: 'pointer',
                        background: dragging ? 'var(--blue-dim)' : file ? 'var(--teal-dim)' : 'var(--s2)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <input ref={fileRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
                      {file ? (
                        <div>
                          <div style={{ fontSize: 22, marginBottom: 6 }}>📄</div>
                          <div style={{ fontSize: 13.5, color: 'var(--teal)', fontWeight: 500 }}>{file.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--m2)', marginTop: 4 }}>{(file.size / 1024).toFixed(0)} KB · Click to replace</div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: 22, marginBottom: 8 }}>⬆</div>
                          <div style={{ fontSize: 13.5, color: 'var(--m1)' }}>Drop your resume here or <span style={{ color: 'var(--blue)' }}>browse</span></div>
                          <div style={{ fontSize: 12, color: 'var(--m2)', marginTop: 4 }}>PDF or DOCX · Max 10MB</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={!form.name || !form.email || !file || submitting}
                    style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15, borderRadius: 10, opacity: (!form.name || !form.email || !file) ? 0.5 : 1, cursor: (!form.name || !form.email || !file) ? 'not-allowed' : 'pointer' }}
                  >
                    {submitting ? (
                      <><div className="spinner" style={{ width: 16, height: 16 }} /> Submitting...</>
                    ) : 'Submit Application →'}
                  </button>

                  <p style={{ fontSize: 12, color: 'var(--m2)', textAlign: 'center' }}>
                    By applying you confirm AI will analyze your resume to score your match for this role.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.2px' }}>{title}</h3>
      {children}
    </div>
  );
}

function SuccessState({ job, navigate }) {
  return (
    <div style={{ textAlign: 'center', animation: 'scaleIn 0.4s ease' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--teal-dim)', border: '2px solid rgba(30,207,170,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 28 }}>✓</div>
      <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Application Submitted!</h2>
      <p style={{ color: 'var(--m1)', fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>
        Your application for <strong style={{ color: 'var(--text)' }}>{job.title}</strong> has been received.
      </p>
      <p style={{ color: 'var(--m1)', fontSize: 13.5, lineHeight: 1.7, marginBottom: 28 }}>
        Our AI is scoring your resume right now. You'll receive a confirmation email within minutes, and we'll be in touch about next steps.
      </p>
      <div style={{ background: 'var(--s2)', border: '1px solid var(--b1)', borderRadius: 10, padding: 16, marginBottom: 28, textAlign: 'left' }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--m2)', fontFamily: "'Syne', sans-serif", fontWeight: 600, marginBottom: 10 }}>What happens next</div>
        {['AI scores your resume (instant)', 'HR reviews your profile (1–3 days)', 'You\'ll receive an email update'].map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0', borderTop: i > 0 ? '1px solid var(--b1)' : 'none' }}>
            <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--blue-dim)', color: '#8AB8FF', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
            <span style={{ fontSize: 13, color: 'var(--m1)' }}>{s}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Link to="/candidate/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Track My Application →</Link>
        <Link to="/jobs" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>Browse More Jobs</Link>
      </div>
    </div>
  );
}
