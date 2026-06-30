import React, { useState, useMemo } from 'react';
import { initialReports } from '../utils/mockData';
import { LineChart, BarChart } from './SVGCharts';
import { FileText, Download, Award, ShieldAlert, Sparkles, CheckCircle } from 'lucide-react';

export const Reports: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const activeReport = useMemo(() => {
    return initialReports.find(r => r.timeframe === timeframe) || initialReports[0];
  }, [timeframe]);

  const handleExport = () => {
    setIsExporting(true);
    setExportSuccess(false);
    
    // Simulate generation and download trigger
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      
      // Auto dismiss success toast after 3 seconds
      setTimeout(() => {
        setExportSuccess(false);
      }, 3000);
      
    }, 1500);
  };

  return (
    <div className="card" style={{ marginBottom: '30px', padding: '24px' }}>
      
      {/* Header and timeframe control */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '16px',
        marginBottom: '24px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={20} color="var(--primary)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Executive Analytics & Reports</h2>
        </div>

        {/* Timeframe selector */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ 
            display: 'flex', 
            backgroundColor: 'var(--neutral-100)', 
            padding: '4px', 
            borderRadius: '10px' 
          }}>
            {[
              { id: 'daily', label: 'Daily' },
              { id: 'weekly', label: 'Weekly' },
              { id: 'monthly', label: 'Monthly' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTimeframe(tab.id as any)}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: timeframe === tab.id ? '#FFFFFF' : 'transparent',
                  color: timeframe === tab.id ? 'var(--primary)' : 'var(--neutral-600)',
                  boxShadow: timeframe === tab.id ? 'var(--shadow-sm)' : 'none'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Export button */}
          <button 
            onClick={handleExport} 
            className="btn btn-primary" 
            disabled={isExporting}
            style={{ padding: '8px 16px', fontSize: '0.8rem', boxShadow: 'none' }}
          >
            {isExporting ? (
              <span>Generating PDF...</span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Download size={14} /> Export PDF
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Export success toast */}
      {exportSuccess && (
        <div style={{ 
          backgroundColor: 'var(--success-light)', 
          border: '1px solid var(--success)', 
          color: 'var(--success-hover)', 
          padding: '10px 16px', 
          borderRadius: 'var(--border-radius-md)', 
          marginBottom: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          fontSize: '0.88rem',
          fontWeight: 600
        }}>
          <CheckCircle size={16} /> 
          PulseSync executive report downloaded successfully.
        </div>
      )}

      {/* Grid: Charts & Analytics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBottom: '24px' }}>
        
        {/* Patient stats line chart */}
        <div>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--neutral-700)', marginBottom: '14px' }}>
            Patient Inflow Load Curve
          </h3>
          <LineChart data={activeReport.patientStats.map(d => ({ label: d.label, value: d.count, predicted: d.predicted }))} />
        </div>

        {/* Resource utilization bar chart */}
        <div>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--neutral-700)', marginBottom: '14px' }}>
            Resource Utilization Index
          </h3>
          <BarChart data={activeReport.resourceUtilization.map(r => ({ label: r.name, value: r.utilization }))} />
        </div>

      </div>

      {/* Grid: Staff scores & burnout risks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBottom: '24px' }}>
        
        {/* Staff performance scores */}
        <div style={{ backgroundColor: 'var(--neutral-50)', padding: '20px', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--neutral-200)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--neutral-700)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={16} color="var(--primary)" /> Staff Performance & Compliance Scores
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeReport.staffPerformance.map((staff, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--neutral-800)' }}>{staff.name}</span>
                <div style={{ display: 'flex', gap: '12px', fontWeight: 700 }}>
                  <span style={{ color: 'var(--primary)' }}>Perf: {staff.score}%</span>
                  <span style={{ color: staff.burnoutIndex > 75 ? 'var(--danger)' : 'var(--neutral-500)' }}>
                    Stress: {staff.burnoutIndex}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Burnout Risk Heatmap / progress lists */}
        <div style={{ backgroundColor: 'var(--neutral-50)', padding: '20px', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--neutral-200)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--neutral-700)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={16} color="var(--danger)" /> Department Burnout Indices
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeReport.burnoutAnalysis.map((b, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, color: 'var(--neutral-700)', marginBottom: '2px' }}>
                  <span>{b.department}</span>
                  <span style={{ color: b.riskPercentage > 75 ? 'var(--danger)' : 'var(--neutral-650)' }}>{b.riskPercentage}%</span>
                </div>
                <div style={{ height: '6px', backgroundColor: 'var(--neutral-200)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${b.riskPercentage}%`, backgroundColor: b.riskPercentage > 75 ? 'var(--danger)' : b.riskPercentage > 55 ? 'var(--warning)' : 'var(--success)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* AI Insights block */}
      <div style={{ 
        backgroundColor: 'var(--primary-light)', 
        border: '1px solid rgba(37,99,235,0.15)', 
        borderRadius: 'var(--border-radius-lg)', 
        padding: '20px' 
      }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          <Sparkles size={16} /> AI Executive Insights
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activeReport.aiInsights.map((insight, idx) => (
            <p key={idx} style={{ fontSize: '0.85rem', color: '#1E293B', lineHeight: '1.5', paddingLeft: '14px', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, top: 0, color: 'var(--primary)', fontWeight: 'bold' }}>•</span>
              {insight}
            </p>
          ))}
        </div>
      </div>

    </div>
  );
};
