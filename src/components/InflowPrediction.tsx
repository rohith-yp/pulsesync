import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart } from './SVGCharts';
import { Activity, Clock, TrendingUp, AlertTriangle, Zap, Loader } from 'lucide-react';
import { groqChat, SYSTEM_PROMPTS } from '../utils/groqClient';

export const InflowPrediction: React.FC = () => {
  const [timeHorizon, setTimeHorizon] = useState<'1h' | '6h' | '24h'>('6h');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const inflowData = useMemo(() => {
    switch (timeHorizon) {
      case '1h':
        return [
          { label: '20m ago', value: 12 },
          { label: '10m ago', value: 14 },
          { label: 'Now', value: 18, predicted: 18 },
          { label: 'In 10m', value: 18, predicted: 22 },
          { label: 'In 20m', value: 18, predicted: 26 },
          { label: 'In 30m', value: 18, predicted: 29 },
          { label: 'In 45m', value: 18, predicted: 34 },
          { label: 'In 60m', value: 18, predicted: 38 }
        ];
      case '24h':
        return [
          { label: '08:00', value: 35 },
          { label: '12:00', value: 50 },
          { label: '16:00', value: 65, predicted: 65 },
          { label: '20:00', value: 65, predicted: 82 },
          { label: '00:00', value: 65, predicted: 45 },
          { label: '04:00', value: 65, predicted: 25 },
          { label: '08:00', value: 65, predicted: 38 }
        ];
      default:
        return [
          { label: '2h ago', value: 24 },
          { label: '1h ago', value: 28 },
          { label: 'Now', value: 33, predicted: 33 },
          { label: 'In 1h', value: 33, predicted: 42 },
          { label: 'In 2h', value: 33, predicted: 55 },
          { label: 'In 3h', value: 33, predicted: 68 },
          { label: 'In 4h', value: 33, predicted: 76 },
          { label: 'In 5h', value: 33, predicted: 84 },
          { label: 'In 6h', value: 33, predicted: 90 }
        ];
    }
  }, [timeHorizon]);

  const stats = useMemo(() => {
    switch (timeHorizon) {
      case '1h':
        return {
          expected: 38, peak: 'In 45 mins',
          risk: 'Medium Surge Risk', riskColor: 'var(--warning)', riskBg: 'var(--warning-light)',
          distribution: [
            { name: 'Emergency', pct: 65, color: '#2563EB' },
            { name: 'General Ward', pct: 20, color: '#10B981' },
            { name: 'Radiology', pct: 15, color: '#F59E0B' }
          ]
        };
      case '24h':
        return {
          expected: 312, peak: '18:00 - 20:30',
          risk: 'Critical Surge Risk', riskColor: 'var(--danger)', riskBg: 'var(--danger-light)',
          distribution: [
            { name: 'Emergency', pct: 52, color: '#2563EB' },
            { name: 'General Ward', pct: 30, color: '#10B981' },
            { name: 'ICU', pct: 10, color: '#EF4444' },
            { name: 'Pharmacy', pct: 8, color: '#F59E0B' }
          ]
        };
      default:
        return {
          expected: 90, peak: 'In 3 - 5 hours',
          risk: 'High Surge Risk', riskColor: 'var(--danger)', riskBg: 'var(--danger-light)',
          distribution: [
            { name: 'Emergency', pct: 60, color: '#2563EB' },
            { name: 'General Ward', pct: 25, color: '#10B981' },
            { name: 'Radiology', pct: 10, color: '#F59E0B' },
            { name: 'ICU', pct: 5, color: '#EF4444' }
          ]
        };
    }
  }, [timeHorizon]);

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const contextPrompt = `Hospital surge forecast data:
- Time horizon: ${timeHorizon}
- Expected patients: ${stats.expected}
- Peak inflow: ${stats.peak}
- Risk level: ${stats.risk}
- Distribution: ${stats.distribution.map(d => `${d.name} ${d.pct}%`).join(', ')}
- Inflow trend: rising from ${inflowData[0]?.value} to projected ${inflowData[inflowData.length - 1]?.predicted ?? inflowData[inflowData.length - 1]?.value}

Provide exactly 3 actionable recommendations.`;

      const result = await groqChat([
        { role: 'system', content: SYSTEM_PROMPTS.inflowAnalysis },
        { role: 'user', content: contextPrompt },
      ]);
      setAiAnalysis(result);
    } catch {
      setAiAnalysis('⚠️ Unable to fetch AI analysis. Check your connection.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: '30px', padding: '24px' }}>

      {/* Header & Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={20} color="var(--primary)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>AI Patient Inflow Prediction</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Groq AI Analyze button */}
          <button
            onClick={handleAIAnalysis}
            disabled={isAnalyzing}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 16px', borderRadius: '8px', border: 'none',
              backgroundColor: isAnalyzing ? '#E2E8F0' : '#2563EB',
              color: isAnalyzing ? '#94A3B8' : '#FFFFFF',
              fontSize: '0.78rem', fontWeight: 700, cursor: isAnalyzing ? 'not-allowed' : 'pointer',
              boxShadow: isAnalyzing ? 'none' : '0 4px 12px rgba(37,99,235,0.3)',
              transition: 'all 0.2s'
            }}
          >
            {isAnalyzing ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={14} />}
            {isAnalyzing ? 'Analyzing…' : 'AI Analyze'}
          </button>

          {/* Time horizon tabs */}
          <div style={{ display: 'flex', backgroundColor: 'var(--neutral-100)', padding: '4px', borderRadius: '10px' }}>
            {[{ id: '1h', label: 'Next Hour' }, { id: '6h', label: 'Next 6 Hours' }, { id: '24h', label: 'Tomorrow' }].map(tab => (
              <button key={tab.id} onClick={() => { setTimeHorizon(tab.id as any); setAiAnalysis(null); }}
                style={{ padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600, borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease', backgroundColor: timeHorizon === tab.id ? '#FFFFFF' : 'transparent', color: timeHorizon === tab.id ? 'var(--primary)' : 'var(--neutral-600)', boxShadow: timeHorizon === tab.id ? 'var(--shadow-sm)' : 'none' }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'var(--neutral-50)', padding: '16px', borderRadius: 'var(--border-radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--neutral-500)' }}>
            <Activity size={14} /> Expected Patient Inflow
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--neutral-900)', marginTop: '4px' }}>
            {stats.expected} <span style={{ fontSize: '0.9rem', color: 'var(--neutral-400)', fontWeight: 500 }}>patients</span>
          </div>
        </div>
        <div style={{ backgroundColor: 'var(--neutral-50)', padding: '16px', borderRadius: 'var(--border-radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--neutral-500)' }}>
            <Clock size={14} /> Peak Inflow Hour
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--neutral-900)', marginTop: '8px' }}>{stats.peak}</div>
        </div>
        <div style={{ backgroundColor: stats.riskBg, padding: '16px', borderRadius: 'var(--border-radius-md)', border: `1px solid ${stats.riskColor}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, color: stats.riskColor }}>
            <AlertTriangle size={14} /> System Risk Index
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: stats.riskColor, marginTop: '8px' }}>{stats.risk}</div>
        </div>
      </div>

      {/* Chart + Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--neutral-500)', marginBottom: '10px', fontWeight: 600 }}>
            <span>Historical Inflow (Solid)</span>
            <span style={{ color: 'var(--success)' }}>AI Projected Inflow (Dashed)</span>
          </div>
          <LineChart data={inflowData} />
        </div>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--neutral-700)', marginBottom: '16px' }}>Projected Department Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {stats.distribution.map((dept, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, color: 'var(--neutral-700)', marginBottom: '4px' }}>
                  <span>{dept.name}</span><span>{dept.pct}%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--neutral-200)', borderRadius: '4px', overflow: 'hidden' }}>
                  <motion.div style={{ height: '100%', backgroundColor: dept.color, borderRadius: '4px' }}
                    initial={{ width: 0 }} animate={{ width: `${dept.pct}%` }} transition={{ duration: 0.6, delay: idx * 0.1 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Groq AI Analysis Panel */}
      <AnimatePresence>
        {(aiAnalysis || isAnalyzing) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginTop: '20px', overflow: 'hidden' }}
          >
            <div style={{ backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '12px', padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Zap size={16} color="#0284C7" />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0284C7', letterSpacing: '0.3px' }}>GROQ AI ANALYSIS</span>
                {isAnalyzing && <Loader size={13} color="#0284C7" style={{ animation: 'spin 1s linear infinite', marginLeft: 'auto' }} />}
              </div>
              {aiAnalysis && (
                <div style={{ fontSize: '0.85rem', color: '#0369A1', lineHeight: '1.65', whiteSpace: 'pre-line' }}>
                  {aiAnalysis}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
