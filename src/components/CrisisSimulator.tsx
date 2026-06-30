import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit, Users, Layers, AlertCircle, PlayCircle, RefreshCw,
  Zap, Loader, Clock, ShieldAlert, Activity, Siren, CheckCircle2, ChevronRight
} from 'lucide-react';
import { mockDataEngine } from '../utils/mockData';
import { DonutChart, HeatmapChart } from './SVGCharts';
import { groqChat, SYSTEM_PROMPTS } from '../utils/groqClient';

// ─── Structured step type ────────────────────────────────────────────────────
interface MitigationStep {
  title: string;
  detail: string;
  urgency: 'IMMEDIATE' | 'WITHIN 15 MIN' | 'WITHIN 1 HOUR';
  icon: string;
  category: 'staffing' | 'resources' | 'protocol' | 'patient-flow';
}

const URGENCY_CONFIG = {
  'IMMEDIATE':      { color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', dot: '#EF4444' },
  'WITHIN 15 MIN':  { color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', dot: '#F59E0B' },
  'WITHIN 1 HOUR':  { color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', dot: '#2563EB' },
};

const CATEGORY_ICONS: Record<MitigationStep['category'], React.ReactNode> = {
  staffing:      <Users size={14} />,
  resources:     <Layers size={14} />,
  protocol:      <ShieldAlert size={14} />,
  'patient-flow': <Activity size={14} />,
};

// ─── Parse raw Groq text into structured steps ─────────────────────────────
const parseSteps = (raw: string, fallback: string[]): MitigationStep[] => {
  // Try to parse structured JSON if Groq returned it
  try {
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as MitigationStep[];
      if (Array.isArray(parsed) && parsed[0]?.title) return parsed.slice(0, 4);
    }
  } catch { /* fallback below */ }

  // Parse plain text — split by numbered lines
  const lines = raw
    .split('\n')
    .map(l => l.replace(/^\d+[\.\-\)]\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '').trim())
    .filter(l => l.length > 10);

  const urgencies: MitigationStep['urgency'][] = ['IMMEDIATE', 'WITHIN 15 MIN', 'WITHIN 1 HOUR', 'WITHIN 1 HOUR'];
  const categories: MitigationStep['category'][] = ['protocol', 'staffing', 'resources', 'patient-flow'];
  const icons = ['🚨', '👥', '🏥', '🔄'];

  const source = lines.length >= 2 ? lines : fallback;
  return source.slice(0, 4).map((line, i) => {
    // Try to split "Title: detail" or "**Title**: detail"
    const colonIdx = line.indexOf(':');
    const hasTitle = colonIdx > 0 && colonIdx < 35;
    return {
      title: hasTitle ? line.slice(0, colonIdx).trim() : `Action ${i + 1}`,
      detail: hasTitle ? line.slice(colonIdx + 1).trim() : line,
      urgency: urgencies[i] ?? 'WITHIN 1 HOUR',
      icon: icons[i] ?? '⚡',
      category: categories[i] ?? 'protocol',
    };
  });
};

// ─── Component ────────────────────────────────────────────────────────────────
export const CrisisSimulator: React.FC = () => {
  const [patientCount, setPatientCount] = useState<number>(150);
  const [startHour, setStartHour]       = useState<number>(18);
  const [endHour, setEndHour]           = useState<number>(20);
  const [results, setResults]           = useState<any | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [mitigationSteps, setMitigationSteps] = useState<MitigationStep[]>([]);
  const [activeStepIdx, setActiveStepIdx] = useState<number | null>(null);
  const [executedSteps, setExecutedSteps] = useState<Set<number>>(new Set());

  const handleSimulate = async () => {
    setIsSimulating(true);
    setResults(null);
    setExecutedSteps(new Set());
    setActiveStepIdx(null);
    try {
      const simResults = mockDataEngine.runCrisisSimulation(patientCount, startHour, endHour);

      // Ask Groq for STRUCTURED JSON steps
      const contextPrompt =
`Crisis Simulation Parameters:
- Arrivals: ${patientCount} patients arriving between ${startHour}:00–${endHour}:00
- Hospital Risk Score: ${simResults.hospitalRiskScore}/100
- Staff deficit: +${simResults.staffNeeded} doctors & nurses needed
- Bed deficit: ${simResults.resourceRequirement.beds} beds, ${simResults.resourceRequirement.icu} ICU beds, ${simResults.resourceRequirement.ventilators} ventilators

Return ONLY a valid JSON array with exactly 4 mitigation steps, no prose. Format:
[
  {
    "title": "Short action title (3-5 words)",
    "detail": "One precise actionable instruction with numbers/timeframes (max 20 words)",
    "urgency": "IMMEDIATE",
    "icon": "🚨",
    "category": "protocol"
  },
  ...
]
urgency must be one of: "IMMEDIATE", "WITHIN 15 MIN", "WITHIN 1 HOUR"
category must be one of: "staffing", "resources", "protocol", "patient-flow"
icon should be a single relevant emoji.`;

      const response = await groqChat([
        { role: 'system', content: SYSTEM_PROMPTS.crisisNarrative },
        { role: 'user', content: contextPrompt }
      ]);

      setMitigationSteps(parseSteps(response, simResults.recommendedActions));
      setResults(simResults);
    } catch {
      const simResults = mockDataEngine.runCrisisSimulation(patientCount, startHour, endHour);
      setMitigationSteps(parseSteps('', simResults.recommendedActions));
      setResults(simResults);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setMitigationSteps([]);
    setExecutedSteps(new Set());
    setActiveStepIdx(null);
  };

  const applyPreset = (count: number, start: number, end: number) => {
    setPatientCount(count); setStartHour(start); setEndHour(end); setResults(null);
  };

  const executeStep = (idx: number) => {
    setExecutedSteps(prev => new Set([...prev, idx]));
    setActiveStepIdx(null);
  };

  const heatmapRows = ['Emergency', 'ICU', 'Radiology', 'Pharmacy'];
  const heatmapCols = [`${startHour}:00`, `${Math.round((startHour + endHour) / 2)}:00`, `${endHour}:00`];

  const generateSimulatedMatrix = (occ: number, risk: number) => {
    const m = risk * 0.05;
    return [
      [Math.min(100, Math.round(occ * 1.1 + m)), Math.min(100, Math.round(occ * 1.25 + m)), Math.min(100, Math.round(occ * 0.9))],
      [Math.min(100, Math.round(occ * 0.95 + m)), Math.min(100, Math.round(occ * 1.05 + m)), Math.min(100, Math.round(occ * 1.15 + m))],
      [Math.min(100, Math.round(occ * 0.7)), Math.min(100, Math.round(occ * 0.85 + m)), Math.min(100, Math.round(occ * 0.8))],
      [Math.min(100, Math.round(occ * 0.8)), Math.min(100, Math.round(occ * 0.9 + m)), Math.min(100, Math.round(occ * 0.95))]
    ];
  };

  return (
    <div className="card" style={{ marginBottom: '30px', padding: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <BrainCircuit size={20} color="var(--primary)" />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>AI Crisis Simulator</h2>
      </div>

      <AnimatePresence mode="wait">
        {!results ? (
          <motion.div key="config" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--neutral-600)', marginBottom: '20px', lineHeight: '1.5' }}>
              Run predictive stress-test simulations. Configure anticipated patient arrivals over specific timeframes to analyze structural bottlenecks before they occur.
            </p>

            {/* Presets */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--neutral-500)', textTransform: 'uppercase' }}>Quick Presets:</span>
              <button onClick={() => applyPreset(150, 18, 20)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>150 patients (6 PM – 8 PM)</button>
              <button onClick={() => applyPreset(60, 0, 4)}   className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>60 patients (Midnight – 4 AM)</button>
              <button onClick={() => applyPreset(250, 8, 14)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>250 patients (Morning Surge)</button>
            </div>

            {/* Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: 'var(--neutral-50)', padding: '16px', borderRadius: 'var(--border-radius-md)' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: 'var(--neutral-700)', marginBottom: '10px' }}>
                  <span>Anticipated Arrivals</span>
                  <span style={{ color: 'var(--primary)' }}>{patientCount} Patients</span>
                </label>
                <input type="range" min="20" max="300" step="10" value={patientCount}
                  onChange={e => setPatientCount(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--neutral-400)', marginTop: '4px' }}>
                  <span>20 Patients</span><span>300 Patients</span>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--neutral-50)', padding: '16px', borderRadius: 'var(--border-radius-md)' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--neutral-700)', marginBottom: '10px' }}>
                  Simulation Time Horizon
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <select value={startHour} onChange={e => setStartHour(Number(e.target.value))}
                    style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--neutral-300)', outline: 'none' }}>
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>{i === 0 ? '12 AM' : i === 12 ? '12 PM' : i > 12 ? `${i - 12} PM` : `${i} AM`}</option>
                    ))}
                  </select>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--neutral-450)' }}>to</span>
                  <select value={endHour} onChange={e => setEndHour(Number(e.target.value))}
                    style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--neutral-300)', outline: 'none' }}>
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>{i === 0 ? '12 AM' : i === 12 ? '12 PM' : i > 12 ? `${i - 12} PM` : `${i} AM`}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button onClick={handleSimulate} className="btn btn-primary" disabled={isSimulating}
              style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {isSimulating ? (
                <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /><span>Synthesizing Groq AI Crisis Models...</span></>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>Run Stress Test Simulation <PlayCircle size={18} /></span>
              )}
            </button>
          </motion.div>

        ) : (
          <motion.div key="results" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>

            {/* KPI cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: 'var(--neutral-50)', padding: '16px', borderRadius: 'var(--border-radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--neutral-500)', fontWeight: 600 }}>
                  <Users size={14} /> Additional Staff Needed
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--neutral-900)', marginTop: '4px' }}>
                  +{results.staffNeeded} <span style={{ fontSize: '0.88rem', color: 'var(--neutral-400)' }}>doctors & nurses</span>
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--neutral-50)', padding: '16px', borderRadius: 'var(--border-radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--neutral-500)', fontWeight: 600 }}>
                  <Layers size={14} /> Resource Deficits
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--neutral-900)', marginTop: '6px' }}>
                  {results.resourceRequirement.beds} beds, {results.resourceRequirement.icu} ICU, {results.resourceRequirement.ventilators} vent.
                </div>
              </div>
              <div style={{
                backgroundColor: results.hospitalRiskScore >= 80 ? 'var(--danger-light)' : 'var(--warning-light)',
                padding: '16px', borderRadius: 'var(--border-radius-md)',
                border: `1px solid ${results.hospitalRiskScore >= 80 ? 'var(--danger)' : 'var(--warning)'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: results.hospitalRiskScore >= 80 ? 'var(--danger)' : '#B45309', fontWeight: 600 }}>
                  <AlertCircle size={14} /> Simulated Risk Level
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: results.hospitalRiskScore >= 80 ? 'var(--danger)' : '#B45309', marginTop: '4px' }}>
                  {results.hospitalRiskScore} / 100
                </div>
              </div>
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBottom: '28px', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--neutral-700)', marginBottom: '14px', textAlign: 'center' }}>
                  Projected Hospital Capacity Block
                </h3>
                <DonutChart
                  data={[
                    { name: 'Occupied', value: results.predictedOccupancy, color: 'var(--danger)' },
                    { name: 'Available', value: 100 - results.predictedOccupancy, color: 'var(--success)' }
                  ]}
                  size={150} thickness={16} centerTitle="Projected" centerValue={`${results.predictedOccupancy}%`}
                />
              </div>
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--neutral-700)', marginBottom: '14px' }}>
                  Projected Hour-by-Hour Department Load
                </h3>
                <HeatmapChart rows={heatmapRows} cols={heatmapCols} matrix={generateSimulatedMatrix(results.predictedOccupancy, results.hospitalRiskScore)} />
              </div>
            </div>

            {/* ── AI Mitigation Panel ─────────────────────────────────────────── */}
            <div style={{
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '20px',
              border: '1px solid #334155',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* background glow */}
              <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '-30px', left: '30px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />

              {/* Panel header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg,#EF4444,#DC2626)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Siren size={16} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px' }}>Groq AI · Crisis Response</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#F1F5F9', marginTop: '1px' }}>Tactical Mitigation Protocols</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', fontWeight: 700, color: '#10B981', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '4px 10px', borderRadius: '20px' }}>
                  <motion.div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                  {executedSteps.size}/{mitigationSteps.length} Executed
                </div>
              </div>

              {/* Steps grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {mitigationSteps.map((step, idx) => {
                  const uc = URGENCY_CONFIG[step.urgency];
                  const isExpanded = activeStepIdx === idx;
                  const isDone = executedSteps.has(idx);

                  return (
                    <motion.div
                      key={idx}
                      layout
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      onClick={() => !isDone && setActiveStepIdx(isExpanded ? null : idx)}
                      style={{
                        background: isDone
                          ? 'rgba(16,185,129,0.08)'
                          : isExpanded ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                        border: isDone
                          ? '1px solid rgba(16,185,129,0.25)'
                          : isExpanded ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        cursor: isDone ? 'default' : 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {/* left accent bar */}
                      <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
                        backgroundColor: isDone ? '#10B981' : uc.color,
                        borderRadius: '12px 0 0 12px'
                      }} />

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '8px' }}>
                        {/* step number / done check */}
                        <div style={{
                          width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: isDone ? 'rgba(16,185,129,0.15)' : `rgba(${uc.color === '#EF4444' ? '239,68,68' : uc.color === '#F59E0B' ? '245,158,11' : '37,99,235'},0.15)`,
                          color: isDone ? '#10B981' : uc.color,
                          fontSize: '1rem'
                        }}>
                          {isDone ? <CheckCircle2 size={15} /> : <span>{step.icon}</span>}
                        </div>

                        {/* title + urgency badge */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isDone ? '#64748B' : '#F1F5F9', textDecoration: isDone ? 'line-through' : 'none' }}>
                              {step.title}
                            </span>
                            {/* urgency badge */}
                            <span style={{
                              fontSize: '0.58rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px',
                              color: isDone ? '#10B981' : uc.color,
                              backgroundColor: isDone ? 'rgba(16,185,129,0.12)' : `${uc.bg.slice(0, -1)}33)`,
                              border: `1px solid ${isDone ? 'rgba(16,185,129,0.3)' : uc.border}`,
                              padding: '2px 7px', borderRadius: '10px',
                              display: 'flex', alignItems: 'center', gap: '3px'
                            }}>
                              {isDone ? '✓ DONE' : <><Clock size={8} />{step.urgency}</>}
                            </span>
                            {/* category chip */}
                            <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#475569', backgroundColor: 'rgba(71,85,105,0.15)', padding: '2px 6px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              {CATEGORY_ICONS[step.category]}{step.category.replace('-', ' ')}
                            </span>
                          </div>
                        </div>

                        {/* expand chevron */}
                        {!isDone && (
                          <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronRight size={14} color="#475569" />
                          </motion.div>
                        )}
                      </div>

                      {/* Expanded detail + execute button */}
                      <AnimatePresence>
                        {isExpanded && !isDone && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ paddingLeft: '50px', paddingTop: '10px' }}>
                              <p style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: '1.55', margin: '0 0 12px 0' }}>
                                {step.detail}
                              </p>
                              <button
                                onClick={e => { e.stopPropagation(); executeStep(idx); }}
                                style={{
                                  padding: '7px 16px', borderRadius: '8px', border: 'none',
                                  background: `linear-gradient(135deg, ${uc.color}, ${uc.color}CC)`,
                                  color: '#fff', fontSize: '0.74rem', fontWeight: 800,
                                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
                                  boxShadow: `0 0 12px ${uc.color}40`
                                }}
                              >
                                <Zap size={12} /> Execute Protocol
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              {/* All executed banner */}
              <AnimatePresence>
                {executedSteps.size === mitigationSteps.length && mitigationSteps.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginTop: '16px', padding: '12px 16px', borderRadius: '10px',
                      background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                      display: 'flex', alignItems: 'center', gap: '8px',
                      fontSize: '0.8rem', fontWeight: 700, color: '#10B981'
                    }}
                  >
                    <CheckCircle2 size={16} />
                    All crisis protocols executed. Hospital response plan is now active.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <button onClick={handleReset} className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
              <RefreshCw size={14} /> Clear Simulation
            </button>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
