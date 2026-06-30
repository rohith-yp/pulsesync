import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, TrendingUp, Activity, Users2, MapPin } from 'lucide-react';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToDashboard: () => void;
}

const AnimatedCounter = ({ target, suffix = '', duration = 1500 }: { target: number; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [target, duration]);
  return <span>{count.toLocaleString()}{suffix}</span>;
};

export const LandingPage = ({ onNavigateToLogin, onNavigateToDashboard }: LandingPageProps) => {
  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>

      {/* ── NAVBAR ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #F1F5F9',
        padding: '0 5%',
        height: '80px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}>
          <img src="/logo.png" alt="PulseSync AI" style={{ height: '88px', mixBlendMode: 'multiply', objectFit: 'contain' }} />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>
              PulseSync <span style={{ color: '#2563EB' }}>AI</span>
            </span>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#94A3B8', letterSpacing: '0.5px' }}>
              Predict. Prevent. Protect.
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onNavigateToLogin} style={{ padding: '10px 28px', borderRadius: '8px', border: 'none', backgroundColor: '#2563EB', color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(37,99,235,0.4)', letterSpacing: '0.2px' }}>
            Sign In →
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{
        padding: '90px 5% 80px',
        background: 'radial-gradient(ellipse at 70% 0%, #EFF6FF 0%, #FFFFFF 65%)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '60px',
        alignItems: 'center'
      }}>
        {/* Left — Copy */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#EFF6FF', color: '#2563EB', padding: '6px 14px', borderRadius: '30px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '24px' }}>
            <Zap size={13} /> AI-Powered Hospital Intelligence Platform
          </div>
          <h1 style={{ fontSize: '3.2rem', fontWeight: 900, letterSpacing: '-1.5px', color: '#0F172A', marginBottom: '20px', lineHeight: 1.15 }}>
            Predict Hospital<br />Overload <span style={{ color: '#2563EB' }}>Before It Happens.</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#64748B', marginBottom: '36px', lineHeight: '1.7', maxWidth: '480px' }}>
            PulseSync AI gives clinical leadership 45–90 minutes of advance notice before a surge, burnout event, or resource crisis hits.
          </p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button onClick={onNavigateToLogin} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', borderRadius: '10px', border: 'none', backgroundColor: '#2563EB', color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(37,99,235,0.35)' }}>
              Sign In to Access →
            </button>
          </div>
          <div style={{ display: 'flex', gap: '24px', marginTop: '40px', flexWrap: 'wrap' }}>
            {['HIPAA Compliant', 'SSL Encrypted', 'Role-Based Access'].map((badge, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>
                <ShieldCheck size={14} color="#10B981" />
                {badge}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — Animated Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}
        >
          {/* Glow */}
          <div style={{ position: 'absolute', top: '40px', right: '-40px', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

          {/* Card 1 — Surge waveform */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '20px 24px', border: '1px solid #E2E8F0', boxShadow: '0 8px 32px rgba(37,99,235,0.08)', position: 'relative', zIndex: 1, overflow: 'hidden' }}
          >
            <div style={{ position: 'absolute', top: 0, right: 0, width: '70px', height: '70px', background: 'radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)', borderRadius: '0 16px 0 100%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.5px', marginBottom: '4px' }}>AI SURGE FORECAST · NEXT 6 HOURS</div>
                <div style={{ fontSize: '1.55rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>+68 patients <span style={{ fontSize: '0.85rem', color: '#EF4444', fontWeight: 700 }}>↑ High Risk</span></div>
              </div>
              <div style={{ backgroundColor: '#FEF2F2', color: '#EF4444', borderRadius: '8px', padding: '6px 12px', fontSize: '0.7rem', fontWeight: 800, whiteSpace: 'nowrap' }}>🔴 ALERT</div>
            </div>
            <svg viewBox="0 0 340 56" width="100%" height="56" style={{ display: 'block', overflow: 'visible' }}>
              <defs>
                <linearGradient id="areaG" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,46 C30,41 50,48 80,36 C110,24 130,28 160,18 C190,10 210,14 240,7 C270,2 300,9 340,5 L340,56 L0,56 Z" fill="url(#areaG)" />
              <motion.path d="M0,46 C30,41 50,48 80,36 C110,24 130,28 160,18 C190,10 210,14 240,7 C270,2 300,9 340,5" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
              />
              <motion.circle cx="340" cy="5" r="5" fill="#2563EB" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
              {['Now','1h','2h','3h','4h','5h','6h'].map((l, i) => (
                <text key={i} x={i * 56.5} y="54" fontSize="8" fill="#94A3B8" fontWeight="600" textAnchor={i === 6 ? 'end' : 'start'}>{l}</text>
              ))}
            </svg>
          </motion.div>

          {/* Card row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', position: 'relative', zIndex: 1 }}>

            {/* Burnout bars */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
              style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '18px 18px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
            >
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.5px', marginBottom: '12px' }}>BURNOUT RISK · ER DEPT.</div>
              {[
                { name: 'Dr. Mehta', score: 91, color: '#EF4444' },
                { name: 'Dr. Priya', score: 74, color: '#F59E0B' },
                { name: 'Dr. Rajan', score: 48, color: '#10B981' },
              ].map((doc, i) => (
                <div key={i} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#334155' }}>{doc.name}</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: doc.color }}>{doc.score}%</span>
                  </div>
                  <div style={{ height: '5px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                    <motion.div style={{ height: '100%', borderRadius: '4px', backgroundColor: doc.color }}
                      initial={{ width: 0 }} animate={{ width: `${doc.score}%` }} transition={{ duration: 0.8, delay: 0.6 + i * 0.1 }}
                    />
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Live alerts dark */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.55 }}
              style={{ backgroundColor: '#0F172A', borderRadius: '16px', padding: '18px 18px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <motion.span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}
                  animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                />
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.5px' }}>LIVE AI ALERTS</span>
              </div>
              {[
                { dept: 'Emergency', msg: 'Surge in 2hr window', sev: '#EF4444' },
                { dept: 'ICU', msg: 'Bed capacity at 94%', sev: '#F59E0B' },
                { dept: 'Cardiology', msg: 'Staff redistributed ✓', sev: '#10B981' },
              ].map((a, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.15 }}
                  style={{ padding: '7px 10px', borderRadius: '8px', borderLeft: `3px solid ${a.sev}`, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: '7px' }}
                >
                  <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#F1F5F9' }}>{a.dept}</div>
                  <div style={{ fontSize: '0.55rem', color: '#64748B', marginTop: '1px' }}>{a.msg}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Card 3 — Department bar chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}
            style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '16px 20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', position: 'relative', zIndex: 1 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.5px' }}>LIVE DEPARTMENT OCCUPANCY</span>
              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#10B981' }}>● Monitoring Active</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
              {[
                { name: 'ER', pct: 94, c: '#EF4444' },
                { name: 'ICU', pct: 81, c: '#F59E0B' },
                { name: 'Surgery', pct: 55, c: '#10B981' },
                { name: 'Cardio', pct: 73, c: '#F59E0B' },
                { name: 'Ortho', pct: 48, c: '#10B981' },
                { name: 'Radiology', pct: 40, c: '#10B981' },
              ].map((dept, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.55rem', fontWeight: 600, color: '#94A3B8', marginBottom: '5px' }}>{dept.name}</div>
                  <div style={{ height: '40px', backgroundColor: '#F8FAFC', borderRadius: '6px', overflow: 'hidden', position: 'relative', border: `1px solid ${dept.c}30` }}>
                    <motion.div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: `${dept.c}30`, borderRadius: '5px' }}
                      initial={{ height: 0 }} animate={{ height: `${dept.pct}%` }} transition={{ duration: 0.9, delay: 0.9 + i * 0.07, ease: 'easeOut' }}
                    />
                  </div>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, color: dept.c, marginTop: '4px' }}>{dept.pct}%</div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS BAND ── */}
      <section style={{ padding: '0 5% 80px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #0891B2 100%)',
          borderRadius: '20px', padding: '40px 60px',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '32px', textAlign: 'center', color: '#FFFFFF',
          boxShadow: '0 20px 50px -15px rgba(37,99,235,0.4)'
        }}>
          {[
            { value: 140, suffix: '+', label: 'Hospitals Powered' },
            { value: 12500, suffix: '+', label: 'Clinicians Assisted' },
            { value: 34, suffix: '%', label: 'Efficiency Gained' },
            { value: 890000, suffix: '', label: 'AI Predictions Made' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1 }}>
                <AnimatedCounter target={s.value} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: '0.85rem', marginTop: '8px', opacity: 0.75, fontWeight: 500 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURE MODULES ── */}
      <section style={{ padding: '0 5% 80px' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ textAlign: 'center', marginBottom: '52px' }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-1px', color: '#0F172A', marginBottom: '12px' }}>
            Everything your clinical team needs
          </h2>
          <p style={{ color: '#64748B', fontSize: '1rem', maxWidth: '500px', margin: '0 auto', lineHeight: '1.65' }}>
            Six purpose-built modules — each solving a real operational bottleneck in one click.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '20px' }}>
          {[
            { icon: <TrendingUp size={22} color="#2563EB" />, tag: 'AI-Powered', bg: '#EFF6FF', title: 'Surge Prediction Engine', desc: 'Forecasts patient inflow 1h–24h ahead using AI models — giving you a critical window to respond before congestion hits.' },
            { icon: <Users2 size={22} color="#059669" />, tag: 'Live Feed', bg: '#ECFDF5', title: 'Clinician Burnout Monitor', desc: 'Real-time stress scores for every active doctor and nurse, with one-click workload rebalancing across departments.' },
            { icon: <MapPin size={22} color="#D97706" />, tag: 'Interactive', bg: '#FFFBEB', title: 'Live Hospital Floor Map', desc: "Color-coded interactive floor layout showing each department's live occupancy, risk level, and overflow timeline." },
            { icon: <Activity size={22} color="#7C3AED" />, tag: 'Logistics', bg: '#F5F3FF', title: 'Smart Resource Dispatch', desc: 'Tracks beds, ventilators, and PPE in real time — with automated reallocation suggestions before shortages occur.' },
            { icon: <ShieldCheck size={22} color="#DC2626" />, tag: 'Critical', bg: '#FEF2F2', title: 'Emergency Command Mode', desc: 'One-click crisis activation that reconfigures triage assignments, staff routing, and supply chains for mass events.' },
            { icon: <Zap size={22} color="#0EA5E9" />, tag: 'Reporting', bg: '#F0F9FF', title: 'AI Reports & Audit Logs', desc: 'Weekly operational reports with compliance summaries, burnout trend analysis, and export-ready PDF formats.' },
          ].map((f, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              whileHover={{ y: -5, boxShadow: '0 12px 36px rgba(37,99,235,0.1)' } as any}
              style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '28px', border: '1px solid #F1F5F9', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '14px', cursor: 'default', transition: 'all 0.2s' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{f.icon}</div>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, backgroundColor: f.bg, color: '#475569', padding: '4px 10px', borderRadius: '20px' }}>{f.tag}</span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.3 }}>{f.title}</h3>
              <p style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: '1.6' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── ROLE HIGHLIGHT ── */}
      <section style={{ padding: '0 5% 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {[
            {
              role: 'Hospital Administrator',
              accent: '#2563EB',
              bg: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
              desc: 'Full visibility across all departments. Trigger hospital-wide resource redistribution, view global surge risk, and manage clinician workloads.',
              features: ['Global KPI Dashboard', 'All-department floor map', 'Emergency Command Mode', 'AI Simulator & Reports'],
            },
            {
              role: 'Department Head',
              accent: '#059669',
              bg: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
              desc: "Localized operational control for your department. Monitor your team's burnout levels, respond to AI alerts, and manage ER-level resources.",
              features: ['ER-scoped KPI view', 'Clinician stress monitoring', 'Localized AI alerts', 'Department bottleneck forecast'],
            }
          ].map((r, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
              style={{ background: r.bg, borderRadius: '20px', padding: '36px', border: `1px solid ${r.accent}20` }}
            >
              <div style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: 800, backgroundColor: r.accent, color: '#FFFFFF', padding: '5px 12px', borderRadius: '20px', marginBottom: '18px' }}>
                {r.role}
              </div>
              <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: '1.65', marginBottom: '24px' }}>{r.desc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {r.features.map((feat, fi) => (
                  <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', fontWeight: 600, color: '#1E293B' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: r.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#FFFFFF', fontSize: '0.6rem', fontWeight: 900 }}>✓</span>
                    </div>
                    {feat}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section style={{ padding: '0 5% 80px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)', borderRadius: '24px', padding: '64px 5%', textAlign: 'center', color: '#FFFFFF', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '300px', height: '300px', borderRadius: '50%', backgroundColor: 'rgba(37,99,235,0.15)', filter: 'blur(80px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.1)', filter: 'blur(80px)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 900, letterSpacing: '-1px', marginBottom: '16px', lineHeight: 1.2 }}>
              Stop reacting.<br /><span style={{ color: '#38BDF8' }}>Start predicting.</span>
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.6)', maxWidth: '460px', margin: '0 auto 36px', lineHeight: '1.65' }}>
              Give your clinical leadership 45–90 minutes of advance notice before a crisis hits.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <button onClick={onNavigateToLogin} style={{ padding: '15px 36px', borderRadius: '10px', border: 'none', backgroundColor: '#2563EB', color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(37,99,235,0.4)' }}>
                Sign In to Your Account →
              </button>
              <button onClick={onNavigateToDashboard} style={{ padding: '15px 32px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.08)', color: '#FFFFFF', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
                Explore Dashboard
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: '#0F172A', color: '#94A3B8', padding: '50px 5% 28px', borderTop: '1px solid #1E293B' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px', borderBottom: '1px solid #1E293B', paddingBottom: '36px', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'inline-flex', backgroundColor: '#FFFFFF', padding: '10px 20px', borderRadius: '12px', marginBottom: '14px' }}>
              <img src="/logo.png" alt="PulseSync AI Logo" style={{ height: '80px', objectFit: 'contain' }} />
            </div>
            <p style={{ maxWidth: '320px', fontSize: '0.85rem', lineHeight: '1.55' }}>
              Optimizing clinical operations and staff wellness through predictive workforce intelligence.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '0.85rem', marginBottom: '14px', fontWeight: 700 }}>Platform</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                {['Surge Prediction', 'Burnout Monitor', 'Floor Map', 'Crisis Simulator'].map((l, i) => <li key={i}>{l}</li>)}
              </ul>
            </div>
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '0.85rem', marginBottom: '14px', fontWeight: 700 }}>Legal</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                {['Privacy Policy', 'Terms of Service', 'HIPAA Compliance', 'Security'].map((l, i) => <li key={i}>{l}</li>)}
              </ul>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.78rem' }}>
          <div>© {new Date().getFullYear()} PulseSync AI — AI-Powered Hospital Workforce Intelligence. All rights reserved.</div>
        </div>
      </footer>

    </div>
  );
};
