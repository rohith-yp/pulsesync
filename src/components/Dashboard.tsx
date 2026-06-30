import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, Bell, Menu, LayoutDashboard, Users, 
  Layers, Clock, BrainCircuit, Lock
} from 'lucide-react';
import { mockDataEngine } from '../utils/mockData';
import { KPISection } from './KPISection';
import { BottleneckPrediction } from './BottleneckPrediction';
import { EmergencyMode } from './EmergencyMode';
import { CrisisSimulator } from './CrisisSimulator';
import { Reports } from './Reports';
import { AlertPanel } from './AlertPanel';
import { LiveHospitalMap } from './LiveHospitalMap';
import { AIAssistant } from './AIAssistant';
import { InflowPrediction } from './InflowPrediction';
import { WorkforceIntelligence } from './WorkforceIntelligence';
import { ResourceOptimization } from './ResourceOptimization';


interface DashboardProps {
  userRole: string;
  onLogout: () => void;
}

export const Dashboard = ({ userRole, onLogout }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState<'command' | 'workforce' | 'forecasts' | 'resources' | 'simulation'>('command');
  const [liveData, setLiveData] = useState(mockDataEngine.getData());
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync with mock data loop
  useEffect(() => {
    mockDataEngine.registerListener(() => {
      setLiveData(mockDataEngine.getData());
    });

    return () => {
      mockDataEngine.registerListener(() => {});
    };
  }, []);

  // Action: dismiss operational alert
  const handleDismissAlert = (id: string) => {
    setLiveData(prev => ({
      ...prev,
      alerts: prev.alerts.filter(a => a.id !== id)
    }));
    setNotifications(prev => ['SYSTEM: Operational Alert resolved.', ...prev]);
  };

  // Action: mitigate clinician stress
  const handleMitigateStress = (doctorId: string) => {
    const engine = mockDataEngine as any;
    engine.doctors = engine.doctors.map((d: any) => {
      if (d.id === doctorId) {
        return {
          ...d,
          patientsAssigned: Math.round(d.patientsAssigned / 2),
          hoursWorked: 4.0,
          stressScore: 32,
          burnoutProbability: 28,
          status: 'stable',
          aiRecommendation: 'Optimal workload restored. Monitor shifts.'
        };
      }
      return d;
    });
    setLiveData(mockDataEngine.getData());
    const docName = engine.doctors.find((d: any) => d.id === doctorId)?.name || 'Clinician';
    setNotifications(prev => [`STAFF: Workload reduced for ${docName}.`, ...prev]);
  };

  // Action: execute resource redistribution
  const handleExecuteRedistribution = (resourceId: string) => {
    const engine = mockDataEngine as any;
    engine.resources = engine.resources.map((r: any) => {
      if (r.id === resourceId) {
        return {
          ...r,
          available: r.available + 5 > r.total ? r.total : r.available + 5,
          status: 'stable',
          aiRecommendation: 'No action needed. Re-allocation complete.'
        };
      }
      return r;
    });
    setLiveData(mockDataEngine.getData());
    const resName = engine.resources.find((r: any) => r.id === resourceId)?.name || 'Resource';
    setNotifications(prev => [`LOGISTICS: Resource re-allocation triggered for ${resName}.`, ...prev]);
  };

  // Action: trigger emergency simulation
  const handleTriggerEmergency = (type: 'accident' | 'outbreak' | 'mass_casualty' | 'fire' | 'flood') => {
    const results = mockDataEngine.simulateEmergency(type);
    setLiveData(mockDataEngine.getData());
    setNotifications(prev => [`CRITICAL: Simulated ${type} engaged! Admissions spiking.`, ...prev]);
    return results;
  };

  // Filter Data based on Role-Based Access Control (RBAC)
  const isDeptHead = userRole === 'dept_head';

  // 1. Filter alerts
  const filteredAlerts = isDeptHead 
    ? liveData.alerts.filter(a => a.departmentName === 'Emergency' || a.id === 'er_staff') 
    : liveData.alerts;

  // 2. Filter doctors
  const filteredDoctors = isDeptHead 
    ? liveData.doctors.filter(d => d.department === 'Emergency') 
    : liveData.doctors;

  // 3. Filter resources
  const filteredResources = isDeptHead 
    ? liveData.resources.filter(r => r.id === 'er_beds' || r.id === 'vent' || r.id === 'ppe') 
    : liveData.resources;

  // 4. Filter bottlenecks
  const filteredBottlenecks = isDeptHead 
    ? liveData.bottlenecks.filter(b => b.department === 'Emergency') 
    : liveData.bottlenecks;

  // 5. Calculate Localized Emergency KPIs for Department Head
  const displayedKPIs = liveData.kpis;

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'workforce':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {isDeptHead && (
              <div style={{ padding: '12px 18px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 600, border: '1px solid rgba(37,99,235,0.15)' }}>
                🏥 Department Head Access: Showing clinician stress levels for the **Emergency Department** only.
              </div>
            )}
            <WorkforceIntelligence doctors={filteredDoctors} onTriggerMitigation={handleMitigateStress} />
          </div>
        );

      case 'forecasts':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {isDeptHead && (
              <div style={{ padding: '12px 18px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 600, border: '1px solid rgba(37,99,235,0.15)' }}>
                📈 Department Head Access: Displaying Surge and Bottleneck analysis localized to **Emergency** operations.
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              <InflowPrediction />
              <BottleneckPrediction bottlenecks={filteredBottlenecks} />
            </div>
          </div>
        );

      case 'resources':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {isDeptHead ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#FEF3C7', color: '#D97706', borderRadius: '12px', border: '1px solid #FCD34D', fontSize: '0.88rem', fontWeight: 600 }}>
                  <Lock size={20} />
                  <div>
                    <strong>Global Action Authorization Required:</strong> contact the Hospital Administrator to dispatch simulated mass casualty drills or global hospital evacuation routes. Local stock levels can be optimized below.
                  </div>
                </div>
                <ResourceOptimization resources={filteredResources} onExecuteRedistribution={handleExecuteRedistribution} />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
                <EmergencyMode onTriggerEmergency={handleTriggerEmergency} />
                <ResourceOptimization resources={filteredResources} onExecuteRedistribution={handleExecuteRedistribution} />
              </div>
            )}
          </div>
        );

      case 'simulation':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {isDeptHead ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', backgroundColor: '#FEF3C7', color: '#D97706', borderRadius: '12px', border: '1px solid #FCD34D', fontSize: '0.88rem', fontWeight: 600 }}>
                  <Lock size={18} />
                  <div><strong>Crisis Simulator access restricted.</strong> Only Hospital Administrators can run hospital-wide emergency drills. Your report access is active below.</div>
                </div>
                <Reports />
              </>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
                <CrisisSimulator />
                <Reports />
              </div>
            )}
          </div>
        );

      case 'command':
      default:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', alignItems: 'start' }}>
              <AlertPanel alerts={filteredAlerts} onDismissAlert={handleDismissAlert} />
              <LiveHospitalMap departments={liveData.departments} userRole={userRole} />
            </div>
          </div>
        );
    }
  };

  const getRoleLabel = (role: string) => {
    if (role === 'admin') return 'Hospital Administrator (Global)';
    return 'Department Head (Emergency)';
  };

  const navItems = [
    { id: 'command', label: 'Command Center', icon: LayoutDashboard },
    { id: 'workforce', label: 'Workforce Wellness', icon: Users },
    { id: 'forecasts', label: 'Surge & Bottlenecks', icon: Clock },
    { id: 'resources', label: 'Logistics & Dispatch', icon: Layers },
    { id: 'simulation', label: 'Simulator & Reports', icon: BrainCircuit }
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#F8FAFC', overflow: 'hidden' }}>
      
      {/* 1. LEFT SIDEBAR */}
      <aside 
        style={{
          width: '280px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid var(--neutral-200)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px',
          zIndex: 100,
          transition: 'all 0.3s ease'
        }}
        className={`sidebar-nav ${sidebarOpen ? 'open' : ''}`}
      >
        <div>
          {/* Logo */}
          <div style={{ padding: '0 0 20px', borderBottom: '1px solid var(--neutral-100)', marginBottom: '20px' }}>
            <img 
              src="/logo.png" 
              alt="PulseSync AI Logo" 
              style={{ 
                width: '100%', 
                height: '80px', 
                objectFit: 'contain', 
                objectPosition: 'left center',
                mixBlendMode: 'multiply' 
              }} 
            />
          </div>


          {/* Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setSidebarOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  width: '100%',
                  textAlign: 'left',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: activeTab === item.id ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: activeTab === item.id ? 'var(--primary-light)' : 'transparent',
                  color: activeTab === item.id ? 'var(--primary)' : 'var(--neutral-600)'
                }}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div style={{ borderTop: '1px solid var(--neutral-100)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
              {userRole === 'admin' ? 'HA' : 'DH'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--neutral-800)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {userRole === 'admin' ? 'Dr. Elizabeth Vance' : 'Dr. Sarah Jenkins'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--neutral-500)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {getRoleLabel(userRole)}
              </div>
            </div>
          </div>
          <button 
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              width: '100%',
              borderRadius: '8px',
              border: '1px solid var(--neutral-200)',
              backgroundColor: '#FFFFFF',
              color: 'var(--neutral-600)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--danger-light)';
              e.currentTarget.style.color = 'var(--danger)';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.color = 'var(--neutral-600)';
              e.currentTarget.style.borderColor = 'var(--neutral-200)';
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        
        {/* Header Bar */}
        <header style={{
          height: '70px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--neutral-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 30px',
          zIndex: 10
        }}>
          {/* Left section: Hamburger for Mobile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              className="btn btn-ghost" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ display: 'none', padding: '8px' }}
              id="sidebar-toggle"
            >
              <Menu size={20} />
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--neutral-900)', letterSpacing: '-0.5px', margin: 0 }}>
                {navItems.find(n => n.id === activeTab)?.label}
              </h2>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: isDeptHead ? '#059669' : '#2563EB', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isDeptHead ? '#059669' : '#2563EB', display: 'inline-block' }} />
                {isDeptHead ? 'Department Head — Emergency Division' : 'Hospital Administrator — Global Access'}
              </span>
            </div>
          </div>

          {/* Right section: Alerts & Time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Live Status indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: 'var(--success-light)', color: 'var(--success)', borderRadius: '30px', fontSize: '0.8rem', fontWeight: 700 }}>
              <span className="pulse-danger" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)', border: 'none', animation: 'none' }} />
              Live Feed Active
            </div>

            {/* Notifications Dropdown */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  position: 'relative',
                  padding: '8px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: 'var(--neutral-100)',
                  cursor: 'pointer',
                  color: 'var(--neutral-600)',
                  display: 'flex'
                }}
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--danger)' }} />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    style={{
                      position: 'absolute',
                      top: '46px',
                      right: '0',
                      width: '320px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      boxShadow: 'var(--shadow-lg)',
                      border: '1px solid var(--neutral-200)',
                      padding: '16px',
                      zIndex: 1000
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--neutral-100)', paddingBottom: '8px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--neutral-800)' }}>Log Notifications</span>
                      {notifications.length > 0 && (
                        <button onClick={() => setNotifications([])} style={{ border: 'none', background: 'none', color: 'var(--primary)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}>Clear All</button>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px 0', fontSize: '0.8rem', color: 'var(--neutral-400)' }}>No logged notifications. Trigger dashboard events to log activity.</div>
                      ) : (
                        notifications.map((n, idx) => (
                          <div key={idx} style={{ fontSize: '0.75rem', padding: '8px', backgroundColor: 'var(--neutral-50)', borderRadius: '6px', borderLeft: '3px solid var(--primary)', lineHeight: '1.4' }}>
                            {n}
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        <main style={{ flex: 1, padding: '30px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Standard Top KPI Section - customized per role */}
          <KPISection kpis={displayedKPIs} />

          {/* Active Tab Component */}
          {renderActiveContent()}

        </main>
      </div>

      {/* Floating AI Operations Assistant */}
      <AIAssistant departments={liveData.departments} doctors={liveData.doctors} resources={liveData.resources} />

    </div>
  );
};
