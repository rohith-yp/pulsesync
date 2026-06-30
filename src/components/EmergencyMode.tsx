import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldCheck, Siren, Users, HeartPulse, Truck, Clock, Zap, Loader } from 'lucide-react';
import { groqChat, SYSTEM_PROMPTS } from '../utils/groqClient';

interface EmergencyModeProps {
  onTriggerEmergency: (type: 'accident' | 'outbreak' | 'mass_casualty' | 'fire' | 'flood') => any;
}

export const EmergencyMode: React.FC<EmergencyModeProps> = ({ onTriggerEmergency }) => {
  const [selectedScenario, setSelectedScenario] = useState<'accident' | 'outbreak' | 'mass_casualty' | 'fire' | 'flood'>('accident');
  const [activeCrisis, setActiveCrisis] = useState<any | null>(null);
  const [isAlerting, setIsAlerting] = useState(false);
  const [aiChecklist, setAiChecklist] = useState<string[]>([]);

  const handleTrigger = async () => {
    setIsAlerting(true);
    setActiveCrisis(null);
    try {
      const results = onTriggerEmergency(selectedScenario);
      
      // Get AI recommendations from Groq
      const contextPrompt = `Scenario: ${selectedScenario.replace('_', ' ')}
Incident description: ${results.message}
Doctors needed: ${results.doctorsNeeded}
Nurses needed: ${results.nursesNeeded}
Beds needed: ${results.bedsNeeded}
ICU needed: ${results.icuNeeded}
Est recovery window: ${results.recoveryTime}

Generate 3 precise operational tactical checklist steps for immediate dispatch.`;

      const response = await groqChat([
        { role: 'system', content: SYSTEM_PROMPTS.crisisNarrative },
        { role: 'user', content: contextPrompt }
      ]);

      const steps = response
        .split('\n')
        .map(line => line.replace(/^\d+[\.\-\)]\s*/, '').replace(/^•\s*/, '').trim())
        .filter(line => line.length > 0)
        .slice(0, 3);

      setAiChecklist(steps.length > 0 ? steps : [
        "Reroute incoming minor ER cases to suburban outpatient clinics.",
        "Expedite stable ICU discharges to General Wards.",
        "Initiate emergency shift pagers for off-duty clinicians."
      ]);
      setActiveCrisis(results);
    } catch {
      // Fallback
      const results = onTriggerEmergency(selectedScenario);
      setAiChecklist([
        "Reroute incoming minor ER cases to suburban outpatient clinics.",
        "Expedite stable ICU discharges to General Wards.",
        "Initiate emergency shift pagers for off-duty clinicians."
      ]);
      setActiveCrisis(results);
    } finally {
      setIsAlerting(false);
    }
  };

  const handleDeactivate = () => {
    setActiveCrisis(null);
    setAiChecklist([]);
  };

  const scenarios = [
    { id: 'accident', label: 'Road Accident', desc: '15-vehicle highway pileup. Trauma alert.' },
    { id: 'outbreak', label: 'Disease Outbreak', desc: 'University cafeteria toxin outbreak.' },
    { id: 'mass_casualty', label: 'Mass Casualty', desc: 'Chemical facility explosion. Severe trauma.' },
    { id: 'fire', label: 'Fire Incident', desc: 'High-rise residential fire. Inhalation & burns.' },
    { id: 'flood', label: 'Flood Surge', desc: 'Waterborne and orthopaedic trauma.' }
  ];

  return (
    <div className="card" style={{ 
      marginBottom: '30px', 
      padding: '24px', 
      border: activeCrisis ? '1.5px solid var(--danger)' : '1px solid var(--neutral-200)',
      background: activeCrisis 
        ? 'linear-gradient(180deg, #FFF5F5 0%, #FFFFFF 100%)' 
        : '#FFFFFF',
      transition: 'all 0.3s ease'
    }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Siren size={20} color={activeCrisis ? 'var(--danger)' : 'var(--primary)'} className={activeCrisis ? 'pulse-danger' : ''} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>One-Click Emergency Response Mode</h2>
        </div>

        {activeCrisis && (
          <span style={{ 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            backgroundColor: 'var(--danger)', 
            color: '#FFFFFF', 
            padding: '4px 12px', 
            borderRadius: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Active Simulation Running
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!activeCrisis ? (
          <motion.div
            key="config"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p style={{ fontSize: '0.88rem', color: 'var(--neutral-600)', marginBottom: '20px', lineHeight: '1.5' }}>
              Instantly simulate incoming external mass casualties. PulseSync AI will immediately calculate workforce and bed deficits, reserve diagnostic corridors, and generate response checklists.
            </p>

            {/* Grid of Scenarios */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '12px', 
              marginBottom: '20px' 
            }}>
              {scenarios.map(sc => (
                <div
                  key={sc.id}
                  onClick={() => setSelectedScenario(sc.id as any)}
                  style={{
                    border: selectedScenario === sc.id ? '2px solid var(--danger)' : '1px solid var(--neutral-200)',
                    backgroundColor: selectedScenario === sc.id ? '#FFF5F5' : '#FFFFFF',
                    borderRadius: '8px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: selectedScenario === sc.id ? 'var(--danger)' : 'var(--neutral-900)', margin: 0 }}>
                    {sc.label}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--neutral-500)', marginTop: '4px', margin: 0 }}>
                    {sc.desc}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={handleTrigger}
              className="btn btn-primary"
              disabled={isAlerting}
              style={{
                backgroundColor: 'var(--danger)',
                borderColor: 'var(--danger)',
                color: '#FFFFFF',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.25)',
                width: '100%',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isAlerting ? (
                <>
                  <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Synthesizing Groq AI Emergency Protocol...</span>
                </>
              ) : 'Engage Emergency Simulation'}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Active Alert Banner */}
            <div style={{ 
              backgroundColor: 'var(--danger-light)', 
              border: '1px solid var(--danger)', 
              borderRadius: '8px', 
              padding: '16px', 
              marginBottom: '24px',
              display: 'flex',
              gap: '12px'
            }}>
              <AlertTriangle size={24} color="var(--danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                  Critical Dispatch Signal Intercepted
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#991B1B', marginTop: '4px', fontWeight: 600, margin: 0 }}>
                  {activeCrisis.message}
                </p>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--neutral-200)', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Users size={24} color="var(--primary)" />
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-500)' }}>Extra Clinicians Needed</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
                    +{activeCrisis.doctorsNeeded} D / +{activeCrisis.nursesNeeded} N
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--neutral-200)', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <HeartPulse size={24} color="var(--danger)" />
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-500)' }}>Beds & ICU Needed</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
                    {activeCrisis.bedsNeeded} Gen / {activeCrisis.icuNeeded} ICU
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--neutral-200)', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Truck size={24} color="var(--success)" />
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-500)' }}>Ambulance Mobilization</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
                    {activeCrisis.ambulanceAllocation} vehicles
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--neutral-200)', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Clock size={24} color="var(--warning)" />
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-500)' }}>Est. Recovery Window</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
                    {activeCrisis.recoveryTime}
                  </div>
                </div>
              </div>

            </div>

            {/* AI Logistics Checklist */}
            <div style={{ 
              backgroundColor: '#FEF2F2', 
              border: '1px solid #FCA5A5', 
              borderRadius: '8px', 
              padding: '20px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Zap size={16} color="var(--danger)" />
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#991B1B', margin: 0 }}>
                  Groq AI Tactical Crisis Checklist
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {aiChecklist.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.85rem' }}>
                    <ShieldCheck size={16} color="#DC2626" />
                    <span style={{ color: '#991B1B', fontWeight: 500 }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Footer */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={handleDeactivate} 
                className="btn btn-secondary"
                style={{ flex: 1, padding: '12px' }}
              >
                Reset / Deactivate Crisis Mode
              </button>
              <button 
                onClick={() => alert('Emergency alert broadcast sent to all clinical pagers.')}
                className="btn btn-primary"
                style={{ flex: 1, padding: '12px', backgroundColor: 'var(--danger)', borderColor: 'var(--danger)', boxShadow: 'none' }}
              >
                Broadcast Pager Alert
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
