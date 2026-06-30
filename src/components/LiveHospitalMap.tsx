import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Department } from '../utils/mockData';
import { groqChat, SYSTEM_PROMPTS } from '../utils/groqClient';
import { 
  Lock, Users, RefreshCw, BarChart2, ShieldCheck, Siren, LogOut, Activity,
  Loader, FileText, Zap, Clock, BrainCircuit, AlertTriangle, CheckCircle2,
  Radio, TrendingUp, AlertCircle
} from 'lucide-react';

interface LiveHospitalMapProps {
  departments: Department[];
  userRole?: string;
}

interface ArchitecturalRoom {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  icon: string;
  capacity: number;
  beds: { x: number; y: number; occupied: boolean }[];
  description: string;
}

interface SimulationEvent {
  id: string;
  timestamp: string;
  action: string;
  status: 'pending' | 'success' | 'error';
  severity: 'info' | 'warning' | 'critical';
}

interface AiReport {
  id: string;
  action: string;
  timestamp: string;
  content: string;
  status: 'success' | 'error';
}

// Coordinate scale: 400 x 700
const ARCH_ROOMS: ArchitecturalRoom[] = [
  {
    id: 'icu_a',
    name: 'ICU Sector A',
    type: 'critical',
    x: 30, y: 70, w: 140, h: 150,
    icon: '💗',
    capacity: 2,
    beds: [
      { x: 55, y: 100, occupied: true },
      { x: 115, y: 100, occupied: true }
    ],
    description: 'Intensive care ward with advanced patient physiological telemetry.'
  },
  {
    id: 'icu_b',
    name: 'ICU Sector B',
    type: 'critical',
    x: 230, y: 70, w: 140, h: 150,
    icon: '💗',
    capacity: 2,
    beds: [
      { x: 255, y: 100, occupied: true },
      { x: 335, y: 100, occupied: false }
    ],
    description: 'Secondary intensive care sector with overflow capacity.'
  },
  {
    id: 'scrub_a',
    name: 'Scrub Bay A',
    type: 'support',
    x: 30, y: 225, w: 80, h: 105,
    icon: '🧤',
    capacity: 0,
    beds: [],
    description: 'Sterile scrub zone for surgical prep and gowning.'
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy Unit',
    type: 'support',
    x: 230, y: 225, w: 140, h: 130,
    icon: '💊',
    capacity: 0,
    beds: [],
    description: 'Medication dispensary with smart-bin tracking for pharma logistics.'
  },
  {
    id: 'scrub_b',
    name: 'Scrub Bay B',
    type: 'support',
    x: 30, y: 335, w: 80, h: 105,
    icon: '🧤',
    capacity: 0,
    beds: [],
    description: 'Auxiliary scrub station for emergency surgical teams.'
  },
  {
    id: 'ot',
    name: 'Operating Theatre',
    type: 'critical',
    x: 25, y: 455, w: 163, h: 225,
    icon: '⚕️',
    capacity: 1,
    beds: [
      { x: 100, y: 520, occupied: true }
    ],
    description: 'Main surgical theatre with AI-guided instrumentation tracking.'
  }
];

