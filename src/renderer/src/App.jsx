// App.jsx
import { useState } from 'react';
import HeroBackground from '../../components/HeroBackground';
import AuthCard from '../../components/AuthCard';
import UserFormScreen from '../../components/UserFormScreen';
import DashboardScreen from '../../screens/DashboardScreen';

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [signupData, setSignupData] = useState({ phone: '', countryCode: '' });

  // User completed signup OTP verification
  const handleSignupComplete = ({ phone, countryCode }) => {
    setSignupData({ phone, countryCode });
    setShowForm(true);
  };

  // User completed the profile form
  const handleFormComplete = (formData) => {
    console.log('Profile completed:', formData);
    setShowForm(false);
    setAuthenticated(true);
  };

  // User is already logged in (login flow)
  const handleAuthenticated = () => {
    setAuthenticated(true);
  };

  // Show Dashboard
  if (authenticated) {
    return <DashboardScreen onLogout={() => setAuthenticated(false)} />;
  }

  // Show Profile Form (after signup)
  if (showForm) {
    return (
      <UserFormScreen
        phone={signupData.phone}
        countryCode={signupData.countryCode}
        onComplete={handleFormComplete}
      />
    );
  }

  // Show Auth Card (default)
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-8">
      <HeroBackground />
      <div className="relative z-10 w-full flex items-center justify-center">
        <AuthCard
          onAuthenticated={handleAuthenticated}
          onSignupComplete={handleSignupComplete}
        />
      </div>
    </div>
  );
}