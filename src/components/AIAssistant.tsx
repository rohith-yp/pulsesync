import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Zap, Loader } from 'lucide-react';
import type { Department, Doctor, ResourceItem } from '../utils/mockData';
import { groqChat, SYSTEM_PROMPTS } from '../utils/groqClient';

interface AIAssistantProps {
  departments: Department[];
  doctors: Doctor[];
  resources: ResourceItem[];
}

interface Message {
  id: number;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  'Which department needs urgent support?',
  'Who is at burnout risk right now?',
  'Predict ICU occupancy in 2 hours.',
  'Recommend resource reallocation.',
];

const buildContextSummary = (departments: Department[], doctors: Doctor[], resources: ResourceItem[]) => {
  const criticalDepts = departments.filter(d => d.status === 'red' || d.status === 'orange').map(d => `${d.name} (${d.occupancy}% occupancy, wait: ${d.waitingTimeCurrent}min)`).join(', ');
  const criticalDocs = doctors.filter(d => d.status === 'critical' || d.status === 'warning').map(d => `${d.name} - ${d.burnoutProbability}% burnout, dept: ${d.department}`).join(', ');
  const criticalRes = resources.filter(r => r.status === 'critical' || r.status === 'warning').map(r => `${r.name}: ${r.available}/${r.total} ${r.unit}`).join(', ');

  return `LIVE HOSPITAL SNAPSHOT:
Departments at risk: ${criticalDepts || 'None critical'}
Clinicians at burnout risk: ${criticalDocs || 'All stable'}
Critical resources: ${criticalRes || 'All adequate'}
Total departments monitored: ${departments.length}
Total clinicians tracked: ${doctors.length}`;
};

export const AIAssistant: React.FC<AIAssistantProps> = ({ departments, doctors, resources }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      sender: 'assistant',
      text: '👋 I\'m PulseSync AI — your clinical operations assistant powered by Groq. Ask me anything about current hospital conditions, staff burnout risks, bed occupancy, or resource allocation.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const contextSummary = buildContextSummary(departments, doctors, resources);
      const response = await groqChat([
        { role: 'system', content: SYSTEM_PROMPTS.assistant + '\n\n' + contextSummary },
        { role: 'user', content: text.trim() },
      ]);

      const aiMsg: Message = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'assistant',
        text: '⚠️ Unable to reach Groq AI right now. Please check your connection and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setIsOpen(prev => !prev)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999,
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
          border: 'none', cursor: 'pointer', color: '#FFFFFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X size={22} /></motion.span>
            : <motion.span key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><Bot size={22} /></motion.span>
          }
        </AnimatePresence>
      </motion.button>

      {/* Notification dot */}
      {!isOpen && (
        <motion.div
          style={{ position: 'fixed', bottom: '76px', right: '28px', zIndex: 9998, width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444', border: '2px solid #FFFFFF' }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed', bottom: '96px', right: '28px', zIndex: 9998,
              width: '380px', height: '520px',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              boxShadow: '0 24px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #1E3A5F, #2563EB)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} color="#FFFFFF" />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FFFFFF' }}>PulseSync AI</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <motion.span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.3, repeat: Infinity }} />
                  Powered by Groq · llama-3.1-8b-instant
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row', gap: '8px', alignItems: 'flex-end' }}
                >
                  {msg.sender === 'assistant' && (
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Bot size={14} color="#2563EB" />
                    </div>
                  )}
                  <div style={{ maxWidth: '80%' }}>
                    <div style={{
                      padding: '10px 14px', borderRadius: msg.sender === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      backgroundColor: msg.sender === 'user' ? '#2563EB' : '#F8FAFC',
                      color: msg.sender === 'user' ? '#FFFFFF' : '#1E293B',
                      fontSize: '0.82rem', lineHeight: '1.55',
                      border: msg.sender === 'assistant' ? '1px solid #F1F5F9' : 'none',
                    }}>
                      {msg.text}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: '#94A3B8', marginTop: '3px', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>{msg.timestamp}</div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={14} color="#2563EB" />
                  </div>
                  <div style={{ padding: '10px 14px', borderRadius: '14px 14px 14px 4px', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Loader size={14} color="#2563EB" style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Analyzing hospital data…</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts */}
            {messages.length <= 1 && (
              <div style={{ padding: '0 16px 8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {QUICK_PROMPTS.map((p, i) => (
                  <button key={i} onClick={() => sendMessage(p)}
                    style={{ padding: '5px 10px', borderRadius: '20px', border: '1px solid #DBEAFE', backgroundColor: '#EFF6FF', color: '#2563EB', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '8px' }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                placeholder="Ask about hospital conditions…"
                style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.82rem', outline: 'none', backgroundColor: '#F8FAFC', color: '#1E293B' }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                style={{ width: '38px', height: '38px', borderRadius: '10px', border: 'none', backgroundColor: input.trim() && !isLoading ? '#2563EB' : '#E2E8F0', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed', transition: 'all 0.15s', flexShrink: 0 }}
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
