import { useState } from 'react';
import HRSidebar from '../../components/HRSidebar';
import { Toast } from '../../components/UI';
import { AUTOMATIONS } from '../../data/mock';

export default function HRAutomations() {
  const [automations, setAutomations] = useState(AUTOMATIONS);
  const [toast, setToast] = useState(null);
  const [testing, setTesting] = useState(null);

  const toggle = (id) => {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
    const auto = automations.find(a => a.id === id);
    setToast({ message: `Workflow "${auto.name}" ${auto.enabled ? 'paused' : 'activated'}`, type: auto.enabled ? 'info' : 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  const testWorkflow = async (id) => {
    setTesting(id);
    await new Promise(r => setTimeout(r, 2000));
    setTesting(null);
    setToast({ message: 'Test email sent successfully via n8n ✓', type: 'success' });
    setTimeout(() => setToast(null), 4000);
  };

  const colorMap = { blue: { bg: 'var(--blue-dim)', color: '#8AB8FF', border: 'rgba(91,142,248,0.2)' }, teal: { bg: 'var(--teal-dim)', color: 'var(--teal)', border: 'rgba(30,207,170,0.2)' }, violet: { bg: 'var(--violet-dim)', color: '#B09DF9', border: 'rgba(139,112,245,0.2)' } };
  const emailCount = AUTOMATIONS.reduce((a, b) => a + b.fireCount, 0);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      <HRSidebar />
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid var(--b1)', position: 'sticky', top: 0, background: 'rgba(6,7,9,0.9)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700 }}>Automations</h1>
            <div style={{ fontSize: 12.5, color: 'var(--m2)', marginTop: 2 }}>n8n workflow status · All running</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 8, background: 'var(--teal-dim)', border: '1px solid rgba(30,207,170,0.2)' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--teal)', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12.5, color: 'var(--teal)', fontWeight: 500 }}>n8n Connected</span>
          </div>
        </div>

        <div style={{ padding: '28px 32px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {[
              { label: 'Total Emails Sent', value: emailCount, color: '#5B8EF8' },
              { label: 'Active Workflows', value: automations.filter(a => a.enabled).length, color: '#1ECFAA' },
              { label: 'Last 24h', value: 12, color: '#8B70F5' },
            ].map((s, i) => (
              <div key={i} className="card" style={{ padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${s.color}70, transparent)` }} />
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--m2)', fontFamily: "'Syne', sans-serif", fontWeight: 600, marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: 'var(--text)' }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Workflow Cards */}
          <div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Active Workflows</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {automations.map(auto => {
                const c = colorMap[auto.color] || colorMap.blue;
                return (
                  <div key={auto.id} className="card" style={{ padding: '24px 28px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                      {/* Icon */}
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: c.bg, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                        {auto.name.includes('Application') ? '📨' : auto.name.includes('Shortlisted') ? '⭐' : '🔔'}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{auto.name}</span>
                          <span className={`pill ${auto.enabled ? 'pill-teal' : 'pill-red'}`} style={{ fontSize: 10.5 }}>{auto.enabled ? '● Active' : '○ Paused'}</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                          <div>
                            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--m3)', fontFamily: "'Syne', sans-serif", fontWeight: 600, marginBottom: 5 }}>Trigger</div>
                            <div style={{ fontSize: 13.5, color: 'var(--m1)' }}>{auto.trigger}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--m3)', fontFamily: "'Syne', sans-serif", fontWeight: 600, marginBottom: 5 }}>Action</div>
                            <div style={{ fontSize: 13.5, color: 'var(--m1)' }}>{auto.action}</div>
                          </div>
                        </div>

                        {/* Workflow visualization */}
                        <div style={{ background: 'var(--s2)', border: '1px solid var(--b1)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 12.5, color: 'var(--m2)', fontFamily: 'monospace', letterSpacing: '0.3px' }}>
                          {auto.workflow}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', gap: 20, fontSize: 12.5, color: 'var(--m2)' }}>
                            <span>Last fired: <span style={{ color: 'var(--m1)' }}>{auto.lastFired}</span></span>
                            <span>Total fires: <span style={{ color: c.color, fontWeight: 600 }}>{auto.fireCount}</span></span>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => testWorkflow(auto.id)}
                              disabled={testing === auto.id}
                              style={{ opacity: testing === auto.id ? 0.6 : 1 }}
                            >
                              {testing === auto.id ? (
                                <><div className="spinner" style={{ width: 12, height: 12 }} /> Testing...</>
                              ) : '▷ Test'}
                            </button>
                            <button
                              onClick={() => toggle(auto.id)}
                              style={{
                                padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
                                background: auto.enabled ? 'rgba(240,80,104,0.1)' : 'var(--teal-dim)',
                                color: auto.enabled ? 'var(--red)' : 'var(--teal)',
                                fontSize: 12.5, fontFamily: "'DM Sans', sans-serif",
                                transition: 'all 0.2s',
                              }}
                            >{auto.enabled ? 'Pause' : 'Activate'}</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* n8n Info */}
          <div className="card" style={{ padding: '24px 28px', background: 'linear-gradient(135deg, rgba(91,142,248,0.04) 0%, rgba(139,112,245,0.04) 100%)' }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 28 }}>⚡</div>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Powered by n8n</div>
                <p style={{ fontSize: 14, color: 'var(--m1)', lineHeight: 1.7, marginBottom: 14 }}>
                  All automations run on a self-hosted n8n instance connected to SmartHire via webhooks. When a candidate's status changes, SmartHire fires a webhook to n8n, which processes the event and sends the appropriate email through Gmail — automatically, in real time.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span className="pill pill-blue">Webhooks</span>
                  <span className="pill pill-violet">Gmail Integration</span>
                  <span className="pill pill-teal">Google Calendar</span>
                  <span className="pill pill-amber">Self-hosted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
