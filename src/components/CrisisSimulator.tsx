import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Users, Layers, AlertCircle, PlayCircle, RefreshCw, Zap, Loader } from 'lucide-react';
import { mockDataEngine } from '../utils/mockData';
import { DonutChart, HeatmapChart } from './SVGCharts';
import { groqChat, SYSTEM_PROMPTS } from '../utils/groqClient';

export const CrisisSimulator: React.FC = () => {
  const [patientCount, setPatientCount] = useState<number>(150);
  const [startHour, setStartHour] = useState<number>(18); // 6 PM
  const [endHour, setEndHour] = useState<number>(20); // 8 PM
  const [results, setResults] = useState<any | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [aiMitigation, setAiMitigation] = useState<string[]>([]);

  const handleSimulate = async () => {
    setIsSimulating(true);
    setResults(null);
    try {
      const simResults = mockDataEngine.runCrisisSimulation(patientCount, startHour, endHour);
      
      // Get AI recommendations from Groq
      const contextPrompt = `Crisis Simulation:
- Arrivals: ${patientCount} patients
- Time: ${startHour}:00 to ${endHour}:00
- Risk Score: ${simResults.hospitalRiskScore}/100
- Staff deficit: +${simResults.staffNeeded} doctors & nurses
- Bed deficit: ${simResults.resourceRequirement.beds} beds, ${simResults.resourceRequirement.icu} ICU beds, ${simResults.resourceRequirement.ventilators} ventilators

Generate exactly 3 specific, operational mitigation instructions.`;

      const response = await groqChat([
        { role: 'system', content: SYSTEM_PROMPTS.crisisNarrative },
        { role: 'user', content: contextPrompt }
      ]);

      const steps = response
        .split('\n')
        .map(line => line.replace(/^\d+[\.\-\)]\s*/, '').replace(/^•\s*/, '').trim())
        .filter(line => line.length > 0)
        .slice(0, 3);

      setAiMitigation(steps.length > 0 ? steps : simResults.recommendedActions);
      setResults(simResults);
    } catch {
      // Fallback
      const simResults = mockDataEngine.runCrisisSimulation(patientCount, startHour, endHour);
      setAiMitigation(simResults.recommendedActions);
      setResults(simResults);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setAiMitigation([]);
  };

  const applyPreset = (count: number, start: number, end: number) => {
    setPatientCount(count);
    setStartHour(start);
    setEndHour(end);
    setResults(null);
  };

  const heatmapRows = ['Emergency', 'ICU', 'Radiology', 'Pharmacy'];
  const heatmapCols = [`${startHour}:00`, `${Math.round((startHour + endHour)/2)}:00`, `${endHour}:00`];
  
  const generateSimulatedMatrix = (occ: number, risk: number) => {
    const modifier = risk * 0.05;
    return [
      [Math.min(100, Math.round(occ * 1.1 + modifier)), Math.min(100, Math.round(occ * 1.25 + modifier)), Math.min(100, Math.round(occ * 0.9))], // ER
      [Math.min(100, Math.round(occ * 0.95 + modifier)), Math.min(100, Math.round(occ * 1.05 + modifier)), Math.min(100, Math.round(occ * 1.15 + modifier))], // ICU
      [Math.min(100, Math.round(occ * 0.7)), Math.min(100, Math.round(occ * 0.85 + modifier)), Math.min(100, Math.round(occ * 0.8))], // Rad
      [Math.min(100, Math.round(occ * 0.8)), Math.min(100, Math.round(occ * 0.9 + modifier)), Math.min(100, Math.round(occ * 0.95))] // Pha
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
          <motion.div
            key="config"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p style={{ fontSize: '0.88rem', color: 'var(--neutral-600)', marginBottom: '20px', lineHeight: '1.5' }}>
              Run predictive stress-test simulations. Configure anticipated patient arrivals over specific timeframes to analyze structural bottlenecks before they occur.
            </p>

            {/* Presets */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--neutral-500)', textTransform: 'uppercase' }}>Quick Presets:</span>
              <button onClick={() => applyPreset(150, 18, 20)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                150 patients (6 PM - 8 PM)
              </button>
              <button onClick={() => applyPreset(60, 0, 4)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                60 patients (Midnight - 4 AM)
              </button>
              <button onClick={() => applyPreset(250, 8, 14)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                250 patients (Morning Surge)
              </button>
            </div>

            {/* Input Config block */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '24px' }}>
              
              {/* Patient Count slider */}
              <div style={{ backgroundColor: 'var(--neutral-50)', padding: '16px', borderRadius: 'var(--border-radius-md)' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: 'var(--neutral-700)', marginBottom: '10px' }}>
                  <span>Anticipated Arrivals</span>
                  <span style={{ color: 'var(--primary)' }}>{patientCount} Patients</span>
                </label>
                <input
                  type="range"
                  min="20"
                  max="300"
                  step="10"
                  value={patientCount}
                  onChange={(e) => setPatientCount(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--neutral-400)', marginTop: '4px' }}>
                  <span>20 Patients</span>
                  <span>300 Patients</span>
                </div>
              </div>

              {/* Start hour selection */}
              <div style={{ backgroundColor: 'var(--neutral-50)', padding: '16px', borderRadius: 'var(--border-radius-md)' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--neutral-700)', marginBottom: '10px' }}>
                  Simulation Time Horizon
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <select
                    value={startHour}
                    onChange={(e) => setStartHour(Number(e.target.value))}
                    style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--neutral-300)', outline: 'none' }}
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>{i === 0 ? '12 AM' : i === 12 ? '12 PM' : i > 12 ? `${i - 12} PM` : `${i} AM`}</option>
                    ))}
                  </select>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--neutral-450)' }}>to</span>
                  <select
                    value={endHour}
                    onChange={(e) => setEndHour(Number(e.target.value))}
                    style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--neutral-300)', outline: 'none' }}
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>{i === 0 ? '12 AM' : i === 12 ? '12 PM' : i > 12 ? `${i - 12} PM` : `${i} AM`}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            <button
              onClick={handleSimulate}
              className="btn btn-primary"
              disabled={isSimulating}
              style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {isSimulating ? (
                <>
                  <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Synthesizing Groq AI Crisis Models...</span>
                </>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  Run Stress Test Simulation <PlayCircle size={18} />
                </span>
              )}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Top Info Cards */}
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
                padding: '16px', 
                borderRadius: 'var(--border-radius-md)', 
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

            {/* Chart and Heatmap Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBottom: '24px', alignItems: 'center' }}>
              
              {/* Donut Chart */}
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--neutral-700)', marginBottom: '14px', textAlign: 'center' }}>
                  Projected Hospital Capacity Block
                </h3>
                <DonutChart 
                  data={[
                    { name: 'Occupied', value: results.predictedOccupancy, color: 'var(--danger)' },
                    { name: 'Available', value: 100 - results.predictedOccupancy, color: 'var(--success)' }
                  ]}
                  size={150}
                  thickness={16}
                  centerTitle="Projected"
                  centerValue={`${results.predictedOccupancy}%`}
                />
              </div>

              {/* Heatmap */}
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--neutral-700)', marginBottom: '14px' }}>
                  Projected Hour-by-Hour Department Load
                </h3>
                <HeatmapChart
                  rows={heatmapRows}
                  cols={heatmapCols}
                  matrix={generateSimulatedMatrix(results.predictedOccupancy, results.hospitalRiskScore)}
                />
              </div>

            </div>

            {/* AI Action Plan */}
            <div style={{ 
              backgroundColor: '#F0F9FF', 
              border: '1px solid #BAE6FD', 
              borderRadius: 'var(--border-radius-lg)', 
              padding: '20px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Zap size={16} color="#0284C7" />
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0284C7', margin: 0 }}>
                  Groq AI Recommended Mitigation Steps
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {aiMitigation.map((action: string, idx: number) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.85rem' }}>
                    <span style={{ 
                      width: '18px', 
                      height: '18px', 
                      borderRadius: '50%', 
                      backgroundColor: '#BAE6FD', 
                      color: '#0284C7', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '0.72rem',
                      fontWeight: 'bold',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      {idx + 1}
                    </span>
                    <span style={{ color: '#0369A1', fontWeight: 500 }}>{action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions footer */}
            <button
              onClick={handleReset}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
            >
              <RefreshCw size={14} /> Clear Simulation
            </button>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
