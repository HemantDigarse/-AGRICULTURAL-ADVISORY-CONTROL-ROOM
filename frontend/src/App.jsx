import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import GenerateAdvisory from './pages/GenerateAdvisory';
import AgentControlRoom from './pages/AgentControlRoom';
import AgentWorkflow from './pages/AgentWorkflow';
import CropRecommendation from './pages/CropRecommendation';
import SoilHealth from './pages/SoilHealth';
import WeatherIntelligence from './pages/WeatherIntelligence';
import IrrigationAdvisory from './pages/IrrigationAdvisory';
import PestDisease from './pages/PestDisease';
import MarketIntelligence from './pages/MarketIntelligence';
import GovernmentSchemes from './pages/GovernmentSchemes';
import ReportsHistory from './pages/ReportsHistory';
import ExpertReview from './pages/ExpertReview';
import AdminSettings from './pages/AdminSettings';
import AdvisoryReport from './pages/AdvisoryReport';
import AuthPage from './pages/AuthPage';
import { getCurrentUser } from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('agri_access_token');
    if (!token) {
      setCheckingSession(false);
      return;
    }
    getCurrentUser()
      .then((response) => setUser(response.data))
      .catch(() => {
        localStorage.removeItem('agri_access_token');
        localStorage.removeItem('agri_user');
      })
      .finally(() => setCheckingSession(false));
  }, []);

  const handleAuthenticated = (session) => {
    localStorage.setItem('agri_access_token', session.access_token);
    localStorage.setItem('agri_user', JSON.stringify(session.user));
    setUser(session.user);
  };

  const handleLogout = () => {
    localStorage.removeItem('agri_access_token');
    localStorage.removeItem('agri_user');
    setUser(null);
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-emerald-800 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-green-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthenticated={handleAuthenticated} />;
  }

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/advisory/new" element={<GenerateAdvisory />} />
        <Route path="/agents" element={<AgentControlRoom />} />
        <Route path="/agents/workflow" element={<AgentWorkflow />} />
        <Route path="/crop" element={<CropRecommendation />} />
        <Route path="/soil" element={<SoilHealth />} />
        <Route path="/weather" element={<WeatherIntelligence />} />
        <Route path="/irrigation" element={<IrrigationAdvisory />} />
        <Route path="/pest" element={<PestDisease />} />
        <Route path="/market" element={<MarketIntelligence />} />
        <Route path="/schemes" element={<GovernmentSchemes />} />
        <Route path="/reports" element={<ReportsHistory />} />
        <Route path="/expert" element={<ExpertReview />} />
        <Route path="/settings" element={<AdminSettings />} />
        <Route path="/report/:requestId" element={<AdvisoryReport />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
