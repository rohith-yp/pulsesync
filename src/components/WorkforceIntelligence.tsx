import { useState } from 'react';
import type { Doctor } from '../utils/mockData';
import { Users, Clock, Activity } from 'lucide-react';

interface WorkforceIntelligenceProps {
  doctors: Doctor[];
  onTriggerMitigation?: (doctorId: string) => void;
}

export const WorkforceIntelligence = ({ 
  doctors,
  onTriggerMitigation 
}: WorkforceIntelligenceProps) => {
  const [selectedDept, setSelectedDept] = useState<string>('all');

  const departmentsList = ['all', 'Emergency', 'ICU', 'General Ward', 'Radiology', 'Operation Theatre'];

  const filteredDoctors = doctors.filter(doc => 
    selectedDept === 'all' || doc.department === selectedDept
  );

  const getRiskColors = (status: 'stable' | 'warning' | 'critical') => {
    switch (status) {
      case 'critical':
        return {
          border: 'var(--danger)',
          bg: 'var(--danger-light)',
          text: 'var(--danger)',
          tagBg: 'rgba(239, 68, 68, 0.1)'
        };
      case 'warning':
        return {
          border: 'var(--warning)',
          bg: 'var(--warning-light)',
          text: '#B45309',
          tagBg: 'rgba(245, 158, 11, 0.1)'
        };
      default:
        return {
          border: 'var(--success)',
          bg: 'var(--success-light)',
          text: 'var(--success)',
          tagBg: 'rgba(16, 185, 129, 0.1)'
        };
    }
  };

  return (
    <div style={{ marginBottom: '30px' }}>
      
      {/* Header and filters */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '16px',
        marginBottom: '20px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={20} color="var(--primary)" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Workforce Stress & Burnout Intelligence</h2>
        </div>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {departmentsList.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '8px',
                border: selectedDept === dept ? '1px solid var(--primary)' : '1px solid var(--neutral-300)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: selectedDept === dept ? 'var(--primary-light)' : '#FFFFFF',
                color: selectedDept === dept ? 'var(--primary)' : 'var(--neutral-600)',
              }}
            >
              {dept === 'all' ? 'All Departments' : dept}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Doctor Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '20px' 
      }}>
        {filteredDoctors.map(doc => {
          const colors = getRiskColors(doc.status);
          
          return (
            <div 
              key={doc.id}
              className="card"
              style={{ 
                borderTop: `6px solid ${colors.border}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '20px',
                backgroundColor: '#FFFFFF',
                boxShadow: doc.status === 'critical' ? '0 10px 20px rgba(239,68,68,0.06)' : 'var(--shadow-premium)'
              }}
            >
              <div>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--neutral-900)' }}>{doc.name}</h3>
                    <span style={{ fontSize: '0.78rem', color: 'var(--neutral-500)', fontWeight: 600 }}>
                      {doc.department} Rotation
                    </span>
                  </div>

                  <span style={{ 
                    fontSize: '0.72rem', 
                    fontWeight: 700, 
                    backgroundColor: colors.tagBg, 
                    color: colors.text,
                    padding: '3px 8px', 
                    borderRadius: '6px',
                    textTransform: 'uppercase'
                  }}>
                    {doc.status}
                  </span>
                </div>

                {/* Stats block */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--neutral-600)' }}>
                    <Activity size={14} color="var(--neutral-400)" />
                    <span>Patients: <strong>{doc.patientsAssigned}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--neutral-600)' }}>
                    <Clock size={14} color="var(--neutral-400)" />
                    <span>Shift: <strong>{doc.hoursWorked}h</strong></span>
                  </div>
                </div>

                {/* Stress & Burnout Bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-500)', marginBottom: '2px' }}>
                      <span>Stress Score</span>
                      <span>{doc.stressScore}%</span>
                    </div>
                    <div style={{ height: '5px', backgroundColor: 'var(--neutral-200)', borderRadius: '2.5px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${doc.stressScore}%`, backgroundColor: doc.stressScore > 80 ? 'var(--danger)' : doc.stressScore > 60 ? 'var(--warning)' : 'var(--success)' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-500)', marginBottom: '2px' }}>
                      <span>Burnout Risk Probability</span>
                      <span style={{ fontWeight: 700, color: colors.text }}>{doc.burnoutProbability}%</span>
                    </div>
                    <div style={{ height: '5px', backgroundColor: 'var(--neutral-200)', borderRadius: '2.5px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${doc.burnoutProbability}%`, backgroundColor: colors.border }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Recommendation Footer */}
              <div style={{ 
                marginTop: '10px',
                borderTop: '1px dashed var(--neutral-200)', 
                paddingTop: '12px',
                backgroundColor: 'var(--neutral-50)',
                margin: '12px -20px -20px',
                padding: '12px 20px',
                borderRadius: '0 0 var(--border-radius-lg) var(--border-radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--neutral-600)', lineHeight: '1.4' }}>
                  <strong style={{ color: 'var(--primary)', textTransform: 'uppercase', fontSize: '0.7rem', display: 'block', marginBottom: '2px' }}>
                    🤖 AI Action Recommendation
                  </strong>
                  {doc.aiRecommendation}
                </div>

                {doc.status !== 'stable' && onTriggerMitigation && (
                  <button
                    onClick={() => onTriggerMitigation(doc.id)}
                    className="btn btn-secondary"
                    style={{ 
                      padding: '6px 12px', 
                      fontSize: '0.75rem', 
                      alignSelf: 'flex-start',
                      marginTop: '4px',
                      backgroundColor: '#FFFFFF',
                      borderColor: colors.border,
                      color: colors.text,
                      boxShadow: 'none'
                    }}
                  >
                    Reduce Workload
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
