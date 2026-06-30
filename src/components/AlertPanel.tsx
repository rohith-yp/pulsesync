import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Zap, CheckCircle2, ChevronDown, ChevronUp, BellRing, Loader, Send, X, Sparkles } from 'lucide-react';
import type { AIAlert } from '../utils/mockData';
import { alertPool } from '../utils/mockData';

interface AlertPanelProps {
  alerts: AIAlert[];
  onDismissAlert?: (id: string) => void;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({ alerts: externalAlerts, onDismissAlert }) => {

  // Internal alert list — starts from props, but manages its own cycling
  const [activeAlerts, setActiveAlerts] = useState<AIAlert[]>(externalAlerts);
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(externalAlerts[0]?.id || null);
  const [completedActions, setCompletedActions] = useState<{ [key: string]: boolean }>({});
  const [deployingAlertId, setDeployingAlertId] = useState<string | null>(null);
  const [deployStep, setDeployStep] = useState<number>(0);
  const [justResolvedId, setJustResolvedId] = useState<string | null>(null);

  // Track which pool IDs have already been used
  const usedPoolIds = useRef<Set<string>>(new Set(externalAlerts.map(a => a.id)));

  // Keep in sync when parent updates (role filter)
  useEffect(() => {
    setActiveAlerts(externalAlerts);
    if (!expandedAlertId || !externalAlerts.find(a => a.id === expandedAlertId)) {
      setExpandedAlertId(externalAlerts[0]?.id || null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalAlerts.length]);

  const toggleExpand = (id: string) => {
    setExpandedAlertId(expandedAlertId === id ? null : id);
  };

  const handleActionToggle = (alertId: string, actionIdx: number) => {
    const key = `${alertId}_${actionIdx}`;
    setCompletedActions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Pick next unused alert from pool
  const pickNextAlert = (): AIAlert | null => {
    const available = alertPool.filter(a => !usedPoolIds.current.has(a.id));
    if (available.length === 0) {
      // Reset pool if exhausted
      usedPoolIds.current.clear();
      return alertPool[Math.floor(Math.random() * alertPool.length)];
    }
    return available[Math.floor(Math.random() * available.length)];
  };

  // Dispatch event to map event log
  const dispatchMapEvent = (message: string) => {
    window.dispatchEvent(new CustomEvent('alert-panel-action', { detail: message }));
    window.dispatchEvent(new CustomEvent('add-dashboard-notification', { detail: message }));
  };

  // Resolve alert: animate out → pop in new one
  const resolveAlert = (alertId: string, mode: 'deploy' | 'dismiss') => {
    const alert = activeAlerts.find(a => a.id === alertId);
    if (!alert) return;

    setJustResolvedId(alertId);

    dispatchMapEvent(
      mode === 'deploy'
        ? `✅ ALERT RESOLVED: Operational plan deployed for "${alert.departmentName}" — ${alert.message.slice(0, 60)}...`
        : `🗑️ ALERT DISMISSED: "${alert.departmentName}" alert cleared by operator`
    );

    if (onDismissAlert) onDismissAlert(alertId);

    // After exit animation, remove + add new
    setTimeout(() => {
      setJustResolvedId(null);
      setActiveAlerts(prev => {
        const filtered = prev.filter(a => a.id !== alertId);
        usedPoolIds.current.add(alertId);

        const next = pickNextAlert();
        if (next) {
          usedPoolIds.current.add(next.id);
          const withNew = [...filtered, next];
          // Auto-expand the new one
          setTimeout(() => setExpandedAlertId(next.id), 100);
          dispatchMapEvent(`🔔 NEW ALERT: ${next.departmentName} — ${next.message.slice(0, 70)}...`);
          return withNew;
        }
        return filtered;
      });

      // Clean up completed actions for dismissed alert
      setCompletedActions(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(k => { if (k.startsWith(alertId)) delete updated[k]; });
        return updated;
      });
    }, 400);
  };

  // Deploy sequence
  const executeDeploymentSequence = (alertItem: AIAlert) => {
    setDeployingAlertId(alertItem.id);
    setDeployStep(0);
  };

  useEffect(() => {
    if (!deployingAlertId) return;

    const timer = setInterval(() => {
      setDeployStep(prev => {
        if (prev >= 3) {
          clearInterval(timer);
          // Mark all actions complete
          const targetAlert = activeAlerts.find(a => a.id === deployingAlertId);
          if (targetAlert) {
            const updates: { [key: string]: boolean } = {};
            targetAlert.recommendedActions.forEach((_, idx) => {
              updates[`${deployingAlertId}_${idx}`] = true;
            });
            setCompletedActions(prevC => ({ ...prevC, ...updates }));
          }
          // After deploy completes: resolve the alert
          setTimeout(() => {
            setDeployingAlertId(null);
            setDeployStep(0);
            resolveAlert(deployingAlertId!, 'deploy');
          }, 1000);
          return 3;
        }
        return prev + 1;
      });
    }, 1100);

    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deployingAlertId]);

  const getSeverityColors = (severity: 'danger' | 'warning' | 'info') => {
    switch (severity) {
      case 'danger':
        return { border: '#EF4444', bg: '#FEF2F2', text: '#B91C1C', lightText: '#EF4444', iconColor: '#EF4444', badgeBg: '#FEE2E2' };
      case 'warning':
        return { border: '#F59E0B', bg: '#FFFBEB', text: '#B45309', lightText: '#F59E0B', iconColor: '#F59E0B', badgeBg: '#FEF3C7' };
      default:
        return { border: '#2563EB', bg: '#F0F9FF', text: '#1D4ED8', lightText: '#3B82F6', iconColor: '#2563EB', badgeBg: '#E0F2FE' };
    }
  };

  const deployStages = [
    "📡 Analyzing local department capacities & routes...",
    "📟 Dispatching response alerts to clinical pagers & team mobile screens...",
    "🏥 Locking diagnostic corridors and staging ICU transfers...",
    "✅ Deployment success! Operational response plan active."
  ];

  if (activeAlerts.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <CheckCircle2 size={40} color="var(--success)" style={{ marginBottom: '12px' }} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Hospital Status Normal</h3>
        <p style={{ color: 'var(--neutral-500)', fontSize: '0.9rem', marginTop: '4px' }}>
          AI engines report no active overload or workforce threats.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '30px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BellRing size={20} color="var(--primary)" />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>AI Operational Alerts</h2>
        <motion.span
          key={activeAlerts.length}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          style={{
            fontSize: '0.75rem', fontWeight: 700,
            backgroundColor: 'var(--danger-light)', color: 'var(--danger)',
            padding: '2px 8px', borderRadius: '10px'
          }}
        >
          {activeAlerts.length} Active
        </motion.span>
        <span style={{ fontSize: '0.68rem', color: '#94A3B8', marginLeft: '4px' }}>
          · Resolving an alert cycles in a new live alert
        </span>
      </div>

      <AnimatePresence mode="popLayout">
        {activeAlerts.map((alert) => {
          const colors = getSeverityColors(alert.severity);
          const isExpanded = expandedAlertId === alert.id;
          const isDeploying = deployingAlertId === alert.id;
          const isExiting = justResolvedId === alert.id;

          const totalActions = alert.recommendedActions.length;
          const finishedActions = alert.recommendedActions.filter(
            (_, idx) => completedActions[`${alert.id}_${idx}`]
          ).length;
          const progressPercent = totalActions > 0 ? (finishedActions / totalActions) * 100 : 0;

          return (
            <motion.div
              key={alert.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: isExiting ? 0 : 1, y: 0, scale: isExiting ? 0.95 : 1, x: isExiting ? 40 : 0 }}
              exit={{ opacity: 0, x: 60, scale: 0.95, transition: { duration: 0.35 } }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className={`card ${alert.severity === 'danger' ? 'pulse-danger' : ''}`}
              style={{
                borderLeft: `6px solid ${colors.border}`,
                backgroundColor: colors.bg,
                padding: '20px',
                transition: 'border-color 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* NEW badge for newly popped alerts */}
              {alertPool.find(a => a.id === alert.id) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'absolute', top: '10px', right: '42px',
                    fontSize: '0.6rem', fontWeight: 900, color: '#fff',
                    backgroundColor: '#7C3AED', padding: '2px 7px', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', gap: '3px'
                  }}
                >
                  <Sparkles size={9} /> NEW
                </motion.div>
              )}

              {/* Dismiss X button */}
              <button
                onClick={() => resolveAlert(alert.id, 'dismiss')}
                disabled={isDeploying}
                style={{
                  position: 'absolute', top: '10px', right: '10px',
                  width: '24px', height: '24px', borderRadius: '6px', border: 'none',
                  backgroundColor: 'rgba(0,0,0,0.06)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#64748B', transition: 'all 0.2s'
                }}
                onMouseOver={e => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.12)')}
                onMouseOut={e => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.06)')}
                title="Dismiss alert"
              >
                <X size={13} />
              </button>

              {/* Deploy overlay */}
              <AnimatePresence>
                {isDeploying && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      position: 'absolute', inset: 0,
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      color: '#FFFFFF', zIndex: 50,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      padding: '24px', textAlign: 'center'
                    }}
                  >
                    <Loader size={36} color="#3B82F6" style={{ animation: 'spin 1.5s linear infinite', marginBottom: '16px' }} />
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 10px 0' }}>
                      DEPLOYING OPERATIONAL RESPONSES
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '380px' }}>
                      {deployStages.map((stageText, idx) => {
                        const isActive = deployStep === idx;
                        const isPast = deployStep > idx;
                        return (
                          <div
                            key={idx}
                            style={{
                              fontSize: '0.8rem',
                              color: isActive ? '#60A5FA' : isPast ? '#10B981' : '#64748B',
                              fontWeight: isActive || isPast ? 700 : 500,
                              display: 'flex', alignItems: 'center', gap: '8px',
                              transition: 'color 0.25s'
                            }}
                          >
                            <span style={{
                              display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%',
                              backgroundColor: isActive ? '#60A5FA' : isPast ? '#10B981' : '#64748B'
                            }} />
                            {stageText}
                          </div>
                        );
                      })}
                    </div>
                    <p style={{ fontSize: '0.72rem', color: '#60A5FA', marginTop: '16px' }}>
                      This alert will auto-resolve on completion. A new alert will follow.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Alert Header */}
              <div
                onClick={() => toggleExpand(alert.id)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer', paddingRight: '30px' }}
              >
                <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                  <div style={{ color: colors.iconColor, marginTop: '2px' }}>
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: colors.text, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {alert.departmentName}
                      </span>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700,
                        backgroundColor: colors.badgeBg, color: colors.text,
                        padding: '1px 6px', borderRadius: '4px'
                      }}>
                        {alert.time}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '4px', color: 'var(--neutral-900)', margin: '4px 0 0 0' }}>
                      {alert.message}
                    </h3>
                  </div>
                </div>
                <div style={{ color: 'var(--neutral-500)', flexShrink: 0 }}>
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {/* Expandable body */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', marginTop: '16px', paddingTop: '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>

                        {/* Action checklist */}
                        <div>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--neutral-700)', margin: '0 0 12px 0' }}>
                            AI Tactical Action Plan
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {alert.recommendedActions.map((action, actionIdx) => {
                              const isChecked = !!completedActions[`${alert.id}_${actionIdx}`];
                              return (
                                <label
                                  key={actionIdx}
                                  style={{
                                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                                    fontSize: '0.88rem',
                                    color: isChecked ? 'var(--neutral-400)' : 'var(--neutral-700)',
                                    textDecoration: isChecked ? 'line-through' : 'none',
                                    cursor: 'pointer', padding: '4px 0', margin: 0
                                  }}
                                  onClick={() => {
                                    handleActionToggle(alert.id, actionIdx);
                                    if (!isChecked) {
                                      dispatchMapEvent(`☑️ ALERT TASK: "${action.slice(0, 60)}" marked complete in ${alert.departmentName}`);
                                    }
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {}}
                                    style={{ marginTop: '3px', accentColor: colors.border, cursor: 'pointer' }}
                                  />
                                  <span>{action}</span>
                                </label>
                              );
                            })}
                          </div>

                          {/* Progress bar */}
                          {totalActions > 0 && (
                            <div style={{ marginTop: '20px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-500)', marginBottom: '4px' }}>
                                <span>Action Progress</span>
                                <span>{finishedActions}/{totalActions} Done</span>
                              </div>
                              <div style={{ height: '6px', backgroundColor: 'var(--neutral-200)', borderRadius: '3px', overflow: 'hidden' }}>
                                <motion.div
                                  style={{ height: '100%', borderRadius: '3px', backgroundColor: progressPercent === 100 ? 'var(--success)' : colors.border }}
                                  animate={{ width: `${progressPercent}%` }}
                                  transition={{ duration: 0.4 }}
                                />
                              </div>
                              {progressPercent === 100 && (
                                <motion.div
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10B981', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <CheckCircle2 size={12} /> All tasks complete — ready to deploy
                                </motion.div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Impact + buttons */}
                        <div style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          backgroundColor: '#FFFFFF', border: '1px dashed rgba(37,99,235,0.15)',
                          borderRadius: '12px', padding: '20px', textAlign: 'center'
                        }}>
                          <div style={{
                            width: '72px', height: '72px', borderRadius: '50%',
                            backgroundColor: 'var(--primary-light)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--primary)', marginBottom: '12px', boxShadow: 'var(--shadow-glow)'
                          }}>
                            <Zap size={32} />
                          </div>
                          <h4 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--neutral-900)', margin: 0 }}>
                            {alert.expectedReduction}
                          </h4>
                          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--neutral-500)', margin: '2px 0 0 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Expected wait time reduction
                          </p>

                          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', width: '100%' }}>
                            <button
                              onClick={() => executeDeploymentSequence(alert)}
                              className="btn btn-primary"
                              style={{
                                flex: 1, padding: '8px 12px', fontSize: '0.78rem', boxShadow: 'none',
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                              }}
                              disabled={isDeploying}
                            >
                              <Send size={12} />
                              Deploy Plan
                            </button>
                            <button
                              onClick={() => resolveAlert(alert.id, 'dismiss')}
                              className="btn btn-secondary"
                              style={{ padding: '8px 12px', fontSize: '0.78rem', boxShadow: 'none' }}
                              disabled={isDeploying}
                            >
                              Resolve
                            </button>
                          </div>

                          <p style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: '10px', lineHeight: '1.4' }}>
                            Deploying or resolving this alert will dismiss it and queue the next live alert.
                          </p>
                        </div>

                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
