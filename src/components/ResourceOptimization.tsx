import type { ResourceItem } from '../utils/mockData';
import { Layers, RefreshCw, Zap, CheckCircle } from 'lucide-react';

interface ResourceOptimizationProps {
  resources: ResourceItem[];
  onExecuteRedistribution?: (id: string) => void;
}

export const ResourceOptimization = ({
  resources,
  onExecuteRedistribution
}: ResourceOptimizationProps) => {

  const getStatusColors = (status: 'critical' | 'warning' | 'stable') => {
    switch (status) {
      case 'critical':
        return {
          bg: 'var(--danger-light)',
          stroke: 'var(--danger)',
          text: 'var(--danger)'
        };
      case 'warning':
        return {
          bg: 'var(--warning-light)',
          stroke: 'var(--warning)',
          text: '#B45309'
        };
      default:
        return {
          bg: 'var(--success-light)',
          stroke: 'var(--success)',
          text: 'var(--success)'
        };
    }
  };

  return (
    <div className="card" style={{ marginBottom: '30px', padding: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <Layers size={20} color="var(--primary)" />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Resource Optimization Engine</h2>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '30px' 
      }}>
        
        {/* Resource levels listing */}
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--neutral-700)', marginBottom: '16px' }}>
            Resource Status & Inventory Levels
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {resources.map(res => {
              const colors = getStatusColors(res.status);
              const utilizationPercent = Math.round(((res.total - res.available) / res.total) * 100);

              return (
                <div key={res.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--neutral-800)' }}>{res.name}</span>
                    <span style={{ 
                      fontWeight: 700, 
                      backgroundColor: colors.bg, 
                      color: colors.text,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.78rem'
                    }}>
                      {res.available} / {res.total} {res.unit} available
                    </span>
                  </div>
                  
                  {/* Progress bar representing utilization */}
                  <div style={{ height: '6px', backgroundColor: 'var(--neutral-200)', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${utilizationPercent}%`, 
                        backgroundColor: colors.stroke,
                        borderRadius: '3px',
                        transition: 'width 0.5s ease' 
                      }} 
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--neutral-400)', fontWeight: 500 }}>
                    <span>0% utilized</span>
                    <span>{utilizationPercent}% utilized</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI redistribution advisory panel */}
        <div style={{ 
          backgroundColor: 'var(--neutral-50)', 
          border: '1px solid var(--neutral-200)', 
          borderRadius: 'var(--border-radius-lg)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '16px' }}>
              <Zap size={18} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                AI Redistribution Advisor
              </h3>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--neutral-600)', marginBottom: '16px', lineHeight: '1.4' }}>
              PulseSync actively monitors departmental usage logs. The items below are flagged for reallocation to prevent wing bottleneck blocks.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {resources.filter(r => r.status !== 'stable' && r.aiRecommendation).map(res => (
                <div 
                  key={res.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--neutral-200)',
                    borderRadius: 'var(--border-radius-md)',
                    padding: '12px',
                    fontSize: '0.82rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ color: res.status === 'critical' ? 'var(--danger)' : '#B45309' }}>
                      {res.name} Redistribution Alert
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--neutral-400)', fontWeight: 600 }}>Active</span>
                  </div>
                  <div style={{ color: 'var(--neutral-600)', lineHeight: '1.3' }}>
                    {res.aiRecommendation}
                  </div>
                  
                  {onExecuteRedistribution && (
                    <button
                      onClick={() => onExecuteRedistribution(res.id)}
                      className="btn btn-secondary"
                      style={{
                        marginTop: '8px',
                        padding: '4px 10px',
                        fontSize: '0.72rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        borderColor: 'transparent',
                        boxShadow: 'none'
                      }}
                    >
                      <RefreshCw size={10} /> Execute Transfer Plan
                    </button>
                  )}
                </div>
              ))}

              {resources.filter(r => r.status !== 'stable').length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px 0', textAlign: 'center' }}>
                  <CheckCircle size={28} color="var(--success)" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--neutral-500)' }}>
                    Inventory Allocations Optimal
                  </span>
                </div>
              )}
            </div>
          </div>

          <div style={{ 
            marginTop: '20px',
            borderTop: '1px solid var(--neutral-200)', 
            paddingTop: '12px', 
            fontSize: '0.75rem', 
            color: 'var(--neutral-400)',
            textAlign: 'center'
          }}>
            Redistributions are calculated every 60 seconds based on triage arrival flow rates.
          </div>
        </div>

      </div>

    </div>
  );
};
