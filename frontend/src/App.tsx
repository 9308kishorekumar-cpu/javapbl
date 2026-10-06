import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { CatalogPage } from './pages/CatalogPage';
import { HealthPage } from './pages/HealthPage';
import { MemberDashboardPage } from './pages/MemberDashboardPage';
import { CirculationPage } from './pages/CirculationPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AdminPage } from './pages/AdminPage';
import { MemberDetailPage } from './pages/MemberDetailPage';
import { AiAssistantModal } from './components/AiAssistantModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './services/api';
import { HealthData } from './types';

const AppRoutes: React.FC<{ health: HealthData | null; loading: boolean; error: string | null; fetchHealth: () => void }> = ({
  health,
  loading,
  error,
  fetchHealth,
}) => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Opening Page: LoginPage when unauthenticated, CatalogPage when authenticated */}
      <Route path="/" element={isAuthenticated ? <CatalogPage /> : <LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/overview" element={<HomePage health={health} loading={loading} />} />
      <Route path="/dashboard" element={<MemberDashboardPage />} />
      <Route path="/my-loans" element={<MemberDashboardPage />} />
      <Route path="/circulation" element={<CirculationPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/librarian/members/:id" element={<MemberDetailPage />} />
      <Route path="/members/:id" element={<MemberDetailPage />} />
      <Route
        path="/health"
        element={
          <HealthPage
            health={health}
            loading={loading}
            onRefresh={fetchHealth}
            error={error}
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getHealth();
      if (res.success && res.data) {
        setHealth(res.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch system health:', err);
      setError(err?.message || 'Unable to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const backendStatus = loading && !health ? 'LOADING' : health?.status === 'UP' ? 'UP' : 'DOWN';

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 relative">
          <Navbar backendStatus={backendStatus} />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <AppRoutes health={health} loading={loading} error={error} fetchHealth={fetchHealth} />
          </main>

          {/* Floating AI Assistant Trigger Button */}
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs shadow-2xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/10 group"
          >
            <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Ask LibraAI Assistant</span>
          </button>

          {/* Global AI Assistant Modal */}
          <AiAssistantModal
            isOpen={isAiModalOpen}
            onClose={() => setIsAiModalOpen(false)}
          />

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
