import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, UserCheck } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (role: string) => void;
  onNavigateHome: () => void;
}

export const LoginPage = ({
  onLoginSuccess,
  onNavigateHome
}: LoginPageProps) => {
  // Only 2 roles: admin and dept_head
  const [selectedRole, setSelectedRole] = useState<'admin' | 'dept_head'>('admin');
  const [email, setEmail] = useState('administrator@hospital.org');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  // Helper to handle role defaults
  const handleRoleChange = (role: 'admin' | 'dept_head') => {
    setSelectedRole(role);
    if (role === 'admin') {
      setEmail('administrator@hospital.org');
    } else {
      setEmail('chief.emergency@hospital.org');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate minor network delay
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(selectedRole);
    }, 800);
  };

  return (
    <div className="login-container">
      {/* LEFT SIDE: Brand Pitch & Security Badges (inspired by Karnataka Police platform design) */}
      <div 
        style={{
          flex: '1.2',
          background: 'linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 8%',
          position: 'relative',
          overflow: 'hidden'
        }}
        className="login-side-panel"
      >
        {/* Background Glowing Mesh */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.15,
          backgroundImage: 'radial-gradient(circle at 20% 30%, #3B82F6 0%, transparent 50%), radial-gradient(circle at 80% 70%, #10B981 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />

        {/* Brand Logo */}
        <div 
          onClick={onNavigateHome} 
          style={{ display: 'inline-flex', cursor: 'pointer', zIndex: 10 }}
        >
          <img 
            src="/logo.png" 
            alt="PulseSync AI Logo" 
            style={{ 
              height: '110px', 
              objectFit: 'contain',
              filter: 'brightness(1.5) drop-shadow(0 0 18px rgba(56,189,248,0.5))' 
            }} 
          />
        </div>

        {/* Pitch Statement */}
        <div style={{ zIndex: 10, margin: '40px 0' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: '1.25', letterSpacing: '-1px', marginBottom: '20px' }}>
            Predict Hospital Overload <span style={{ color: '#38BDF8' }}>Before It Happens.</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#94A3B8', lineHeight: '1.6', marginBottom: '36px', maxWidth: '500px' }}>
            PulseSync AI is an AI-powered Hospital Workforce Intelligence & Resource Optimization Platform that forecasts patient surges, alerts operational bottlenecks, and mitigates staff burnout.
          </p>

          {/* Core Feature Badges */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '36px' }}>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', padding: '8px 16px', borderRadius: '30px', fontSize: '0.82rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></span> AI-Powered Analysis
            </span>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', padding: '8px 16px', borderRadius: '30px', fontSize: '0.82rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3B82F6' }}></span> Real-time Intelligence
            </span>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', padding: '8px 16px', borderRadius: '30px', fontSize: '0.82rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }}></span> Secure & Encrypted
            </span>
          </div>

          {/* Bottom Indicators */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.85rem', color: '#94A3B8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10B981', fontSize: '0.6rem' }}>●</span> SSL Encrypted
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10B981', fontSize: '0.6rem' }}>●</span> Role-Based Access
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10B981', fontSize: '0.6rem' }}>●</span> HIPAA Compliant
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10B981', fontSize: '0.6rem' }}>●</span> Audit Logged
            </div>
          </div>
        </div>

        {/* Footer Attribution */}
        <div style={{ zIndex: 10, fontSize: '0.78rem', color: '#64748B' }}>
          Created by Rohith Y P
        </div>
      </div>

      {/* RIGHT SIDE: Login form side */}
      <div 
        style={{
          flex: '1',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px 10%',
          position: 'relative'
        }}
      >
        {/* Back Link on Top Right (important for stacking) */}
        <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 20 }}>
          <button className="btn btn-ghost" onClick={onNavigateHome} style={{ fontSize: '0.88rem' }}>
            Back to Home
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ 
            width: '100%', 
            maxWidth: '440px', 
            padding: '40px',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid var(--neutral-200)',
            boxShadow: '0 20px 40px -15px rgba(15,23,42,0.05), 0 15px 30px -10px rgba(0,0,0,0.02)'
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--neutral-900)', letterSpacing: '-0.5px' }}>
              Welcome back
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--neutral-500)', marginTop: '4px' }}>
              Sign in to your clinical intelligence account
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            

            {/* Operational Role Selection Tabs (Only 2 roles now!) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--neutral-600)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Operational Role
              </label>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '8px', 
                backgroundColor: 'var(--neutral-100)', 
                padding: '4px', 
                borderRadius: 'var(--border-radius-md)' 
              }}>
                {[
                  { id: 'admin', label: 'Hospital Administrator' },
                  { id: 'dept_head', label: 'Department Head' }
                ].map(role => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleChange(role.id as any)}
                    style={{
                      padding: '10px 4px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: selectedRole === role.id ? '#FFFFFF' : 'transparent',
                      color: selectedRole === role.id ? 'var(--primary)' : 'var(--neutral-600)',
                      boxShadow: selectedRole === role.id ? 'var(--shadow-sm)' : 'none'
                    }}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Email Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="email" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--neutral-700)' }}>
                Username / Email
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)' }}>
                  <Mail size={16} />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter email address"
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 38px',
                    borderRadius: 'var(--border-radius-md)',
                    border: '1px solid var(--neutral-300)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--neutral-300)'}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="password" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--neutral-700)' }}>
                  Password
                </label>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }}>
                  Forgot?
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)' }}>
                  <Lock size={16} />
                </span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 38px',
                    borderRadius: 'var(--border-radius-md)',
                    border: '1px solid var(--neutral-300)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--neutral-300)'}
                />
              </div>
            </div>

            {/* Automatic role detection banner */}
            <div style={{ fontSize: '0.78rem', color: '#0369A1', backgroundColor: '#F0F9FF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #BAE6FD', lineHeight: '1.4' }}>
              🔒 Role is detected automatically after sign in. Authorized personnel only.
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isLoading}
              style={{ padding: '14px', width: '100%', marginTop: '10px' }}
            >
              {isLoading ? (
                <span>Authorizing Security Passkey...</span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  Secure Login <UserCheck size={18} />
                </span>
              )}
            </button>
          </form>

          {/* Demo Credentials Section */}
          <div style={{ marginTop: '28px', borderTop: '1px solid var(--neutral-200)', paddingTop: '20px' }}>
            <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--neutral-500)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>
              DEMO CREDENTIALS (CLICK TO AUTOFILL)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                type="button" 
                onClick={() => handleRoleChange('admin')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--neutral-50)',
                  border: '1px solid var(--neutral-200)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--neutral-100)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--neutral-50)'}
              >
                <span style={{ fontWeight: 600 }}>Administrator:</span>
                <span style={{ color: 'var(--primary)' }}>administrator@hospital.org</span>
              </button>
              <button 
                type="button" 
                onClick={() => handleRoleChange('dept_head')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--neutral-50)',
                  border: '1px solid var(--neutral-200)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--neutral-100)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--neutral-50)'}
              >
                <span style={{ fontWeight: 600 }}>Department Head:</span>
                <span style={{ color: 'var(--primary)' }}>chief.emergency@hospital.org</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
