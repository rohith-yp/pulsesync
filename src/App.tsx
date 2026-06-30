import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';

type ScreenState = 'landing' | 'login' | 'dashboard';

function App() {
  const [screen, setScreen] = useState<ScreenState>('landing');
  const [userRole, setUserRole] = useState<string>('admin');

  const handleNavigateToLogin = () => {
    setScreen('login');
  };

  const handleNavigateToDashboard = () => {
    // Default bypass role to admin
    setUserRole('admin');
    setScreen('dashboard');
  };

  const handleLoginSuccess = (role: string) => {
    setUserRole(role);
    setScreen('dashboard');
  };

  const handleLogout = () => {
    setScreen('landing');
  };

  const handleNavigateHome = () => {
    setScreen('landing');
  };

  return (
    <>
      {screen === 'landing' && (
        <LandingPage 
          onNavigateToLogin={handleNavigateToLogin} 
          onNavigateToDashboard={handleNavigateToDashboard} 
        />
      )}
      
      {screen === 'login' && (
        <LoginPage 
          onLoginSuccess={handleLoginSuccess} 
          onNavigateHome={handleNavigateHome} 
        />
      )}
      
      {screen === 'dashboard' && (
        <Dashboard 
          userRole={userRole} 
          onLogout={handleLogout} 
        />
      )}
    </>
  );
}

export default App;
