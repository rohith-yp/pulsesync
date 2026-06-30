import * as Icons from 'lucide-react';
import type { KPICard } from '../utils/mockData';
import { MiniSparkLine } from './SVGCharts';

interface KPISectionProps {
  kpis: KPICard[];
}

export const KPISection = ({ kpis }: KPISectionProps) => {
  // Helper to dynamically render Lucide Icons by name
  const renderIcon = (name: string, color: string) => {
    const LucideIcon = (Icons as any)[name];
    if (!LucideIcon) return <Icons.Activity size={22} color={color} />;
    return <LucideIcon size={22} color={color} />;
  };

  const getKPIColors = (id: string, isPositive: boolean) => {
    if (id === 'risk_score') {
      return {
        bg: '#FEE2E2',
        stroke: '#EF4444',
        text: '#EF4444'
      };
    }
    if (id === 'icu_occ') {
      return {
        bg: '#FFE4E6',
        stroke: '#F43F5E',
        text: '#F43F5E'
      };
    }
    return isPositive 
      ? { bg: '#D1FAE5', stroke: '#10B981', text: '#10B981' }
      : { bg: '#FFE4E6', stroke: '#EF4444', text: '#EF4444' };
  };

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
      gap: '20px',
      marginBottom: '30px'
    }}>
      {kpis.map((kpi) => {
        const colors = getKPIColors(kpi.id, kpi.isPositive);
        
        return (
          <div 
            key={kpi.id} 
            className="card"
            style={{ 
              padding: '20px', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              height: '150px'
            }}
          >
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--neutral-500)' }}>
                {kpi.title}
              </span>
              <div style={{ 
                width: '38px', 
                height: '38px', 
                borderRadius: '8px', 
                backgroundColor: colors.bg, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                {renderIcon(kpi.iconName, colors.stroke)}
              </div>
            </div>

            {/* Value & Sparkline */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--neutral-900)', lineHeight: 1 }}>
                  {kpi.value}
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  color: colors.text, 
                  marginTop: '6px',
                  whiteSpace: 'nowrap'
                }}>
                  {kpi.change}
                </div>
              </div>
              
              <div style={{ paddingBottom: '4px' }}>
                <MiniSparkLine data={kpi.trend} color={colors.stroke} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
