import type { BottleneckInfo } from '../utils/mockData';
import { Clock, ArrowRight } from 'lucide-react';

interface BottleneckPredictionProps {
  bottlenecks: BottleneckInfo[];
}

export const BottleneckPrediction = ({ bottlenecks }: BottleneckPredictionProps) => {

  const getRiskBadge = (score: number) => {
    let color = 'var(--success)';
    let bg = 'var(--success-light)';
    let text = 'Stable';

    if (score >= 85) {
      color = 'var(--danger)';
      bg = 'var(--danger-light)';
      text = 'Critical';
    } else if (score >= 65) {
      color = '#F97316'; // Orange
      bg = 'rgba(249, 115, 22, 0.1)';
      text = 'Elevated';
    } else if (score >= 45) {
      color = 'var(--warning)';
      bg = 'var(--warning-light)';
      text = 'Moderate';
    }

    return (
      <span style={{ 
        fontSize: '0.72rem', 
        fontWeight: 700, 
        backgroundColor: bg, 
        color: color, 
        padding: '3px 8px', 
        borderRadius: '6px',
        textTransform: 'uppercase'
      }}>
        {text} ({score})
      </span>
    );
  };

  return (
    <div className="card" style={{ marginBottom: '30px', padding: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <Clock size={20} color="var(--primary)" />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Departmental Bottleneck & Delay Forecast</h2>
      </div>

      <div className="table-container" style={{ border: '1px solid var(--neutral-200)', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--neutral-50)', borderBottom: '2px solid var(--neutral-200)', color: 'var(--neutral-600)', fontWeight: 700 }}>
              <th style={{ padding: '14px 16px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Department</th>
              <th style={{ padding: '14px 16px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Capacity</th>
              <th style={{ padding: '14px 16px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Projected Census (45m)</th>
              <th style={{ padding: '14px 16px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Wait Time</th>
              <th style={{ padding: '14px 16px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Predicted Wait Time</th>
              <th style={{ padding: '14px 16px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Overload Risk</th>
              <th style={{ padding: '14px 16px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Tactical Mitigations</th>
            </tr>
          </thead>
          <tbody>
            {bottlenecks.map((b, idx) => (
              <tr 
                key={idx} 
                style={{ 
                  borderBottom: '1px solid var(--neutral-100)',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--neutral-50)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '16px', fontWeight: 700, color: 'var(--neutral-900)' }}>
                  {b.department}
                </td>
                <td style={{ padding: '16px', color: 'var(--neutral-600)' }}>
                  {b.currentCapacity} beds
                </td>
                <td style={{ padding: '16px', fontWeight: 600 }}>
                  <span style={{ color: b.futureCapacity > b.currentCapacity ? 'var(--danger)' : 'var(--neutral-800)' }}>
                    {b.futureCapacity} beds
                  </span>
                </td>
                <td style={{ padding: '16px', color: 'var(--neutral-600)' }}>
                  {b.currentWaitingTime} mins
                </td>
                <td style={{ padding: '16px', fontWeight: 700, color: b.predictedWaitingTime > b.currentWaitingTime ? 'var(--danger)' : 'var(--success)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {b.predictedWaitingTime} mins
                    {b.predictedWaitingTime > b.currentWaitingTime && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--danger)', display: 'inline-flex', alignItems: 'center' }}>
                        <ArrowRight size={10} /> +{b.predictedWaitingTime - b.currentWaitingTime}m
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  {getRiskBadge(b.riskScore)}
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {b.aiSuggestions.map((sug, sIdx) => (
                      <span 
                        key={sIdx} 
                        style={{ 
                          fontSize: '0.78rem', 
                          color: 'var(--neutral-600)', 
                          backgroundColor: 'var(--neutral-100)', 
                          padding: '2px 8px', 
                          borderRadius: '4px',
                          alignSelf: 'flex-start'
                        }}
                      >
                        ⚡ {sug}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
