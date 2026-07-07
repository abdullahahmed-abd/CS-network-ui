import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import HeroBackground from '../../components/HeroBackground';
import AuthCard from '../../components/AuthCard';
import DashboardScreen from '../../screens/DashboardScreen';
import OAuthCallback from '../../screens/OAuthCallback';

function AuthScreen() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-8">
      <HeroBackground />
      <div className="relative z-10 w-full flex items-center justify-center">
        <AuthCard onAuthenticated={() => {}} />
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem('cs_isLoggedIn') === 'true';
  return isLoggedIn ? children : <Navigate to="/" replace />;
}

function DashboardRoute() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('cs_accessToken');
    localStorage.removeItem('cs_refreshToken');
    localStorage.removeItem('cs_isLoggedIn');
    localStorage.removeItem('cs_userId');
    localStorage.removeItem('cs_userData');
    sessionStorage.removeItem('pending_google_user');
    navigate('/', { replace: true });
  };

  return <DashboardScreen onLogout={handleLogout} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthScreen />} />
        
        {/* Both variations supported */}
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRoute />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}