export const LiveHospitalMap = ({ departments, userRole }: LiveHospitalMapProps) => {
  const isDeptHead = userRole === 'dept_head';

  if (departments.length === 0) { /* no-op */ }

  // Simulator states
  const [selectedId, setSelectedId] = useState<string>('icu_a');
  const [isEvacuating, setIsEvacuating] = useState<boolean>(false);
  const [isLockedDown, setIsLockedDown] = useState<boolean>(false);
  const [divertActive, setDivertActive] = useState<boolean>(false);
  const [staffDeployed, setStaffDeployed] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeAction, setActiveAction] = useState<string>('');

  // Extended action states
  const [codeBlueActive, setCodeBlueActive] = useState<boolean>(false);
  const [rapidResponseActive, setRapidResponseActive] = useState<boolean>(false);
  const [bloodBankRequested, setBloodBankRequested] = useState<boolean>(false);
  const [zoneIsolated, setZoneIsolated] = useState<boolean>(false);
  const [overflowWardOpen, setOverflowWardOpen] = useState<boolean>(false);
  const [traumaTeamSummoned, setTraumaTeamSummoned] = useState<boolean>(false);
  const [ventilatorsRequested, setVentilatorsRequested] = useState<boolean>(false);
  const [massCasualtyActive, setMassCasualtyActive] = useState<boolean>(false);

  // AI + Event Log states
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiReports, setAiReports] = useState<AiReport[]>([]);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [simulationEvents, setSimulationEvents] = useState<SimulationEvent[]>([]);

  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [simulationEvents]);

  // Listen for AI Alert Panel actions and pipe them into the simulation event log
  useEffect(() => {
    const handler = (e: Event) => {
      const msg = (e as CustomEvent<string>).detail;
      if (!msg) return;
      const now = new Date();
      const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      // Determine severity from message prefix
      const severity: SimulationEvent['severity'] =
        msg.startsWith('🚨') || msg.startsWith('✅') ? 'critical'
        : msg.startsWith('🔔') || msg.startsWith('☑️') ? 'warning'
        : 'info';
      const event: SimulationEvent = {
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        timestamp,
        action: msg,
        status: 'success',
        severity
      };
      setSimulationEvents(prev => [...prev.slice(-29), event]);
    };
    window.addEventListener('alert-panel-action', handler);
    return () => window.removeEventListener('alert-panel-action', handler);
  }, []);


  // Telemetry
  const [telemetry, setTelemetry] = useState({
    icuCount: 3,
    otCount: 1,
    overallOccupancy: 83,
    activeStaff: 8,
    responseTime: 38,
    bloodUnits: 42,
    ventilatorsAvail: 7,
    criticalAlerts: 2,
    isolatedZones: 0
  });

  // Generate AI Report via Groq
  const generateAiReport = async (actionName: string, context: string): Promise<string> => {
    try {
      const response = await groqChat([
        {
          role: 'system',
          content: `${SYSTEM_PROMPTS.crisisNarrative}
You are generating a LIVE SIMULATION TACTICAL REPORT for a hospital floor management dashboard.
The hospital administrator just executed a tactical action on the floor plan.

Format your report EXACTLY as follows (use these exact emoji headers):
📊 SIMULATION STATUS: [one line status of the executed action]

⚡ IMPACT ANALYSIS:
• [specific impact point 1 with numbers]
• [specific impact point 2 with numbers]
• [specific impact point 3 with numbers]

✅ NEXT RECOMMENDED STEPS:
1. [concrete action with timeframe]
2. [concrete action with timeframe]

Keep entire response under 160 words. Be specific with departments and metrics.`
        },
        {
          role: 'user',
          content: `Action executed: "${actionName}"
Current hospital floor state: ${context}
Generate the live simulation tactical report now.`
        }
      ]);
      return response;
    } catch (err) {
      return `📊 SIMULATION STATUS: ${actionName} executed successfully on hospital floor.\n\n⚡ IMPACT ANALYSIS:\n• Floor telemetry updated across all monitored zones\n• Connected department systems synchronized in real-time\n• Staff notification alerts dispatched to all on-duty personnel\n\n✅ NEXT RECOMMENDED STEPS:\n1. Monitor ICU and OT zone response metrics for the next 15 minutes\n2. Review cross-department staff allocation and adjust shift coverage`;
    }
  };

  // Add event to feed
  const addEvent = (action: string, status: SimulationEvent['status'], severity: SimulationEvent['severity']) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const event: SimulationEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp, action, status, severity
    };
    setSimulationEvents(prev => [...prev.slice(-29), event]);
  };

  // Main dispatch action handler
  const runDispatchAction = async (actionKey: string, actionName: string) => {
    setIsSimulating(true);
    setActiveAction(actionKey);
    setAiLoading(true);

    addEvent(`⏳ Initiating: ${actionName}`, 'pending', 'info');

    const startEvent = new CustomEvent('add-dashboard-notification', {
      detail: `TACTICAL: Initiating live simulation of '${actionName}'.`
    });
    window.dispatchEvent(startEvent);

    await new Promise(resolve => setTimeout(resolve, 800));

    let contextStr = '';

    if (actionKey === 'evacuate') {
      setIsEvacuating(true);
      setDivertActive(true);
      setTelemetry(t => ({ ...t, icuCount: 0, otCount: 0, overallOccupancy: 0, responseTime: 5 }));
      contextStr = `Floor fully evacuated. ICU patients: 0 (all transferred), OT: halted, Occupancy: 0%, Emergency response time: 5s. Ambulance diversion also activated.`;
      addEvent('🚨 Full floor evacuation executed — all zones cleared', 'success', 'critical');
    } else if (actionKey === 'lockdown') {
      const nextLock = !isLockedDown;
      setIsLockedDown(nextLock);
      contextStr = nextLock
        ? `Facility secured under lockdown. All access doors sealed. ICU patients: ${telemetry.icuCount}, Active staff: ${telemetry.activeStaff}, Occupancy: ${telemetry.overallOccupancy}%.`
        : `Lockdown lifted. Normal operations resumed. Occupancy: ${telemetry.overallOccupancy}%, Staff: ${telemetry.activeStaff}.`;
      addEvent(nextLock ? '🔒 Secure lockdown engaged across all zones' : '🔓 Lockdown deactivated — normal ops resumed', 'success', nextLock ? 'critical' : 'info');
    } else if (actionKey === 'divert') {
      const nextDivert = !divertActive;
      setDivertActive(nextDivert);
      const newOcc = nextDivert ? Math.max(30, telemetry.overallOccupancy - 25) : 83;
      setTelemetry(t => ({ ...t, overallOccupancy: newOcc }));
      contextStr = nextDivert
        ? `Ambulance diversion active. Inbound trauma rerouted to partner hospitals. Occupancy reduced to ${newOcc}%. Staff: ${telemetry.activeStaff}.`
        : `Diversion cancelled. Normal patient inflow resumed. Occupancy: ${newOcc}%, Staff: ${telemetry.activeStaff}.`;
      addEvent(nextDivert ? '🚑 Ambulance diversion deployed — inflow reduced by 25%' : '🚑 Diversion cancelled — normal inbound flow', 'success', 'warning');
    } else if (actionKey === 'staff') {
      const nextStaff = !staffDeployed;
      setStaffDeployed(nextStaff);
      const newStaff = nextStaff ? telemetry.activeStaff + 4 : 8;
      const newResponse = nextStaff ? Math.max(10, telemetry.responseTime - 18) : 38;
      setTelemetry(t => ({ ...t, activeStaff: newStaff, responseTime: newResponse }));
      contextStr = nextStaff
        ? `Backup clinical staff deployed. Total on-duty: ${newStaff} MD/RN. Response time improved to ${newResponse}s. Occupancy: ${telemetry.overallOccupancy}%.`
        : `Backup staff recalled. On-duty staff: ${newStaff} MD/RN. Response time: ${newResponse}s.`;
      addEvent(nextStaff ? `👥 +4 backup staff deployed (${newStaff} MD/RN total on floor)` : '👥 Backup staff recalled to standby pool', 'success', 'warning');

    // ── CLINICAL ACTIONS ────────────────────────────────────────────────
    } else if (actionKey === 'code_blue') {
      const next = !codeBlueActive;
      setCodeBlueActive(next);
      setTelemetry(t => ({ ...t, criticalAlerts: next ? t.criticalAlerts + 1 : Math.max(0, t.criticalAlerts - 1), responseTime: next ? Math.max(8, t.responseTime - 12) : 38 }));
      contextStr = next
        ? `Code Blue activated. All crash carts deployed to ICU A. Resuscitation team en route. Response time cut to ${Math.max(8, telemetry.responseTime - 12)}s. Critical alerts: ${telemetry.criticalAlerts + 1}.`
        : `Code Blue resolved. Patient stabilized. Normal monitoring resumed. Response time: 38s.`;
      addEvent(next ? '🔵 CODE BLUE — Crash team dispatched to ICU Sector A' : '🔵 Code Blue resolved — patient stabilized', 'success', next ? 'critical' : 'info');

    } else if (actionKey === 'rapid_response') {
      const next = !rapidResponseActive;
      setRapidResponseActive(next);
      setTelemetry(t => ({ ...t, activeStaff: next ? t.activeStaff + 2 : Math.max(8, t.activeStaff - 2), responseTime: next ? Math.max(12, t.responseTime - 8) : 38 }));
      contextStr = next
        ? `Rapid Response Team activated. 2 additional intensivists deployed to floor. Response time reduced. Monitoring deteriorating patients in ICU B and Pharmacy ward.`
        : `Rapid Response Team stood down. Situation stable. Staff returned to baseline rotation.`;
      addEvent(next ? '⚡ Rapid Response Team activated — 2 intensivists on floor' : '⚡ Rapid Response Team stood down', 'success', next ? 'warning' : 'info');

    } else if (actionKey === 'trauma_team') {
      const next = !traumaTeamSummoned;
      setTraumaTeamSummoned(next);
      setTelemetry(t => ({ ...t, activeStaff: next ? t.activeStaff + 3 : Math.max(8, t.activeStaff - 3), otCount: next ? t.otCount + 1 : Math.max(0, t.otCount - 1) }));
      contextStr = next
        ? `Trauma team summoned. 3 trauma surgeons inbound. OT queue increased by 1 (now ${telemetry.otCount + 1} active cases). Staff on duty: ${telemetry.activeStaff + 3}.`
        : `Trauma team stood down. OT queue normalized. Staff returned to rotation.`;
      addEvent(next ? '🩺 Trauma team summoned — 3 surgeons inbound to OT' : '🩺 Trauma team stood down', 'success', next ? 'warning' : 'info');

    // ── RESOURCE ACTIONS ────────────────────────────────────────────────
    } else if (actionKey === 'blood_bank') {
      const next = !bloodBankRequested;
      setBloodBankRequested(next);
      setTelemetry(t => ({ ...t, bloodUnits: next ? t.bloodUnits + 20 : Math.max(10, t.bloodUnits - 20) }));
      contextStr = next
        ? `Emergency blood bank request fulfilled. +20 units cross-matched and delivered. Blood units available: ${telemetry.bloodUnits + 20}. Pharmacy unit alerted for coagulation factors.`
        : `Blood bank supply cycle complete. Units returned to standard inventory levels. Available: ${Math.max(10, telemetry.bloodUnits - 20)}.`;
      addEvent(next ? `🩸 Emergency blood bank supply requested (+20 units)` : '🩸 Blood bank supply cycle complete', 'success', 'warning');

    } else if (actionKey === 'ventilators') {
      const next = !ventilatorsRequested;
      setVentilatorsRequested(next);
      setTelemetry(t => ({ ...t, ventilatorsAvail: next ? t.ventilatorsAvail + 4 : Math.max(3, t.ventilatorsAvail - 4) }));
      contextStr = next
        ? `4 additional ventilators requisitioned from central stores and deployed to ICU sectors. Total available: ${telemetry.ventilatorsAvail + 4}. Biomedical team alerted.`
        : `Ventilator request fulfilled. Units redistributed. Available: ${Math.max(3, telemetry.ventilatorsAvail - 4)}.`;
      addEvent(next ? `🫁 +4 ventilators requested and deployed to ICU sectors` : '🫁 Ventilator request closed', 'success', 'warning');

    } else if (actionKey === 'overflow_ward') {
      const next = !overflowWardOpen;
      setOverflowWardOpen(next);
      setTelemetry(t => ({ ...t, overallOccupancy: next ? Math.max(40, t.overallOccupancy - 20) : Math.min(90, t.overallOccupancy + 20) }));
      contextStr = next
        ? `Emergency overflow ward opened. 12 additional beds activated in auxiliary wing. Occupancy reduced from ${telemetry.overallOccupancy}% to ${Math.max(40, telemetry.overallOccupancy - 20)}%. Patient transfers underway.`
        : `Overflow ward closed. Patients redistributed. Occupancy back to ${Math.min(90, telemetry.overallOccupancy + 20)}%.`;
      addEvent(next ? '🏥 Overflow ward opened — 12 beds activated in auxiliary wing' : '🏥 Overflow ward closed — beds deactivated', 'success', 'warning');

    // ── SAFETY ACTIONS ──────────────────────────────────────────────────
    } else if (actionKey === 'isolate_zone') {
      const next = !zoneIsolated;
      setZoneIsolated(next);
      setTelemetry(t => ({ ...t, isolatedZones: next ? t.isolatedZones + 1 : Math.max(0, t.isolatedZones - 1) }));
      contextStr = next
        ? `Infection isolation protocol activated for Scrub Bay A. Negative pressure engaged, HEPA filtration on. Staff equipped with full PPE. Zone sealed with controlled access.`
        : `Isolation protocol lifted. Scrub Bay A cleared and sanitized. Normal access restored.`;
      addEvent(next ? '☣️ Infection isolation activated — Scrub Bay A sealed' : '☣️ Isolation lifted — zone cleared and sanitized', 'success', next ? 'critical' : 'info');

    } else if (actionKey === 'mass_casualty') {
      const next = !massCasualtyActive;
      setMassCasualtyActive(next);
      setTelemetry(t => ({ ...t, overallOccupancy: next ? Math.min(100, t.overallOccupancy + 15) : Math.max(40, t.overallOccupancy - 15), activeStaff: next ? t.activeStaff + 6 : Math.max(8, t.activeStaff - 6), criticalAlerts: next ? t.criticalAlerts + 3 : Math.max(0, t.criticalAlerts - 3) }));
      contextStr = next
        ? `MASS CASUALTY INCIDENT declared. All available staff called in (+6). Occupancy surging to ${Math.min(100, telemetry.overallOccupancy + 15)}%. Triage zones established in ambulance deck. All elective OT cases cancelled.`
        : `Mass Casualty protocol stood down. Normal operations resuming. Staff returning to standard shifts.`;
      addEvent(next ? '🚨 MASS CASUALTY PROTOCOL DECLARED — all hands on deck' : '🚨 Mass casualty protocol stood down', 'success', next ? 'critical' : 'info');
    }

    setIsSimulating(false);
    setActiveAction('');

    // Generate AI Report
    const reportContent = await generateAiReport(actionName, contextStr);
    const reportId = `report-${Date.now()}`;
    const newReport: AiReport = {
      id: reportId,
      action: actionName,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
      content: reportContent,
      status: 'success'
    };
    setAiReports(prev => [newReport, ...prev.slice(0, 9)]);
    setActiveReportId(reportId);
    setAiLoading(false);

    addEvent(`🤖 AI Tactical Report generated for: ${actionName}`, 'success', 'info');

    const successEvent = new CustomEvent('add-dashboard-notification', {
      detail: `AI REPORT: ${actionName} simulation complete. Tactical report ready.`
    });
    window.dispatchEvent(successEvent);
  };

  const handleReset = () => {
    setIsEvacuating(false);
    setIsLockedDown(false);
    setDivertActive(false);
    setStaffDeployed(false);
    setCodeBlueActive(false);
    setRapidResponseActive(false);
    setBloodBankRequested(false);
    setZoneIsolated(false);
    setOverflowWardOpen(false);
    setTraumaTeamSummoned(false);
    setVentilatorsRequested(false);
    setMassCasualtyActive(false);
    setTelemetry({ icuCount: 3, otCount: 1, overallOccupancy: 83, activeStaff: 8, responseTime: 38, bloodUnits: 42, ventilatorsAvail: 7, criticalAlerts: 2, isolatedZones: 0 });
    addEvent('🔄 All simulation metrics reset to baseline state', 'success', 'info');
  };

  const selectedRoom = ARCH_ROOMS.find(r => r.id === selectedId) || ARCH_ROOMS[0];
  const activeReport = aiReports.find(r => r.id === activeReportId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '30px' }}>
      
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HEADER                                                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg,#2563EB,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#0F172A', letterSpacing: '-0.4px' }}>
              Live Hospital Floor Simulation
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '2px 0 0' }}>
              Interactive floor plan · AI-powered tactical actions · Real-time simulation reports
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Live indicator */}
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', fontWeight: 700, color: '#10B981', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '4px 10px', borderRadius: '12px' }}>
            <motion.div
              style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#10B981' }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            LIVE SIM
          </span>
          {aiLoading && (
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff', background: 'linear-gradient(90deg,#7C3AED,#2563EB)', padding: '4px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Loader size={11} className="pulse-spin" /> AI ANALYZING
            </span>
          )}
          {isLockedDown && (
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff', backgroundColor: '#EF4444', padding: '4px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Siren size={11} /> LOCKDOWN ACTIVE
            </span>
          )}
          {isEvacuating && (
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff', backgroundColor: '#F59E0B', padding: '4px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <LogOut size={11} /> EVACUATION
            </span>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TOP ROW: Blueprint Map + Right Controls                            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', alignItems: 'start' }}>
        
        {/* Left: SVG Blueprint */}
        <div className="card" style={{ 
          backgroundColor: '#F8FAFC', border: '1.5px solid #E2E8F0', padding: '20px',
          borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center',
          overflow: 'hidden'
        }}>
          <div style={{ width: '400px', height: '700px', position: 'relative' }}>
            <svg 
              viewBox="0 0 400 700" 
              style={{ width: '100%', height: '100%', backgroundColor: '#FFFFFF', border: '2px solid #94A3B8', borderRadius: '8px', boxShadow: '0 10px 30px rgba(148,163,184,0.12)' }}
            >
              <defs>
                <pattern id="arch-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="400" height="700" fill="url(#arch-grid)" />

              {/* Outer boundary */}
              <rect x="15" y="15" width="370" height="670" fill="none" stroke="#475569" strokeWidth="4" />
              
              {/* Ambulance deck */}
              <rect x="30" y="25" width="340" height="40" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4,4" />
              <text x="200" y="48" fill="#64748B" fontSize="10" fontWeight="bold" textAnchor="middle" letterSpacing="1px">BALCONY / AMBULANCE DECK</text>

              {/* Corridor walls */}
              <line x1="170" y1="65" x2="170" y2="450" stroke="#475569" strokeWidth="3" />
              <line x1="230" y1="65" x2="230" y2="450" stroke="#475569" strokeWidth="3" />
              <line x1="15" y1="450" x2="385" y2="450" stroke="#475569" strokeWidth="3" />
              
              {/* Partition walls */}
              <line x1="15" y1="220" x2="170" y2="220" stroke="#475569" strokeWidth="3" />
              <line x1="15" y1="330" x2="110" y2="330" stroke="#475569" strokeWidth="3" />
              <line x1="15" y1="440" x2="110" y2="440" stroke="#475569" strokeWidth="3" />
              <line x1="230" y1="220" x2="385" y2="220" stroke="#475569" strokeWidth="3" />
              <line x1="230" y1="360" x2="385" y2="360" stroke="#475569" strokeWidth="3" />
              <line x1="190" y1="450" x2="190" y2="685" stroke="#475569" strokeWidth="3" />

              {/* Stairs */}
              <rect x="230" y="500" width="140" height="160" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
              {Array.from({ length: 9 }).map((_, idx) => (
                <line key={idx} x1="230" y1={500 + idx * 18} x2="370" y2={500 + idx * 18} stroke="#94A3B8" strokeWidth="1.5" />
              ))}
              <path d="M 300 640 L 300 520 L 295 525 M 300 520 L 305 525" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
              <text x="315" y="585" fill="#64748B" fontSize="9" fontWeight="800" transform="rotate(-90 315 585)">STAIRS EXIT</text>

              {/* Rooms */}
              {ARCH_ROOMS.map(room => {
                const isSelected = selectedId === room.id;
                const locked = isDeptHead && room.id !== 'icu_a';
                let fillOpacity = isSelected ? 0.08 : 0.02;
                let bgOverlay = '#3B82F6';
                if (isLockedDown) { bgOverlay = '#EF4444'; fillOpacity = 0.12; }
                else if (room.id === 'icu_a' || room.id === 'ot') { bgOverlay = '#EF4444'; fillOpacity = isSelected ? 0.14 : 0.05; }

                return (
                  <g key={room.id} onClick={() => !locked && setSelectedId(room.id)} style={{ cursor: locked ? 'not-allowed' : 'pointer' }}>
                    <rect x={room.x} y={room.y} width={room.w} height={room.h} fill={locked ? '#E2E8F0' : bgOverlay} fillOpacity={locked ? 0.35 : fillOpacity} style={{ transition: 'all 0.3s ease' }} />
                    {isSelected && !locked && <rect x={room.x + 2} y={room.y + 2} width={room.w - 4} height={room.h - 4} fill="none" stroke="#2563EB" strokeWidth="2.5" />}
                    <text x={room.x + room.w/2} y={room.y + 24} fill={locked ? '#94A3B8' : isSelected ? '#1E3A8A' : '#475569'} fontSize="9.5" fontWeight="800" textAnchor="middle">
                      {room.icon} {room.name}
                    </text>
                    {room.beds.map((bed, bIdx) => {
                      const bedOccupied = !isEvacuating && bed.occupied;
                      return (
                        <g key={bIdx} style={{ opacity: locked ? 0.2 : 1 }}>
                          <rect x={bed.x - 10} y={bed.y} width="20" height="38" rx="2" fill="#FFFFFF" stroke="#475569" strokeWidth="1.5" />
                          <rect x={bed.x - 8} y={bed.y + 2} width="16" height="7" fill="#E2E8F0" />
                          <line x1={bed.x - 10} y1={bed.y + 16} x2={bed.x + 10} y2={bed.y + 16} stroke="#475569" />
                          {bedOccupied && (
                            <motion.circle cx={bed.x} cy={bed.y + 24} r="5" fill={isLockedDown ? '#EF4444' : '#3B82F6'} animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                          )}
                        </g>
                      );
                    })}
                    {locked && (
                      <g transform={`translate(${room.x + room.w/2 - 6}, ${room.y + room.h/2 - 6})`}>
                        <Lock size={12} color="#94A3B8" />
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Doors */}
              <motion.g animate={{ rotate: isLockedDown ? -90 : 0 }} transformOrigin="170 120" style={{ transition: 'transform 0.4s ease' }}>
                <line x1="170" y1="120" x2="170" y2="150" stroke="#B91C1C" strokeWidth="2.5" />
                <path d="M 170 150 A 30 30 0 0 1 140 120" fill="none" stroke="rgba(185,28,28,0.3)" strokeDasharray="3,3" />
              </motion.g>
              <motion.g animate={{ rotate: isLockedDown ? 90 : 0 }} transformOrigin="230 120" style={{ transition: 'transform 0.4s ease' }}>
                <line x1="230" y1="120" x2="230" y2="150" stroke="#B91C1C" strokeWidth="2.5" />
                <path d="M 230 150 A 30 30 0 0 0 260 120" fill="none" stroke="rgba(185,28,28,0.3)" strokeDasharray="3,3" />
              </motion.g>
              <motion.g animate={{ rotate: isLockedDown ? -90 : 0 }} transformOrigin="190 530" style={{ transition: 'transform 0.4s ease' }}>
                <line x1="190" y1="530" x2="190" y2="560" stroke="#B91C1C" strokeWidth="2.5" />
                <path d="M 190 560 A 30 30 0 0 1 160 530" fill="none" stroke="rgba(185,28,28,0.3)" strokeDasharray="3,3" />
              </motion.g>

              {/* Flow particles */}
              {!isEvacuating && (
                <g>
                  {Array.from({ length: divertActive ? 1 : 4 }).map((_, idx) => (
                    <circle key={`inflow-${idx}`} r="3.5" fill="#10B981">
                      <animateMotion path="M 200 65 L 200 130 C 200 130, 200 140, 170 140" begin={`${idx * 1.8}s`} dur="6s" repeatCount="indefinite" />
                    </circle>
                  ))}
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <circle key={`diag-${idx}`} r="3" fill="#F59E0B">
                      <animateMotion path="M 230 140 L 200 140 L 200 280 L 230 280" begin={`${idx * 2.5}s`} dur="8s" repeatCount="indefinite" />
                    </circle>
                  ))}
                  {staffDeployed && Array.from({ length: 4 }).map((_, idx) => (
                    <circle key={`staff-${idx}`} r="4" fill="#3B82F6">
                      <animateMotion path="M 200 200 L 200 380 L 80 380 L 80 280 L 200 280" begin={`${idx * 2.2}s`} dur="9s" repeatCount="indefinite" />
                    </circle>
                  ))}
                </g>
              )}

              {/* Evacuation particles */}
              {isEvacuating && (
                <g>
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <circle key={`evac-a-${idx}`} r="4" fill="#EF4444">
                      <animateMotion path="M 115 140 L 200 140 L 200 460 L 280 460 L 280 500" begin={`${idx * 0.8}s`} dur="4s" repeatCount="indefinite" />
                    </circle>
                  ))}
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <circle key={`evac-b-${idx}`} r="4" fill="#EF4444">
                      <animateMotion path="M 285 140 L 200 140 L 200 460 L 280 460 L 280 500" begin={`${idx * 0.9}s`} dur="4s" repeatCount="indefinite" />
                    </circle>
                  ))}
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <circle key={`evac-ot-${idx}`} r="4" fill="#EF4444">
                      <animateMotion path="M 100 560 L 190 560 L 200 460 L 280 460 L 280 500" begin={`${idx * 1.1}s`} dur="5s" repeatCount="indefinite" />
                    </circle>
                  ))}
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Right: Telemetry + Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Live Telemetry */}
          <div className="card" style={{ padding: '18px', borderLeft: '4px solid #2563EB' }}>
            <h3 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px', margin: '0 0 10px 0' }}>
              <Activity size={14} color="#2563EB" /> LIVE FLOOR TELEMETRY
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {[
                { label: 'Floor Load', value: `${telemetry.overallOccupancy}%`, color: telemetry.overallOccupancy >= 80 ? '#EF4444' : '#10B981' },
                { label: 'Staff On Duty', value: `${telemetry.activeStaff} MD/RN`, color: '#0F172A' },
                { label: 'Response Time', value: `${telemetry.responseTime}s`, color: telemetry.responseTime >= 35 ? '#F59E0B' : '#10B981' },
                { label: 'Surgical Queue', value: `${telemetry.otCount} active`, color: '#EF4444' },
                { label: 'Blood Units', value: `${telemetry.bloodUnits} units`, color: telemetry.bloodUnits < 30 ? '#EF4444' : '#10B981' },
                { label: 'Ventilators', value: `${telemetry.ventilatorsAvail} avail`, color: telemetry.ventilatorsAvail < 5 ? '#F59E0B' : '#10B981' },
                { label: 'Critical Alerts', value: `${telemetry.criticalAlerts}`, color: telemetry.criticalAlerts > 2 ? '#EF4444' : '#F59E0B' },
                { label: 'Isolated Zones', value: `${telemetry.isolatedZones}`, color: telemetry.isolatedZones > 0 ? '#F59E0B' : '#10B981' }
              ].map((m, idx) => (
                <div key={idx} style={{ backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9', padding: '7px 10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.55rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>{m.label}</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 900, color: m.color, marginTop: '2px' }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tactical Action Buttons — categorized, scrollable */}
          <div className="card" style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px', margin: '0 0 4px 0' }}>
              <Siren size={14} color="#B91C1C" /> SIMULATION ACTIONS
            </h3>
            <p style={{ fontSize: '0.65rem', color: '#94A3B8', margin: '0 0 12px 0' }}>
              Click any action to execute + get an AI report.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '560px', overflowY: 'auto', paddingRight: '4px' }}>

              {/* ── EMERGENCY OPERATIONS ── */}
              <div>
                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#B91C1C', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ display: 'inline-block', width: '3px', height: '12px', backgroundColor: '#EF4444', borderRadius: '2px' }} />
                  Emergency Operations
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { key: 'divert', label: divertActive ? '🚑 Diversion Active' : '🚑 Divert Ambulance Inbound', name: 'Divert Inbound Trauma', active: divertActive, activeColor: '#2563EB', activeBg: '#EFF6FF', activeBorder: '#93C5FD', disabled: isEvacuating },
                    { key: 'lockdown', label: isLockedDown ? '🔒 Facility Locked Down' : '🔒 Secure Facility Lockdown', name: 'Secure Facility Lockdown', active: isLockedDown, activeColor: '#EF4444', activeBg: '#FEF2F2', activeBorder: '#FCA5A5', disabled: isEvacuating || isDeptHead },
                    { key: 'evacuate', label: isEvacuating ? '🏃 Evacuation In Progress' : '🏃 Initiate Evacuation Drill', name: 'Emergency Evacuation Drill', active: isEvacuating, activeColor: '#D97706', activeBg: '#FEF3C7', activeBorder: '#FCD34D', disabled: isEvacuating || isDeptHead },
                    { key: 'mass_casualty', label: massCasualtyActive ? '🚨 Mass Casualty Active' : '🚨 Declare Mass Casualty', name: 'Mass Casualty Incident', active: massCasualtyActive, activeColor: '#7C3AED', activeBg: '#F5F3FF', activeBorder: '#C4B5FD', disabled: isDeptHead },
                  ].map(action => {
                    const isLoading = isSimulating && activeAction === action.key;
                    return (
                      <button key={action.key} id={`sim-action-${action.key}`}
                        onClick={() => runDispatchAction(action.key, action.name)}
                        disabled={action.disabled || isSimulating}
                        style={{
                          width: '100%', padding: '9px 11px', borderRadius: '8px',
                          border: action.active ? `1.5px solid ${action.activeBorder}` : '1.5px solid #E2E8F0',
                          backgroundColor: action.active ? action.activeBg : '#FFFFFF',
                          color: action.active ? action.activeColor : '#475569',
                          fontSize: '0.72rem', fontWeight: 700,
                          cursor: action.disabled || isSimulating ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: '7px',
                          transition: 'all 0.2s', opacity: action.disabled || isSimulating ? 0.45 : 1, textAlign: 'left'
                        }}
                      >
                        {isLoading ? <Loader size={12} className="pulse-spin" /> : null}
                        <span style={{ flex: 1 }}>{action.label}</span>
                        {action.active && <span style={{ fontSize: '0.55rem', fontWeight: 900, opacity: 0.75 }}>ACTIVE</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── CLINICAL ACTIONS ── */}
              <div>
                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ display: 'inline-block', width: '3px', height: '12px', backgroundColor: '#10B981', borderRadius: '2px' }} />
                  Clinical Actions
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { key: 'staff', label: staffDeployed ? '👥 Backup Staff On Floor' : '👥 Deploy Backup Staff', name: 'Deploy Emergency Staff', active: staffDeployed, activeColor: '#059669', activeBg: '#ECFDF5', activeBorder: '#6EE7B7', disabled: isEvacuating },
                    { key: 'code_blue', label: codeBlueActive ? '🔵 Code Blue — Active' : '🔵 Activate Code Blue', name: 'Code Blue Protocol', active: codeBlueActive, activeColor: '#1D4ED8', activeBg: '#EFF6FF', activeBorder: '#93C5FD', disabled: false },
                    { key: 'rapid_response', label: rapidResponseActive ? '⚡ Rapid Response On Floor' : '⚡ Activate Rapid Response', name: 'Rapid Response Team', active: rapidResponseActive, activeColor: '#D97706', activeBg: '#FFFBEB', activeBorder: '#FDE68A', disabled: false },
                    { key: 'trauma_team', label: traumaTeamSummoned ? '🩺 Trauma Team On Floor' : '🩺 Summon Trauma Team', name: 'Summon Trauma Team', active: traumaTeamSummoned, activeColor: '#7C3AED', activeBg: '#F5F3FF', activeBorder: '#DDD6FE', disabled: false },
                  ].map(action => {
                    const isLoading = isSimulating && activeAction === action.key;
                    return (
                      <button key={action.key} id={`sim-action-${action.key}`}
                        onClick={() => runDispatchAction(action.key, action.name)}
                        disabled={action.disabled || isSimulating}
                        style={{
                          width: '100%', padding: '9px 11px', borderRadius: '8px',
                          border: action.active ? `1.5px solid ${action.activeBorder}` : '1.5px solid #E2E8F0',
                          backgroundColor: action.active ? action.activeBg : '#FFFFFF',
                          color: action.active ? action.activeColor : '#475569',
                          fontSize: '0.72rem', fontWeight: 700,
                          cursor: action.disabled || isSimulating ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: '7px',
                          transition: 'all 0.2s', opacity: action.disabled || isSimulating ? 0.45 : 1, textAlign: 'left'
                        }}
                      >
                        {isLoading ? <Loader size={12} className="pulse-spin" /> : null}
                        <span style={{ flex: 1 }}>{action.label}</span>
                        {action.active && <span style={{ fontSize: '0.55rem', fontWeight: 900, opacity: 0.75 }}>ACTIVE</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── RESOURCE & SAFETY ── */}
              <div>
                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ display: 'inline-block', width: '3px', height: '12px', backgroundColor: '#7C3AED', borderRadius: '2px' }} />
                  Resources & Safety
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { key: 'blood_bank', label: bloodBankRequested ? '🩸 Blood Bank Supplied' : '🩸 Request Blood Bank Supply', name: 'Emergency Blood Bank Request', active: bloodBankRequested, activeColor: '#BE123C', activeBg: '#FFF1F2', activeBorder: '#FECDD3', disabled: false },
                    { key: 'ventilators', label: ventilatorsRequested ? '🫁 Ventilators Deployed' : '🫁 Request Ventilators', name: 'Request Additional Ventilators', active: ventilatorsRequested, activeColor: '#0369A1', activeBg: '#F0F9FF', activeBorder: '#BAE6FD', disabled: false },
                    { key: 'overflow_ward', label: overflowWardOpen ? '🏥 Overflow Ward Open' : '🏥 Open Overflow Ward', name: 'Open Emergency Overflow Ward', active: overflowWardOpen, activeColor: '#059669', activeBg: '#ECFDF5', activeBorder: '#6EE7B7', disabled: false },
                    { key: 'isolate_zone', label: zoneIsolated ? '☣️ Zone Isolated' : '☣️ Isolate Infection Zone', name: 'Infection Zone Isolation', active: zoneIsolated, activeColor: '#92400E', activeBg: '#FFFBEB', activeBorder: '#FDE68A', disabled: isDeptHead },
                  ].map(action => {
                    const isLoading = isSimulating && activeAction === action.key;
                    return (
                      <button key={action.key} id={`sim-action-${action.key}`}
                        onClick={() => runDispatchAction(action.key, action.name)}
                        disabled={action.disabled || isSimulating}
                        style={{
                          width: '100%', padding: '9px 11px', borderRadius: '8px',
                          border: action.active ? `1.5px solid ${action.activeBorder}` : '1.5px solid #E2E8F0',
                          backgroundColor: action.active ? action.activeBg : '#FFFFFF',
                          color: action.active ? action.activeColor : '#475569',
                          fontSize: '0.72rem', fontWeight: 700,
                          cursor: action.disabled || isSimulating ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: '7px',
                          transition: 'all 0.2s', opacity: action.disabled || isSimulating ? 0.45 : 1, textAlign: 'left'
                        }}
                      >
                        {isLoading ? <Loader size={12} className="pulse-spin" /> : null}
                        <span style={{ flex: 1 }}>{action.label}</span>
                        {action.active && <span style={{ fontSize: '0.55rem', fontWeight: 900, opacity: 0.75 }}>ACTIVE</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reset */}
              <button
                onClick={handleReset}
                disabled={isSimulating}
                style={{
                  width: '100%', padding: '9px', borderRadius: '8px', border: '1.5px dashed #E2E8F0',
                  backgroundColor: 'transparent', color: '#94A3B8', fontSize: '0.7rem', fontWeight: 800,
                  cursor: isSimulating ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s'
                }}
                onMouseOver={e => !isSimulating && (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                onMouseOut={e => !isSimulating && (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <RefreshCw size={11} /> Reset All Simulation Metrics
              </button>

            </div>
          </div>

          {/* Selected Room Info */}
          <AnimatePresence mode="wait">
            {selectedRoom && (
              <motion.div
                key={selectedId}
                className="card"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                style={{ padding: '14px', borderTop: '3px solid #3B82F6' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {selectedRoom.icon} {selectedRoom.name}
                  </h4>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', color: selectedRoom.type === 'critical' ? '#EF4444' : '#64748B', backgroundColor: selectedRoom.type === 'critical' ? '#FEF2F2' : '#F1F5F9', padding: '2px 7px', borderRadius: '4px' }}>
                    {selectedRoom.type}
                  </span>
                </div>
                <p style={{ fontSize: '0.73rem', color: '#64748B', lineHeight: '1.4', margin: '6px 0 0 0' }}>
                  {selectedRoom.description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* BOTTOM ROW: AI Simulation Reports + Event Log                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
        
        {/* AI Simulation Report Panel */}
        <div className="card" style={{ 
          padding: '0', overflow: 'hidden',
          border: '1.5px solid #DDD6FE',
          background: 'linear-gradient(135deg, #FAFAFE 0%, #F5F3FF 100%)'
        }}>
          {/* Report Panel Header */}
          <div style={{ 
            padding: '16px 20px', borderBottom: '1px solid #EDE9FE',
            background: 'linear-gradient(90deg,rgba(124,58,237,0.06),rgba(37,99,235,0.06))',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#7C3AED,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BrainCircuit size={16} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E1B4B' }}>AI Simulation Report</div>
                <div style={{ fontSize: '0.65rem', color: '#7C3AED' }}>Powered by Llama 3.1 via Groq</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {aiReports.map((r, idx) => (
                <button
                  key={r.id}
                  onClick={() => setActiveReportId(r.id)}
                  title={r.action}
                  style={{
                    width: '28px', height: '28px', borderRadius: '6px', border: 'none',
                    backgroundColor: activeReportId === r.id ? '#7C3AED' : '#E9E5F5',
                    color: activeReportId === r.id ? '#fff' : '#7C3AED',
                    fontSize: '0.6rem', fontWeight: 800, cursor: 'pointer'
                  }}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Report Content */}
          <div style={{ padding: '20px', minHeight: '220px' }}>
            {aiLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: '14px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '3px solid #EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader size={22} color="#7C3AED" className="pulse-spin" />
                  </div>
                  <motion.div
                    style={{ position: 'absolute', inset: '-4px', borderRadius: '50%', border: '2px solid #7C3AED', opacity: 0.3 }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4C1D95' }}>Generating Tactical Report</div>
                  <div style={{ fontSize: '0.68rem', color: '#7C3AED', marginTop: '4px' }}>Llama 3.1 is analyzing floor state...</div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['Parsing telemetry', 'Assessing risk', 'Drafting recommendations'].map((step, i) => (
                    <motion.span
                      key={step}
                      style={{ fontSize: '0.6rem', fontWeight: 700, padding: '3px 8px', borderRadius: '10px', backgroundColor: '#EDE9FE', color: '#7C3AED' }}
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4 }}
                    >
                      {step}
                    </motion.span>
                  ))}
                </div>
              </div>
            ) : activeReport ? (
              <div>
                {/* Report meta */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', padding: '8px 12px', backgroundColor: 'rgba(124,58,237,0.06)', borderRadius: '8px', border: '1px solid #DDD6FE' }}>
                  <Zap size={13} color="#7C3AED" />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4C1D95', flex: 1 }}>
                    {activeReport.action}
                  </span>
                  <span style={{ fontSize: '0.62rem', color: '#94A3B8' }}>{activeReport.timestamp}</span>
                  <CheckCircle2 size={13} color="#10B981" />
                </div>

                {/* Report body */}
                <div style={{ 
                  fontSize: '0.78rem', lineHeight: '1.7', color: '#1E1B4B',
                  whiteSpace: 'pre-wrap', backgroundColor: '#FFFFFF',
                  border: '1px solid #EDE9FE', borderRadius: '10px',
                  padding: '16px 18px', maxHeight: '280px', overflowY: 'auto',
                  fontFamily: 'inherit'
                }}>
                  {activeReport.content}
                </div>

                {/* Previous reports list */}
                {aiReports.length > 1 && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '6px' }}>Previous Reports</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {aiReports.filter(r => r.id !== activeReportId).slice(0, 3).map(r => (
                        <button
                          key={r.id}
                          onClick={() => setActiveReportId(r.id)}
                          style={{
                            width: '100%', padding: '7px 10px', borderRadius: '7px',
                            border: '1px solid #EDE9FE', backgroundColor: '#FAFAFE',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left'
                          }}
                        >
                          <FileText size={11} color="#7C3AED" />
                          <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#4C1D95', flex: 1 }}>{r.action}</span>
                          <span style={{ fontSize: '0.6rem', color: '#94A3B8' }}>{r.timestamp}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: '12px', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={26} color="#C4B5FD" />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#4C1D95' }}>No Report Generated Yet</div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '6px', maxWidth: '320px', lineHeight: '1.5' }}>
                    Click any tactical action button above to execute a floor simulation. Llama 3.1 will instantly generate a detailed AI tactical report here.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '4px' }}>
                  {['🚑 Divert', '👥 Deploy Staff', '🔒 Lockdown', '🏃 Evacuate'].map(action => (
                    <span key={action} style={{ fontSize: '0.65rem', fontWeight: 700, padding: '4px 10px', borderRadius: '10px', backgroundColor: '#EDE9FE', color: '#7C3AED' }}>
                      {action}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Event Log */}
        <div className="card" style={{ padding: '18px' }}>
          <h3 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px', margin: '0 0 12px 0' }}>
            <Radio size={14} color="#10B981" /> LIVE EVENT LOG
          </h3>

          <div
            ref={feedRef}
            style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '360px', overflowY: 'auto', paddingRight: '2px' }}
          >
            {simulationEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 16px', color: '#94A3B8' }}>
                <AlertTriangle size={20} color="#CBD5E1" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>No events yet</div>
                <div style={{ fontSize: '0.65rem', marginTop: '4px' }}>Execute a tactical action to begin simulation</div>
              </div>
            ) : (
              [...simulationEvents].reverse().map(event => {
                const sevColors = {
                  critical: { bg: '#FEF2F2', border: '#FECACA', dot: '#EF4444' },
                  warning: { bg: '#FFFBEB', border: '#FDE68A', dot: '#F59E0B' },
                  info: { bg: '#F8FAFC', border: '#E2E8F0', dot: event.status === 'success' ? '#10B981' : event.status === 'pending' ? '#F59E0B' : '#EF4444' }
                };
                const colors = sevColors[event.severity];
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '8px 10px',
                      borderRadius: '7px', backgroundColor: colors.bg, border: `1px solid ${colors.border}`
                    }}
                  >
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: colors.dot, marginTop: '5px', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#334155', lineHeight: '1.3' }}>
                        {event.action}
                      </div>
                      <div style={{ fontSize: '0.6rem', color: '#94A3B8', marginTop: '2px' }}>
                        <Clock size={9} style={{ display: 'inline', marginRight: '3px' }} />
                        {event.timestamp}
                      </div>
                    </div>
                    {event.status === 'success' && <CheckCircle2 size={13} color="#10B981" style={{ flexShrink: 0, marginTop: '3px' }} />}
                    {event.status === 'pending' && <AlertCircle size={13} color="#F59E0B" style={{ flexShrink: 0, marginTop: '3px' }} />}
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Spinner + Keyframes */}
      <style>{`
        .pulse-spin {
          animation: pulseSpin 1s linear infinite;
        }
        @keyframes pulseSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
